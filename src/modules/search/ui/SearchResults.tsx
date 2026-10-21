import { Link } from 'react-router-dom';
import type { FileTree, TreeNode } from '@/modules/file-tree';
import { useCurrentNodePath } from '@/shared/routing/useCurrentNodePath';
import { useNodeHref } from '@/shared/routing/useNodeHref';
import { FileIcon, FolderIcon, SearchIcon } from '@/shared/ui/icons';
import { HighlightedName } from './HighlightedName';
import styles from './Search.module.css';

const MAX_VISIBLE_RESULTS = 200;

const summarize = (total: number, visible: number): string => {
  if (total > visible) return `First ${visible} of ${total} matches`;
  return `${total} ${total === 1 ? 'match' : 'matches'}`;
};

type SearchResultsProps = {
  readonly tree: FileTree;
  readonly query: string;
};

export const SearchResults = ({ tree, query }: SearchResultsProps) => {
  const nodeHref = useNodeHref();
  const currentPath = useCurrentNodePath();
  const hits = tree.search(query);

  if (hits.length === 0) {
    return (
      <div className={styles.empty}>
        <SearchIcon size={22} />
        <p>No nodes match "{query.trim()}".</p>
      </div>
    );
  }

  const visibleHits = hits.slice(0, MAX_VISIBLE_RESULTS);
  const parentPath = (node: TreeNode): string => {
    const fullPath = tree.fullPath(node.path);
    return fullPath.slice(0, fullPath.length - node.name.length);
  };

  return (
    <section aria-label="Search" className={styles.section}>
      <p className={styles.summary}>{summarize(hits.length, visibleHits.length)}</p>
      <ul aria-label="Search results" className={styles.results}>
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
                  <HighlightedName name={node.name} query={query} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
