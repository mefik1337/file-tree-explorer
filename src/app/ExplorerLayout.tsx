import { Outlet } from 'react-router-dom';
import { useFileTree } from '@/modules/file-tree';
import { SearchBox, SearchResults, useSearchQuery } from '@/modules/search';
import { TreeView } from '@/modules/tree-browser';
import { NoTreeLoaded } from '@/modules/tree-import';
import { useCurrentNodePath } from '@/shared/routing/useCurrentNodePath';

export const ExplorerLayout = () => {
  const { tree } = useFileTree();
  const selectedPath = useCurrentNodePath();
  const [query, setQuery] = useSearchQuery();

  if (tree === null) return <NoTreeLoaded />;

  const searching = query.trim() !== '';
  return (
    <div>
      <aside>
        <SearchBox query={query} onQueryChange={setQuery} />
        {searching && <SearchResults tree={tree} query={query} />}
        <nav aria-label="File tree" hidden={searching}>
          <TreeView root={tree.root} selectedPath={selectedPath} />
        </nav>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
};
