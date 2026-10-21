import { Link } from 'react-router-dom';
import { useFileTree } from '@/modules/file-tree';
import { paths } from '@/shared/routing/paths';
import { TreeView } from './TreeView';

export const TreePage = () => {
  const { tree } = useFileTree();

  if (tree === null) {
    return (
      <section>
        <h1>No tree loaded</h1>
        <Link to={paths.home}>Import a tree</Link>
      </section>
    );
  }

  return <TreeView root={tree.root} />;
};
