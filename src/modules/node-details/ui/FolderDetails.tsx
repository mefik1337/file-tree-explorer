import { Link } from 'react-router-dom';
import { formatFileSize, type FileTree, type FolderNode, type TreeNode } from '@/modules/file-tree';
import { useNodeHref } from '@/shared/routing/useNodeHref';
import { ChevronIcon, FileIcon, FolderIcon } from '@/shared/ui/icons';
import styles from './NodeDetails.module.css';
import { PathBar } from './PathBar';

const countItems = (count: number): string => `${count} ${count === 1 ? 'item' : 'items'}`;

const describeChild = (tree: FileTree, child: TreeNode): string =>
  child.kind === 'file'
    ? formatFileSize(child.size)
    : `${countItems(child.children.length)} · ${formatFileSize(tree.subtreeSize(child.path))}`;

type FolderDetailsProps = {
  readonly tree: FileTree;
  readonly folder: FolderNode;
};

export const FolderDetails = ({ tree, folder }: FolderDetailsProps) => {
  const nodeHref = useNodeHref();

  return (
    <article className={styles.card}>
      <PathBar tree={tree} node={folder} />
      <header className={styles.hero}>
        <FolderIcon size={64} className={styles.heroIcon} />
        <div className={styles.heroText}>
          <p className={styles.kind}>Folder</p>
          <h1 className={styles.title}>{folder.name}</h1>
        </div>
      </header>
      <h2 className={styles.sectionTitle}>Information</h2>
      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt>Direct children</dt>
          <dd>{folder.children.length}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Total size</dt>
          <dd>{formatFileSize(tree.subtreeSize(folder.path))}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Full path</dt>
          <dd className={styles.mono}>{tree.fullPath(folder.path)}</dd>
        </div>
      </dl>
      <h2 className={styles.sectionTitle}>Children</h2>
      {folder.children.length === 0 ? (
        <p className={styles.empty}>This folder is empty.</p>
      ) : (
        <ul aria-label={`Children of ${folder.name}`} className={styles.children}>
          {folder.children.map((child) => (
            <li key={child.path} className={styles.child}>
              {child.kind === 'file' ? <FileIcon size={22} name={child.name} /> : <FolderIcon size={22} />}
              <Link className={styles.childLink} to={nodeHref(child.path)}>
                {child.name}
              </Link>
              <span className={styles.childMeta}>{describeChild(tree, child)}</span>
              <ChevronIcon className={styles.childChevron} />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};
