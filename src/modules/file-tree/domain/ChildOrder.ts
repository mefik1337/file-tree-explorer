import type { TreeNode } from './TreeNode';

export const CHILD_ORDERS = ['original', 'name', 'size'] as const;

export type ChildOrder = (typeof CHILD_ORDERS)[number];

const nameCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

const foldersFirst = (left: TreeNode, right: TreeNode): number =>
  left.kind === right.kind ? 0 : left.kind === 'folder' ? -1 : 1;

const byName = (left: TreeNode, right: TreeNode): number => nameCollator.compare(left.name, right.name);

export const orderNodes = (
  nodes: readonly TreeNode[],
  order: ChildOrder,
  sizeOf: (node: TreeNode) => number,
): readonly TreeNode[] => {
  if (order === 'original') return nodes;
  const compare =
    order === 'name'
      ? (left: TreeNode, right: TreeNode) => foldersFirst(left, right) || byName(left, right)
      : (left: TreeNode, right: TreeNode) =>
          foldersFirst(left, right) || sizeOf(right) - sizeOf(left) || byName(left, right);
  return [...nodes].sort(compare);
};
