import { formatFileSize, type FileNode, type FileTree } from '@/modules/file-tree';
import { FileIcon } from '@/shared/ui/icons';
import styles from './NodeDetails.module.css';
import { PathBar } from './PathBar';

type FileDetailsProps = {
  readonly tree: FileTree;
  readonly file: FileNode;
};

export const FileDetails = ({ tree, file }: FileDetailsProps) => (
  <article className={styles.card}>
    <PathBar tree={tree} node={file} />
    <header className={styles.hero}>
      <FileIcon size={64} name={file.name} className={styles.heroIcon} />
      <div className={styles.heroText}>
        <p className={styles.kind}>File</p>
        <h1 className={styles.title}>{file.name}</h1>
      </div>
    </header>
    <h2 className={styles.sectionTitle}>Information</h2>
    <dl className={styles.facts}>
      <div className={styles.fact}>
        <dt>Size</dt>
        <dd>{formatFileSize(file.size)}</dd>
      </div>
      <div className={styles.fact}>
        <dt>Full path</dt>
        <dd className={styles.mono}>{tree.fullPath(file.path)}</dd>
      </div>
    </dl>
  </article>
);
