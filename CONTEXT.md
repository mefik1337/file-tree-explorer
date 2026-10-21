# CONTEXT — FileTree Explorer

## Ubiquitous language

| Term | Meaning |
|---|---|
| **File Tree** | Aggregate root. An immutable, validated directory structure imported from a JSON snapshot. The single source of truth for all queries. |
| **Tree Snapshot** | The external JSON shape (`{ name, type, size?, children? }`) used for import and persistence. |
| **Node** | Either a **File** or a **Folder** inside a File Tree. |
| **File** | Leaf node with a **File Size**. |
| **Folder** | Node with ordered **children**. May be empty. |
| **Root** | The top Folder. Its Node Path is empty. |
| **Node Path** | Value object: names from the Root (exclusive) to a Node, joined with `/`, e.g. `src/components/Button.tsx`. Unique per Node. |
| **Full Path** | Node Path prefixed with the Root's name, shown to users, e.g. `root/src/components/Button.tsx`. |
| **File Size** | Value object: non-negative byte count, formatted as B / KB / MB (base 1024). |
| **Subtree Size** | Total File Size of all Files under a Folder. |
| **Search** | Case-insensitive substring match on Node names across the whole File Tree. |
| **Search Query** | The user's search text; lives in the URL (`?q=`) so results survive a page refresh. |
| **Tree Repository** | Port for persisting the current File Tree between page loads. |

## Invariants enforced on import

- Node `name` is a non-empty string without `/`.
- Sibling names are unique (otherwise Node Paths would be ambiguous).
- `type` is `"file"` or `"folder"`; the Root must be a Folder.
- File `size` is a finite, non-negative number.
- Folder `children` is an array.

## Test seams

1. **`file-tree` domain public API**: `FileTree.fromSnapshot`, tree queries (`find`, `subtreeSize`, `search`, `fullPath`), `formatFileSize`, `importFileTree` (JSON text in, Result out).
2. **Tree Repository adapter**: save → load round-trip on `localStorage`.
3. **Application through the UI**: `<AppRoutes>` rendered in a router, exercised by the user: import, tree expand/collapse, node details, search, refresh resilience.
