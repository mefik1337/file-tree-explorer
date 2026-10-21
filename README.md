# FileTree Explorer

Moduł wewnętrznego narzędzia developerskiego: użytkownik wkleja lub wgrywa plik JSON opisujący strukturę katalogów, a aplikacja wizualizuje ją jako drzewo i pozwala po niej nawigować.

## Uruchomienie

Wymagany Node.js 18+.

```bash
npm install && npm run dev
```

| Skrypt | Opis |
|---|---|
| `npm run dev` | serwer deweloperski Vite |
| `npm test` | wszystkie testy (Vitest + Testing Library) |
| `npm run test:watch` | testy w trybie watch |
| `npm run typecheck` | sprawdzenie typów (TypeScript strict) |
| `npm run build` | typecheck + build produkcyjny |

## Funkcjonalności

| Ścieżka | Widok |
|---|---|
| `/` | Import: wklejenie JSON, wgranie pliku `.json` albo wstawienie przykładu. Błędy walidacji wskazują dokładne miejsce problemu (np. `root/src/deep/x.ts: "size" must be a non-negative number`). |
| `/tree` | Drzewo z rozwijaniem/zwijaniem folderów + szczegóły roota. |
| `/tree/:nodePath` | Szczegóły węzła; `nodePath` to ścieżka zakodowana `encodeURIComponent`, np. `/tree/src%2Fcomponents%2FButton.tsx`. Adres wpisany „ręcznie” ze zwykłymi ukośnikami (`/tree/src/components/Button.tsx`) jest przekierowywany na postać kanoniczną. |

- **Plik:** nazwa, rozmiar (B / KB / MB, podstawa 1024), pełna ścieżka od roota.
- **Folder:** nazwa, liczba bezpośrednich dzieci, łączny rozmiar plików w poddrzewie, lista dzieci z linkami (z rozmiarem / liczbą elementów).
- **Wyszukiwanie:** po nazwie (bez rozróżniania wielkości liter, dopasowanie fragmentu) w całym drzewie, wyniki z pełną ścieżką i podświetlonym dopasowaniem. Zapytanie żyje w URL (`?q=`), więc wyniki przetrwają odświeżenie strony, działają wstecz/dalej i można je udostępnić linkiem. Nawigacja po szczegółach zachowuje aktywne wyszukiwanie.
- Wczytane drzewo jest zapamiętywane w `localStorage` — odświeżenie dowolnego widoku nie wymaga ponownego importu.
- Otwarcie szczegółów węzła rozwija w drzewie wszystkich jego przodków i zaznacza go.

## Decyzje architektoniczne

### Modularny monolit + DDD

```
src/
├── app/                      # composition root: routing, layout eksploratora, strona 404
├── modules/
│   ├── file-tree/            # rdzeń domeny (bounded context „File Tree”)
│   │   ├── domain/           # agregat FileTree, węzły, NodePath, FileSize — czysty TS, bez Reacta
│   │   ├── application/      # przypadek użycia importFileTree, port TreeRepository
│   │   ├── infrastructure/   # adapter localStorage dla TreeRepository
│   │   ├── ui/               # FileTreeProvider / useFileTree (most do Reacta)
│   │   └── index.ts          # publiczne API modułu
│   ├── tree-import/          # strona importu (wklej / wgraj / przykład)
│   ├── tree-browser/         # widok drzewa z rozwijaniem i zwijaniem
│   ├── node-details/         # szczegóły pliku / folderu / „nie znaleziono”
│   └── search/               # pole wyszukiwania, wyniki, zapytanie w URL
└── shared/                   # generyczne: Result, routing (budowanie ścieżek), EmptyState
```

- Każdy moduł wystawia publiczne API przez `index.ts`; moduły funkcjonalne zależą tylko od publicznego API `file-tree`, nigdy od jego wnętrza.
- `app` jest jedynym miejscem, które składa moduły (trasy, layout). Moduły nie wiedzą o `app`, a `shared` nie wie o modułach.
- Reguły te (oraz „domena bez frameworków”, „warstwa aplikacji bez UI i infrastruktury”) są egzekwowane **testem architektury** (`src/architecture.test.ts`), który analizuje importy w kodzie źródłowym.
- Słownik pojęć domenowych (ubiquitous language) i niezmienniki opisuje [`CONTEXT.md`](./CONTEXT.md).

### Domena

- **`FileTree` to niemutowalny agregat** tworzony wyłącznie przez `FileTree.fromSnapshot(unknown)`. Walidacja odbywa się raz, na granicy („parse, don't validate”) — reszta aplikacji pracuje na typach, którym może ufać.
- **Niezmienniki:** niepusta nazwa bez `/`, unikalne nazwy rodzeństwa (inaczej ścieżki byłyby niejednoznaczne), root musi być folderem, `size` skończone i nieujemne, `children` jest tablicą.
- **Błędy jako wartości:** `Result<T, E>` zamiast wyjątków — kontrakt błędu jest widoczny w typie.
- **Indeksy liczone raz przy imporcie:** mapa `ścieżka → węzeł` (O(1) dla `/tree/:nodePath`) i rozmiary poddrzew (jedno przejście O(n)), dzięki czemu widok szczegółów nie przelicza nic przy każdym renderze.
- **Algorytmy iteracyjne** (budowa, walidacja, rozmiary, wyszukiwanie) — struktura może być dowolnie głęboka bez ryzyka przepełnienia stosu; jest na to test z głębokością 20 000.
- **NodePath** pomija nazwę roota (`src/components/Button.tsx`), **pełna ścieżka** prezentowana użytkownikowi ją zawiera (`root/src/components/Button.tsx`).

### Stan i persystencja

- **Repozytorium przechowuje źródłowy JSON**, nie zserializowany agregat. Przy starcie jest on ponownie importowany (i walidowany), więc uszkodzone dane w `localStorage` są po prostu ignorowane, a nie wywracają aplikacji. Unikamy też rekurencyjnego `JSON.stringify` na bardzo głębokim drzewie.
- Gdy przeglądarka odmówi zapisu (limit ~5 MB), drzewo działa w pamięci, a użytkownik dostaje komunikat, że nie przetrwa odświeżenia.
- **URL jest źródłem prawdy dla nawigacji i wyszukiwania** (`/tree/:nodePath?q=…`). Dzięki temu „odporność na odświeżenie” nie wymaga dodatkowego mechanizmu, a linki są współdzielone.
- Stan rozwinięcia folderów żyje w layoucie trasy `/tree`, więc nie ginie przy przechodzeniu między szczegółami węzłów.
- Repozytorium jest wstrzykiwane (`<AppShell repository={…}>`), więc testy i ewentualna zmiana nośnika (np. IndexedDB) nie dotykają reszty kodu.

### Routing

- React Router v6 z włączonymi flagami `v7_startTransition` i `v7_relativeSplatPath` (gotowość na migrację do v7, brak ostrzeżeń).
- Cała ścieżka węzła jest kodowana jednym `encodeURIComponent`, dzięki czemu mieści się w jednym segmencie `:nodePath` i poprawnie obsługuje znaki specjalne (`#`, `?`, `%`, `&`, spacje) — pokryte testem.

### UI i stylowanie

- CSS Modules + zmienne CSS (motyw jasny/ciemny wg `prefers-color-scheme`), układ responsywny.
- Semantyka i dostępność: wzorzec ARIA `tree`/`treeitem`/`group` z `aria-expanded`/`aria-selected`, `role="search"`, `role="alert"` dla błędów, `role="status"` dla ostrzeżeń, lista definicji `dl` dla atrybutów węzła.

### Testy (TDD)

Kod powstawał w cyklu red → green, pionowymi plasterkami (jeden test → minimalna implementacja). Testy działają na trzech uzgodnionych seamach, przez publiczne interfejsy:

1. **Publiczne API domeny `file-tree`**: walidacja snapshotu, `find`, `subtreeSize`, `fullPath`, `search`, `formatFileSize`, `importFileTree`.
2. **Adapter repozytorium**: zapis → odczyt po „przeładowaniu”, czyszczenie, odmowa zapisu.
3. **Aplikacja przez UI**: cały `AppShell` w `MemoryRouter`, interakcje przez `user-event`, zapytania po rolach i nazwach dostępnościowych; odświeżenie strony symulowane przez odmontowanie i ponowne wyrenderowanie aplikacji na tym samym URL i `localStorage`.

Nie mockujemy własnych modułów — jedyną podmienianą granicą jest `Storage` przeglądarki (do zasymulowania przekroczenia limitu).

### Wersje

- Vite 6 / Vitest 3 zamiast Vite 7, ponieważ Vite 7 wymaga Node 20.19+, a wymaganiem jest Node 18+.
- React 18, TypeScript w trybie `strict` z dodatkowymi flagami (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals` …).

## Co zrobiłbym, mając więcej czasu

- **Wirtualizacja drzewa** (spłaszczenie widocznych węzłów + `react-window`) dla folderów z dziesiątkami tysięcy dzieci.
- **Pełna obsługa klawiatury** wg wzorca WAI-ARIA Tree View (strzałki, Home/End, roving tabindex, type-ahead), także w wynikach wyszukiwania.
- **Web Worker** do parsowania i indeksowania dużych plików JSON, żeby nie blokować głównego wątku; **IndexedDB** zamiast `localStorage` dla drzew > 5 MB.
- Zapamiętywanie stanu rozwinięcia folderów (np. `sessionStorage`) między odświeżeniami.
- Rozbudowa wyszukiwania: debounce, wyszukiwanie po ścieżce, filtrowanie po typie, wyszukiwanie rozmyte, nawigacja klawiaturą.
- Sortowanie dzieci (foldery najpierw, po nazwie / rozmiarze), breadcrumbs w widoku szczegółów, przeciągnij-i-upuść pliku na stronę importu.
- ESLint (z `eslint-plugin-boundaries` jako uzupełnienie testu architektury) + Prettier, CI na GitHub Actions, testy E2E w Playwright (prawdziwe odświeżenie przeglądarki, upload pliku).
- Synchronizacja między kartami przez zdarzenie `storage`.

## Znane ograniczenia

- Drzewo zapisywane jest w `localStorage` (limit zależny od przeglądarki, zwykle ~5 MB). Większe drzewa działają, ale nie przetrwają odświeżenia — aplikacja wyraźnie o tym informuje.
- Na raz wczytane jest jedno drzewo; import w jednej karcie nie aktualizuje innych otwartych kart do czasu ich odświeżenia.
- Widok drzewa nie jest wirtualizowany: folder z bardzo dużą liczbą bezpośrednich dzieci lub ręczne rozwinięcie tysięcy poziomów będzie renderować się wolno. Domena obsługuje dowolną głębokość, ale ekstremalnie głębokie zagnieżdżenie DOM jest kosztowne dla przeglądarki.
- Bardzo duże lub ekstremalnie głęboko zagnieżdżone JSON-y mogą przekroczyć możliwości `JSON.parse` danego silnika — zostaną wtedy zgłoszone jako niepoprawny JSON.
- Wyświetlanych jest maksymalnie 200 pierwszych wyników wyszukiwania (z informacją o łącznej liczbie trafień).
- Rodzeństwo o identycznych nazwach jest odrzucane przy imporcie (świadoma decyzja — inaczej ścieżki byłyby niejednoznaczne). Nazwy nie mogą zawierać `/`.
- Rozmiary formatowane są w B / KB / MB z podstawą 1024 (zgodnie z wymaganiem); wartości powyżej 1024 MB pozostają w MB.
- Stan rozwinięcia folderów nie jest zapamiętywany po odświeżeniu (automatycznie rozwijani są tylko przodkowie aktualnie otwartego węzła).
- Interfejs jest po angielsku (typowo dla narzędzi developerskich); brak i18n.
