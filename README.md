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
| `npm run generate:large-tree` | regenerate `examples/large-tree.json` |

### Large example tree

[`examples/large-tree.json`](./examples/large-tree.json) is a realistic monorepo of ~29,000 nodes (≈23,400 files, ≈5,700 folders, 1.4 MB) for trying the app at scale. It includes a `node_modules` folder with 1,400 direct children, a chain nested 120 levels deep, an empty folder and a 1.8 MB lock file. Upload it on the import page or drop it onto the form. It is produced by a deterministic generator ([`scripts/generate-large-tree.mjs`](./scripts/generate-large-tree.mjs)), so it can be regenerated or adapted.

Measured in headless Chrome on the dev server: restoring and rendering the tree takes ~0.6 s, a search over the whole tree ~0.3 s. Expanding the 1,400-child folder takes ~30 ms, because the virtualized tree keeps only ~40 rows in the DOM.

## Features

| Route | View |
|---|---|
| `/` | Import: paste JSON, upload or drag-and-drop a `.json` file, or insert an example. Validation errors point at the exact location of the problem (e.g. `root/src/deep/x.ts: "size" must be a non-negative number`). |
| `/tree` | Tree with expandable/collapsible folders (or a Finder-like column view), plus details of the root. |
| `/tree/:nodePath` | Node details; `nodePath` is the path encoded with `encodeURIComponent`, e.g. `/tree/src%2Fcomponents%2FButton.tsx`. An address typed by hand with plain slashes (`/tree/src/components/Button.tsx`) is redirected to the canonical form. |

- **File:** name, size (B / KB / MB, base 1024), full path from the root.
- **Path bar:** every details view starts with a Finder-like path bar linking to each ancestor.
- **Folder:** name, number of direct children, total size of all files in the subtree, list of children with links (showing size / item count).
- **Search:** by name (case-insensitive substring match) across the whole tree; a query containing `/` matches full paths instead (`features/button/` lists everything below that folder). Results show the full path with the match highlighted and can be narrowed to files or folders. The query and the filter live in the URL (`?q=…&type=file`), so results survive a page refresh, work with back/forward and can be shared as a link. Navigating between node details keeps the active search; arrow keys move between the field and the results, `Escape` clears the search.
- **Keyboard:** the tree follows the WAI-ARIA Tree View pattern: `↑`/`↓` move, `→` expands or steps into a folder, `←` collapses or goes to the parent, `Home`/`End`, `Enter` opens the details, typing the start of a name jumps to it.
- **Large trees:** the tree is virtualized: visible nodes are flattened into rows and only the rows in the viewport are rendered, so folders with thousands of children stay instant.
- **Column view:** a List / Columns switch shows one column per folder on the way to the selected node, with its details as a preview column.
- **Sorting:** as imported, by name (folders first, natural number order) or by size (folders first, largest first, folders measured by their subtree). Applies to the tree, the columns and folder children.
- **Appearance:** System / Light / Dark switch.
- The loaded tree is remembered in `localStorage`, appearance, sort order and view mode as preferences, expanded folders in `sessionStorage` — refreshing any view restores all of it.
- Opening a node's details expands all of its ancestors in the tree and scrolls it into view.

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
│   ├── tree-browser/         # virtualized tree, keyboard navigation, remembered expansion
│   ├── column-browser/       # Finder-like column view
│   ├── node-details/         # file / folder / "not found" details, path bar
│   ├── search/               # search box, results, query and filter kept in the URL
│   └── preferences/          # appearance, sort order, view mode (own repository port + localStorage adapter)
└── shared/                   # generic: Result, routing (path building), SegmentedControl, icons, EmptyState
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
- **Child order is a domain rule** (`orderedChildren`): folders first, natural name comparison via `Intl.Collator`, size measured by subtree, so the tree, the columns and folder details always agree.
- **Iterative algorithms** (building, validation, sizes, search) — the structure can be arbitrarily deep without risking a stack overflow; a test covers a depth of 20,000.
- **NodePath** excludes the root name (`src/components/Button.tsx`); the **full path** shown to users includes it (`root/src/components/Button.tsx`).

### State and persistence

- **The repository stores the source JSON**, not a serialized aggregate. On startup it is imported (and validated) again, so corrupted data in `localStorage` is simply ignored instead of crashing the app. It also avoids a recursive `JSON.stringify` on a very deep tree.
- When the browser refuses to save (the ~5 MB limit), the tree keeps working in memory and the user is told it will not survive a refresh.
- **The URL is the source of truth for navigation and search** (`/tree/:nodePath?q=…`). Surviving a refresh needs no extra mechanism, and links can be shared.
- Folder expansion state lives in the `/tree` layout route and is mirrored to `sessionStorage`, so it survives both navigation and a refresh of the tab.
- Preferences are a separate module with its own port, applied to `<html data-theme>`; a tiny inline script in `index.html` applies the stored theme before the first paint, so there is no flash of the wrong theme.
- The repository is injected (`<AppShell repository={…}>`), so tests and a possible storage change (e.g. IndexedDB) do not touch the rest of the code.

### Routing

- React Router v6 with the `v7_startTransition` and `v7_relativeSplatPath` flags enabled (ready for a v7 migration, no warnings).
- The whole node path is encoded with a single `encodeURIComponent`, so it fits into one `:nodePath` segment and handles special characters (`#`, `?`, `%`, `&`, spaces) correctly — covered by a test.

### UI and styling

- Apple-style design language: apple.com neutrals (`#1d1d1f`, `#f5f5f7`, `#6e6e73`), one blue accent, translucent "glass" materials (`backdrop-filter: blur(36px) saturate(1.9)` with a top sheen and hairline edge), spring easings sampled into CSS `linear()` curves, pill buttons with a subtle grain.
- Finder-inspired explorer: glass navigation bar, translucent source-list sidebar, pill-shaped selection, disclosure chevrons that rotate on a spring, document icons tinted by file type; details laid out like "Get Info" with iOS-style grouped lists.
- Typography: the system font on Apple devices (SF Pro), Inter elsewhere; JetBrains Mono for paths. Fonts are bundled through `@fontsource`, so nothing loads from a CDN.
- CSS Modules + CSS custom properties, light and dark themes via `prefers-color-scheme`, responsive down to phone width, `prefers-reduced-motion` respected.
- Semantics and accessibility: the tree is a flat ARIA `tree` with `aria-level`/`aria-setsize`/`aria-posinset` (what virtualization needs) and `aria-activedescendant` focus management; switches are `radiogroup`s with arrow-key support; `role="search"`, `role="alert"` for errors, `role="status"` for warnings, a `dl` definition list for node attributes.

### Virtualization and keyboard model

- Visible nodes are flattened into rows (`flattenVisibleRows`), each row has a fixed height, and only the rows inside the scroll viewport (plus an overscan) are rendered and absolutely positioned. No virtualization library is needed for fixed-height rows.
- Focus stays on the tree element and moves with `aria-activedescendant`, so the active row can be scrolled into view and rendered on demand. A roving `tabindex` would need the focused element to exist in the DOM, which a virtualized list cannot guarantee.

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

- A **Web Worker** for parsing and indexing large JSON files so the main thread is not blocked; **IndexedDB** instead of `localStorage` for trees larger than 5 MB.
- Fuzzy matching in search as an opt-in mode, and keyboard navigation inside the column view.
- ESLint (with `eslint-plugin-boundaries` alongside the architecture test) + Prettier, CI on GitHub Actions, Playwright E2E tests (real browser refresh, file upload).
- Cross-tab synchronization via the `storage` event.

## Known limitations

- The tree is stored in `localStorage` (browser-dependent limit, usually ~5 MB). Larger trees work, but will not survive a refresh — the app says so explicitly.
- Only one tree is loaded at a time; an import in one tab does not update other open tabs until they are refreshed.
- The column view is not virtualized; a single folder with tens of thousands of direct children renders slowly in that view (the list view is virtualized).
- Very large or extremely deeply nested JSON may exceed what the engine's `JSON.parse` can handle — it is then reported as invalid JSON.
- At most the first 200 search results are displayed (with the total number of matches shown).
- Siblings with identical names are rejected on import (a deliberate decision — otherwise paths would be ambiguous). Names cannot contain `/`.
- Sizes are formatted as B / KB / MB with base 1024 (as required); values above 1024 MB stay in MB.
- Expanded folders are remembered per browser tab (`sessionStorage`), not across tabs or after the tab is closed.
- The UI is in English (typical for developer tools); there is no i18n.
