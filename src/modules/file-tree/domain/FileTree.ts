import { ok, type Result } from '@/shared/lib/result';
import { buildTree, type TreeValidationError } from './buildTree';
import { PATH_SEPARATOR, ROOT_PATH } from './NodePath';
import type { FolderNode, TreeNode } from './TreeNode';

function* walkInTreeOrder(root: TreeNode): Generator<TreeNode> {
  const pending: TreeNode[] = [root];
  for (let node = pending.pop(); node; node = pending.pop()) {
    yield node;
    if (node.kind === 'folder') {
      for (let position = node.children.length - 1; position >= 0; position -= 1) {
        const child = node.children[position];
        if (child) pending.push(child);
      }
    }
  }
}

const computeSubtreeSizes = (nodesParentsFirst: readonly TreeNode[]): Map<string, number> => {
  const sizes = new Map<string, number>();

  for (let position = nodesParentsFirst.length - 1; position >= 0; position -= 1) {
    const node = nodesParentsFirst[position];
    if (!node) continue;
    const size =
      node.kind === 'file'
        ? node.size
        : node.children.reduce((total, child) => total + (sizes.get(child.path) ?? 0), 0);
    sizes.set(node.path, size);
  }

  return sizes;
};

export class FileTree {
  private constructor(
    readonly root: FolderNode,
    private readonly index: ReadonlyMap<string, TreeNode>,
    private readonly subtreeSizes: ReadonlyMap<string, number>,
  ) {}

  static fromSnapshot(snapshot: unknown): Result<FileTree, TreeValidationError> {
    const built = buildTree(snapshot);
    if (!built.ok) return built;

    const { root, nodesParentsFirst } = built.value;
    const index = new Map(nodesParentsFirst.map((node) => [node.path, node]));
    return ok(new FileTree(root, index, computeSubtreeSizes(nodesParentsFirst)));
  }

  find(path: string): TreeNode | undefined {
    return this.index.get(path);
  }

  subtreeSize(path: string): number {
    return this.subtreeSizes.get(path) ?? 0;
  }

  fullPath(path: string): string {
    return path === ROOT_PATH ? this.root.name : `${this.root.name}${PATH_SEPARATOR}${path}`;
  }

  search(query: string): TreeNode[] {
    const needle = query.trim().toLocaleLowerCase();
    if (needle === '') return [];

    const hits: TreeNode[] = [];
    for (const node of walkInTreeOrder(this.root)) {
      if (node.name.toLocaleLowerCase().includes(needle)) hits.push(node);
    }
    return hits;
  }
}
