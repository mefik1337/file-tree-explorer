export type FileNode = {
  readonly kind: 'file';
  readonly name: string;
  readonly path: string;
  readonly size: number;
};

export type FolderNode = {
  readonly kind: 'folder';
  readonly name: string;
  readonly path: string;
  readonly children: readonly TreeNode[];
};

export type TreeNode = FileNode | FolderNode;
