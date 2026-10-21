import type { ChildOrder, FileTree, TreeNode } from '@/modules/file-tree';

export type VisibleRow = {
  readonly node: TreeNode;
  readonly level: number;
  readonly setSize: number;
  readonly positionInSet: number;
  readonly parentPath: string | null;
};

export const flattenVisibleRows = (
  tree: FileTree,
  isExpanded: (path: string) => boolean,
  order: ChildOrder,
): VisibleRow[] => {
  const rows: VisibleRow[] = [];
  const toRows = (nodes: readonly TreeNode[], level: number, parentPath: string | null): VisibleRow[] =>
    nodes.map((node, index) => ({ node, level, setSize: nodes.length, positionInSet: index + 1, parentPath }));

  const pending = toRows(tree.orderedChildren(tree.root, order), 1, null).reverse();
  for (let row = pending.pop(); row; row = pending.pop()) {
    rows.push(row);
    const { node, level } = row;
    if (node.kind === 'folder' && isExpanded(node.path)) {
      pending.push(...toRows(tree.orderedChildren(node, order), level + 1, node.path).reverse());
    }
  }
  return rows;
};
