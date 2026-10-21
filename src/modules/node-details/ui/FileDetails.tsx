import { formatFileSize, type FileNode, type FileTree } from '@/modules/file-tree';

type FileDetailsProps = {
  readonly tree: FileTree;
  readonly file: FileNode;
};

export const FileDetails = ({ tree, file }: FileDetailsProps) => (
  <article>
    <h1>{file.name}</h1>
    <dl>
      <dt>Size</dt>
      <dd>{formatFileSize(file.size)}</dd>
      <dt>Full path</dt>
      <dd>{tree.fullPath(file.path)}</dd>
    </dl>
  </article>
);
