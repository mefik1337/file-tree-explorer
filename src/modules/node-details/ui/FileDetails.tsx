import { formatFileSize, type FileNode, type FileTree } from '@/modules/file-tree';
import styles from './NodeDetails.module.css';
import { PathBar } from './PathBar';

type FileDetailsProps = {
  readonly tree: FileTree;
  readonly file: FileNode;
};

export const FileDetails = ({ tree, file }: FileDetailsProps) => (
  <article className={styles.card}>
    <PathBar tree={tree} node={file} />
    <p className={styles.kind}>File</p>
    <h1 className={styles.title}>{file.name}</h1>
    <dl className={styles.facts}>
      <dt>Size</dt>
      <dd>{formatFileSize(file.size)}</dd>
      <dt>Full path</dt>
      <dd>{tree.fullPath(file.path)}</dd>
    </dl>
  </article>
);
