import { Link } from 'react-router-dom';
import type { FileTree, TreeNode } from '@/modules/file-tree';
import { useCurrentNodePath } from '@/shared/routing/useCurrentNodePath';
import { useNodeHref } from '@/shared/routing/useNodeHref';
import { HighlightedName } from './HighlightedName';
import styles from './Search.module.css';

const MAX_VISIBLE_RESULTS = 200;

const summarize = (total: number, visible: number): string => {
  if (total > visible) return `Showing first ${visible} of ${total} matches.`;
  return `${total} ${total === 1 ? 'match' : 'matches'}.`;
};

type SearchResultsProps = {
  readonly tree: FileTree;
  readonly query: string;
};

export const SearchResults = ({ tree, query }: SearchResultsProps) => {
  const nodeHref = useNodeHref();
  const currentPath = useCurrentNodePath();
  const hits = tree.search(query);

  if (hits.length === 0) return <p className={styles.summary}>No nodes match "{query.trim()}".</p>;

  const visibleHits = hits.slice(0, MAX_VISIBLE_RESULTS);
  const parentPath = (node: TreeNode): string => {
    const fullPath = tree.fullPath(node.path);
    return fullPath.slice(0, fullPath.length - node.name.length);
  };

  return (
    <section aria-label="Search">
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
              <span className={styles.parent}>{parentPath(node)}</span>
              <span className={styles.name}>
                <HighlightedName name={node.name} query={query} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
