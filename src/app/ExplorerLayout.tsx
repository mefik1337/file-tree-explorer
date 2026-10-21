import { Link, Outlet } from 'react-router-dom';
import { useFileTree } from '@/modules/file-tree';
import { SearchBox, SearchResults, useSearchQuery } from '@/modules/search';
import { TreeView } from '@/modules/tree-browser';
import { NoTreeLoaded } from '@/modules/tree-import';
import { paths } from '@/shared/routing/paths';
import { useCurrentNodePath } from '@/shared/routing/useCurrentNodePath';
import buttons from '@/shared/ui/Button.module.css';
import { AppIcon, WarningIcon } from '@/shared/ui/icons';
import styles from './ExplorerLayout.module.css';

export const ExplorerLayout = () => {
  const { tree, persisted } = useFileTree();
  const selectedPath = useCurrentNodePath();
  const [query, setQuery] = useSearchQuery();

  if (tree === null) return <NoTreeLoaded />;

  const searching = query.trim() !== '';
  return (
    <div className={styles.shell}>
      <header className={styles.navBar}>
        <Link className={styles.brand} to={paths.home}>
          <AppIcon size={26} />
          FileTree Explorer
          <span className={styles.treeName}>· {tree.root.name}</span>
        </Link>
        <Link className={`${buttons.button} ${buttons.secondary} ${buttons.small}`} to={paths.home}>
          Load another tree
        </Link>
      </header>
      {!persisted && (
        <p role="status" className={styles.notice}>
          <WarningIcon className={styles.noticeIcon} />
          This tree is too large to be saved in the browser and will be lost after a refresh.
        </p>
      )}
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <SearchBox query={query} onQueryChange={setQuery} />
          {searching && <SearchResults tree={tree} query={query} />}
          <nav aria-label="File tree" hidden={searching}>
            <TreeView root={tree.root} selectedPath={selectedPath} />
          </nav>
        </aside>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
