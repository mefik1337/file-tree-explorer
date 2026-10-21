import { Link } from 'react-router-dom';
import { ancestorPaths, type FileTree, type TreeNode } from '@/modules/file-tree';
import { useNodeHref } from '@/shared/routing/useNodeHref';

type PathBarProps = {
  readonly tree: FileTree;
  readonly node: TreeNode;
};

export const PathBar = ({ tree, node }: PathBarProps) => {
  const nodeHref = useNodeHref();
  const ancestors = node === tree.root ? [] : [tree.root, ...ancestorPaths(node.path).flatMap((path) => tree.find(path) ?? [])];

  return (
    <nav aria-label="Path">
      <ol>
        {ancestors.map((ancestor) => (
          <li key={ancestor.path}>
            <Link to={nodeHref(ancestor.path)}>{ancestor.name}</Link>
          </li>
        ))}
        <li>
          <span aria-current="page">{node.name}</span>
        </li>
      </ol>
    </nav>
  );
};
