import { useDeferredValue, useMemo, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import type { FileTree, TreeNode } from '@/modules/file-tree';
import { useCurrentNodePath } from '@/shared/routing/useCurrentNodePath';
import { useNodeHref } from '@/shared/routing/useNodeHref';
import { FileIcon, FolderIcon, SearchIcon } from '@/shared/ui/icons';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { HighlightedName } from './HighlightedName';
import { focusSearchInput, moveFocusAmongResults, SEARCH_RESULTS_ID } from './searchFocus';
import type { SearchKind } from './useSearchQuery';
import styles from './Search.module.css';

const MAX_VISIBLE_RESULTS = 200;

const KIND_OPTIONS: ReadonlyArray<{ value: SearchKind; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'file', label: 'Files' },
  { value: 'folder', label: 'Folders' },
];

const summarize = (total: number, visible: number): string => {
  if (total > visible) return `First ${visible} of ${total} matches`;
  return `${total} ${total === 1 ? 'match' : 'matches'}`;
};

const handleResultsKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
  const target = event.target as Element;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    moveFocusAmongResults(target, event.key === 'ArrowDown' ? 1 : -1);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    focusSearchInput();
  }
};

type SearchResultsProps = {
  readonly tree: FileTree;
  readonly query: string;
  readonly kind: SearchKind;
  readonly onKindChange: (kind: SearchKind) => void;
};

export const SearchResults = ({ tree, query, kind, onKindChange }: SearchResultsProps) => {
  const nodeHref = useNodeHref();
  const currentPath = useCurrentNodePath();
  const deferredQuery = useDeferredValue(query);
  const hits = useMemo(
    () => tree.search(deferredQuery, kind === 'all' ? {} : { kind }),
    [tree, deferredQuery, kind],
  );
  const stale = deferredQuery !== query;

  const parentPath = (node: TreeNode): string => {
    const fullPath = tree.fullPath(node.path);
    return fullPath.slice(0, fullPath.length - node.name.length);
  };

  const visibleHits = hits.slice(0, MAX_VISIBLE_RESULTS);

  return (
    <section aria-label="Search" className={styles.section} data-stale={stale || undefined}>
      <SegmentedControl label="Show" options={KIND_OPTIONS} value={kind} onChange={onKindChange} className={styles.kind} />
      {hits.length === 0 ? (
        <div className={styles.empty}>
          <SearchIcon size={22} />
          <p>No nodes match "{deferredQuery.trim()}".</p>
        </div>
      ) : (
        <>
          <p className={styles.summary}>{summarize(hits.length, visibleHits.length)}</p>
          <ul
            id={SEARCH_RESULTS_ID}
            aria-label="Search results"
            className={styles.results}
            onKeyDown={handleResultsKeyDown}
          >
            {visibleHits.map((node) => (
              <li key={node.path}>
                <Link
                  className={styles.result}
                  to={nodeHref(node.path)}
                  aria-label={tree.fullPath(node.path)}
                  aria-current={node.path === currentPath ? 'page' : undefined}
                >
                  {node.kind === 'file' ? <FileIcon name={node.name} /> : <FolderIcon />}
                  <span className={styles.label}>
                    <span className={styles.parent}>
                      <bdi>{parentPath(node)}</bdi>
                    </span>
                    <span className={styles.name}>
                      <HighlightedName name={node.name} query={deferredQuery} />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};
