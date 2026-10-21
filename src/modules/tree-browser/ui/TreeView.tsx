import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ancestorPaths, type FolderNode, type TreeNode } from '@/modules/file-tree';
import { useNodeHref } from '@/shared/routing/useNodeHref';
import { useExpandedPaths, type ExpandedPaths } from './useExpandedPaths';

type TreeItemProps = {
  readonly node: TreeNode;
  readonly expansion: ExpandedPaths;
  readonly selectedPath: string;
};

const TreeItem = ({ node, expansion, selectedPath }: TreeItemProps) => {
  const selected = node.path === selectedPath;
  const nodeHref = useNodeHref();
  const label = <Link to={nodeHref(node.path)}>{node.name}</Link>;

  if (node.kind === 'file') {
    return (
      <li role="treeitem" aria-label={node.name} aria-selected={selected}>
        {label}
      </li>
    );
  }

  const expanded = expansion.isExpanded(node.path);
  return (
    <li role="treeitem" aria-label={node.name} aria-selected={selected} aria-expanded={expanded}>
      <button
        type="button"
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${node.name}`}
        onClick={() => expansion.toggle(node.path)}
      >
        {expanded ? '▾' : '▸'}
      </button>
      {label}
      {expanded && <TreeGroup nodes={node.children} expansion={expansion} selectedPath={selectedPath} />}
    </li>
  );
};

type TreeGroupProps = {
  readonly nodes: readonly TreeNode[];
  readonly expansion: ExpandedPaths;
  readonly selectedPath: string;
};

const TreeGroup = ({ nodes, expansion, selectedPath }: TreeGroupProps) => (
  <ul role="group">
    {nodes.map((child) => (
      <TreeItem key={child.path} node={child} expansion={expansion} selectedPath={selectedPath} />
    ))}
  </ul>
);

type TreeViewProps = {
  readonly root: FolderNode;
  readonly selectedPath: string;
};

export const TreeView = ({ root, selectedPath }: TreeViewProps) => {
  const expansion = useExpandedPaths();
  const { expand } = expansion;

  useEffect(() => {
    expand(ancestorPaths(selectedPath));
  }, [expand, selectedPath]);

  return (
    <ul role="tree" aria-label={root.name}>
      {root.children.map((child) => (
        <TreeItem key={child.path} node={child} expansion={expansion} selectedPath={selectedPath} />
      ))}
    </ul>
  );
};
