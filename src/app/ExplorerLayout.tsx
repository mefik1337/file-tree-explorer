import { Link, Outlet } from 'react-router-dom';
import { ColumnBrowser } from '@/modules/column-browser';
import { useFileTree } from '@/modules/file-tree';
import { ChildOrderSwitch, ThemeSwitch, usePreferences, ViewModeSwitch } from '@/modules/preferences';
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
  const { viewMode } = usePreferences();

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
        <div className={styles.navActions}>
          <ViewModeSwitch />
          <ThemeSwitch className={styles.themeSwitch} />
          <Link className={`${buttons.button} ${buttons.secondary} ${buttons.small}`} to={paths.home}>
            Load another tree
          </Link>
        </div>
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
          {!searching && <ChildOrderSwitch className={styles.sortSwitch} />}
          {searching && (
            <div className={styles.results}>
              <SearchResults tree={tree} query={query} />
            </div>
          )}
          <nav aria-label="File tree" className={styles.treeNav} hidden={searching}>
            <TreeView tree={tree} selectedPath={selectedPath} />
          </nav>
        </aside>
        {viewMode === 'columns' ? (
          <main className={`${styles.main} ${styles.columnsMain}`}>
            <ColumnBrowser tree={tree} selectedPath={selectedPath}>
              <Outlet />
            </ColumnBrowser>
          </main>
        ) : (
          <main className={styles.main}>
            <Outlet />
          </main>
        )}
      </div>
    </div>
  );
};
