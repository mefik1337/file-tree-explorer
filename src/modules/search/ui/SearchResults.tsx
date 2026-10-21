import { Link } from 'react-router-dom';
import type { FileTree } from '@/modules/file-tree';
import { useNodeHref } from '@/shared/routing/useNodeHref';

const MAX_VISIBLE_RESULTS = 200;

type SearchResultsProps = {
  readonly tree: FileTree;
  readonly query: string;
};

export const SearchResults = ({ tree, query }: SearchResultsProps) => {
  const nodeHref = useNodeHref();
  const hits = tree.search(query);

  if (hits.length === 0) return <p>No nodes match "{query.trim()}".</p>;

  const visibleHits = hits.slice(0, MAX_VISIBLE_RESULTS);
  return (
    <section aria-label="Search">
      <p>
        {hits.length > visibleHits.length
          ? `Showing first ${visibleHits.length} of ${hits.length} matches.`
          : `${hits.length} ${hits.length === 1 ? 'match' : 'matches'}.`}
      </p>
      <ul aria-label="Search results">
        {visibleHits.map((node) => (
          <li key={node.path}>
            <Link to={nodeHref(node.path)}>{tree.fullPath(node.path)}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
