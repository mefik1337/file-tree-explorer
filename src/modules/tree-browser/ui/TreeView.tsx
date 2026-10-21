import type { FolderNode, TreeNode } from '@/modules/file-tree';
import { useExpandedPaths, type ExpandedPaths } from './useExpandedPaths';

type TreeItemProps = {
  readonly node: TreeNode;
  readonly expansion: ExpandedPaths;
};

const TreeItem = ({ node, expansion }: TreeItemProps) => {
  if (node.kind === 'file') {
    return (
      <li role="treeitem" aria-label={node.name}>
        {node.name}
      </li>
    );
  }

  const expanded = expansion.isExpanded(node.path);
  return (
    <li role="treeitem" aria-label={node.name} aria-expanded={expanded}>
      <button type="button" aria-label={`${expanded ? 'Collapse' : 'Expand'} ${node.name}`} onClick={() => expansion.toggle(node.path)}>
        {expanded ? '▾' : '▸'}
      </button>
      {node.name}
      {expanded && <TreeGroup nodes={node.children} expansion={expansion} />}
    </li>
  );
};

type TreeGroupProps = {
  readonly nodes: readonly TreeNode[];
  readonly expansion: ExpandedPaths;
};

const TreeGroup = ({ nodes, expansion }: TreeGroupProps) => (
  <ul role="group">
    {nodes.map((child) => (
      <TreeItem key={child.path} node={child} expansion={expansion} />
    ))}
  </ul>
);

type TreeViewProps = {
  readonly root: FolderNode;
};

export const TreeView = ({ root }: TreeViewProps) => {
  const expansion = useExpandedPaths();
  return (
    <ul role="tree" aria-label={root.name}>
      {root.children.map((child) => (
        <TreeItem key={child.path} node={child} expansion={expansion} />
      ))}
    </ul>
  );
};
