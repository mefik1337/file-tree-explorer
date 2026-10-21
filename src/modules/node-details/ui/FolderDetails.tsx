import { Link } from 'react-router-dom';
import { formatFileSize, type FileTree, type FolderNode, type TreeNode } from '@/modules/file-tree';
import { useNodeHref } from '@/shared/routing/useNodeHref';
import styles from './NodeDetails.module.css';
import { PathBar } from './PathBar';

const describeChild = (tree: FileTree, child: TreeNode): string =>
  child.kind === 'file'
    ? formatFileSize(child.size)
    : `${child.children.length} ${child.children.length === 1 ? 'item' : 'items'} · ${formatFileSize(tree.subtreeSize(child.path))}`;

type FolderDetailsProps = {
  readonly tree: FileTree;
  readonly folder: FolderNode;
};

export const FolderDetails = ({ tree, folder }: FolderDetailsProps) => {
  const nodeHref = useNodeHref();

  return (
    <article className={styles.card}>
      <PathBar tree={tree} node={folder} />
      <p className={styles.kind}>Folder</p>
      <h1 className={styles.title}>{folder.name}</h1>
      <dl className={styles.facts}>
        <dt>Direct children</dt>
        <dd>{folder.children.length}</dd>
        <dt>Total size</dt>
        <dd>{formatFileSize(tree.subtreeSize(folder.path))}</dd>
        <dt>Full path</dt>
        <dd>{tree.fullPath(folder.path)}</dd>
      </dl>
      <h2 className={styles.sectionTitle}>Children</h2>
      {folder.children.length === 0 ? (
        <p className={styles.empty}>This folder is empty.</p>
      ) : (
        <ul aria-label={`Children of ${folder.name}`} className={styles.children}>
          {folder.children.map((child) => (
            <li key={child.path} className={styles.child}>
              <span aria-hidden="true">{child.kind === 'file' ? '📄' : '📁'}</span>
              <Link className={styles.childLink} to={nodeHref(child.path)}>
                {child.name}
              </Link>
              <span className={styles.childMeta}>{describeChild(tree, child)}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};
