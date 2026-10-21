# FileTree Explorer

A module for an internal developer tool: the user pastes or uploads a JSON file describing a directory structure, and the app renders it as a navigable tree.

## Getting started

Requires Node.js 18+.

```bash
npm install && npm run dev
```

| Script | Description |
|---|---|
| `npm run dev` | Vite dev server |
| `npm test` | full test suite (Vitest + Testing Library) |
| `npm run test:watch` | tests in watch mode |
| `npm run typecheck` | type check (TypeScript strict) |
| `npm run build` | type check + production build |

## Features

| Route | View |
|---|---|
| `/` | Import: paste JSON, upload a `.json` file or insert an example. Validation errors point at the exact location of the problem (e.g. `root/src/deep/x.ts: "size" must be a non-negative number`). |
| `/tree` | Tree with expandable/collapsible folders, plus details of the root. |
| `/tree/:nodePath` | Node details; `nodePath` is the path encoded with `encodeURIComponent`, e.g. `/tree/src%2Fcomponents%2FButton.tsx`. An address typed by hand with plain slashes (`/tree/src/components/Button.tsx`) is redirected to the canonical form. |

- **File:** name, size (B / KB / MB, base 1024), full path from the root.
- **Folder:** name, number of direct children, total size of all files in the subtree, list of children with links (showing size / item count).
- **Search:** by name (case-insensitive substring match) across the whole tree, results show the full path with the match highlighted. The query lives in the URL (`?q=`), so results survive a page refresh, work with back/forward and can be shared as a link. Navigating between node details keeps the active search.
- The loaded tree is remembered in `localStorage` — refreshing any view does not require a new import.
- Opening a node's details expands all of its ancestors in the tree and marks it as selected.

## Architectural decisions

### Modular monolith + DDD

```
src/
├── app/                      # composition root: routing, explorer layout, 404 page
├── modules/
│   ├── file-tree/            # core domain (the "File Tree" bounded context)
│   │   ├── domain/           # FileTree aggregate, nodes, NodePath, FileSize — plain TS, no React
│   │   ├── application/      # importFileTree use case, TreeRepository port
│   │   ├── infrastructure/   # localStorage adapter for TreeRepository
│   │   ├── ui/               # FileTreeProvider / useFileTree (bridge to React)
│   │   └── index.ts          # module public API
│   ├── tree-import/          # import page (paste / upload / example)
│   ├── tree-browser/         # tree view with expand and collapse
│   ├── node-details/         # file / folder / "not found" details
│   └── search/               # search box, results, query kept in the URL
└── shared/                   # generic: Result, routing (path building), EmptyState
```

- Every module exposes its public API through `index.ts`; feature modules depend only on the public API of `file-tree`, never on its internals.
- `app` is the only place that composes modules (routes, layout). Modules know nothing about `app`, and `shared` knows nothing about modules.
- These rules (plus "domain is framework-free" and "application layer has no UI or infrastructure") are enforced by an **architecture test** (`src/architecture.test.ts`) that inspects imports in the source code.
- The domain glossary (ubiquitous language) and invariants are described in [`CONTEXT.md`](./CONTEXT.md).

### Domain

- **`FileTree` is an immutable aggregate** created only through `FileTree.fromSnapshot(unknown)`. Validation happens once, at the boundary ("parse, don't validate") — the rest of the app works with types it can trust.
- **Invariants:** non-empty name without `/`, unique sibling names (otherwise paths would be ambiguous), the root must be a folder, `size` is finite and non-negative, `children` is an array.
- **Errors as values:** `Result<T, E>` instead of exceptions — the error contract is visible in the type.
- **Indexes computed once on import:** a `path → node` map (O(1) lookup for `/tree/:nodePath`) and subtree sizes (a single O(n) pass), so the details view never recomputes anything on render.
- **Iterative algorithms** (building, validation, sizes, search) — the structure can be arbitrarily deep without risking a stack overflow; a test covers a depth of 20,000.
- **NodePath** excludes the root name (`src/components/Button.tsx`); the **full path** shown to users includes it (`root/src/components/Button.tsx`).

### State and persistence

- **The repository stores the source JSON**, not a serialized aggregate. On startup it is imported (and validated) again, so corrupted data in `localStorage` is simply ignored instead of crashing the app. It also avoids a recursive `JSON.stringify` on a very deep tree.
- When the browser refuses to save (the ~5 MB limit), the tree keeps working in memory and the user is told it will not survive a refresh.
- **The URL is the source of truth for navigation and search** (`/tree/:nodePath?q=…`). Surviving a refresh needs no extra mechanism, and links can be shared.
- Folder expansion state lives in the `/tree` layout route, so it is not lost when moving between node details.
- The repository is injected (`<AppShell repository={…}>`), so tests and a possible storage change (e.g. IndexedDB) do not touch the rest of the code.

### Routing

- React Router v6 with the `v7_startTransition` and `v7_relativeSplatPath` flags enabled (ready for a v7 migration, no warnings).
- The whole node path is encoded with a single `encodeURIComponent`, so it fits into one `:nodePath` segment and handles special characters (`#`, `?`, `%`, `&`, spaces) correctly — covered by a test.

### UI and styling

- CSS Modules + CSS custom properties (light/dark theme via `prefers-color-scheme`), responsive layout.
- Semantics and accessibility: the ARIA `tree`/`treeitem`/`group` pattern with `aria-expanded`/`aria-selected`, `role="search"`, `role="alert"` for errors, `role="status"` for warnings, a `dl` definition list for node attributes.

### Tests (TDD)

The code was written in red → green cycles, in vertical slices (one test → minimal implementation). Tests run against three agreed seams, through public interfaces:

1. **Public API of the `file-tree` domain**: snapshot validation, `find`, `subtreeSize`, `fullPath`, `search`, `formatFileSize`, `importFileTree`.
2. **Repository adapter**: save → load after a "reload", clearing, refused writes.
3. **The application through the UI**: the whole `AppShell` inside a `MemoryRouter`, interactions via `user-event`, queries by role and accessible name; a page refresh is simulated by unmounting and rendering the app again on the same URL and `localStorage`.

Our own modules are never mocked — the only boundary that gets replaced is the browser `Storage` (to simulate exceeding the quota).

### Versions

- Vite 6 / Vitest 3 instead of Vite 7, because Vite 7 requires Node 20.19+ while the requirement is Node 18+.
- React 18, TypeScript in `strict` mode with additional flags (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals` …).

## What I would do with more time

- **Tree virtualization** (flattening visible nodes + `react-window`) for folders with tens of thousands of children.
- **Full keyboard support** following the WAI-ARIA Tree View pattern (arrow keys, Home/End, roving tabindex, type-ahead), also in search results.
- A **Web Worker** for parsing and indexing large JSON files so the main thread is not blocked; **IndexedDB** instead of `localStorage` for trees larger than 5 MB.
- Remembering folder expansion state across refreshes (e.g. `sessionStorage`).
- Richer search: debounce, search by path, filtering by type, fuzzy matching, keyboard navigation.
- Sorting children (folders first, by name / size), breadcrumbs in the details view, drag-and-drop of a file onto the import page.
- ESLint (with `eslint-plugin-boundaries` alongside the architecture test) + Prettier, CI on GitHub Actions, Playwright E2E tests (real browser refresh, file upload).
- Cross-tab synchronization via the `storage` event.

## Known limitations

- The tree is stored in `localStorage` (browser-dependent limit, usually ~5 MB). Larger trees work, but will not survive a refresh — the app says so explicitly.
- Only one tree is loaded at a time; an import in one tab does not update other open tabs until they are refreshed.
- The tree view is not virtualized: a folder with a very large number of direct children, or manually expanding thousands of levels, will render slowly. The domain handles any depth, but extremely deep DOM nesting is expensive for the browser.
- Very large or extremely deeply nested JSON may exceed what the engine's `JSON.parse` can handle — it is then reported as invalid JSON.
- At most the first 200 search results are displayed (with the total number of matches shown).
- Siblings with identical names are rejected on import (a deliberate decision — otherwise paths would be ambiguous). Names cannot contain `/`.
- Sizes are formatted as B / KB / MB with base 1024 (as required); values above 1024 MB stay in MB.
- Folder expansion state is not remembered after a refresh (only the ancestors of the currently opened node are expanded automatically).
- The UI is in English (typical for developer tools); there is no i18n.
