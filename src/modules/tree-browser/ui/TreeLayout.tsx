import { Link, Outlet } from 'react-router-dom';
import { useFileTree } from '@/modules/file-tree';
import { paths } from '@/shared/routing/paths';
import { useCurrentNodePath } from '@/shared/routing/useCurrentNodePath';
import { TreeView } from './TreeView';

export const TreeLayout = () => {
  const { tree } = useFileTree();
  const selectedPath = useCurrentNodePath();

  if (tree === null) {
    return (
      <section>
        <h1>No tree loaded</h1>
        <Link to={paths.home}>Import a tree</Link>
      </section>
    );
  }

  return (
    <div>
      <nav aria-label="File tree">
        <TreeView root={tree.root} selectedPath={selectedPath} />
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};
