import { Link } from 'react-router-dom';
import { ancestorPaths, type FileTree, type TreeNode } from '@/modules/file-tree';
import { useNodeHref } from '@/shared/routing/useNodeHref';
import { ChevronIcon, FileIcon, FolderIcon } from '@/shared/ui/icons';
import styles from './NodeDetails.module.css';

type PathBarProps = {
  readonly tree: FileTree;
  readonly node: TreeNode;
};

export const PathBar = ({ tree, node }: PathBarProps) => {
  const nodeHref = useNodeHref();
  const ancestors =
    node === tree.root ? [] : [tree.root, ...ancestorPaths(node.path).flatMap((path) => tree.find(path) ?? [])];

  return (
    <nav aria-label="Path" className={styles.pathBar}>
      <ol className={styles.pathList}>
        {ancestors.map((ancestor) => (
          <li key={ancestor.path} className={styles.pathItem}>
            <Link className={styles.pathLink} to={nodeHref(ancestor.path)}>
              <FolderIcon size={14} />
              {ancestor.name}
            </Link>
            <ChevronIcon size={10} className={styles.pathSeparator} />
          </li>
        ))}
        <li className={styles.pathItem}>
          <span className={styles.pathCurrent} aria-current="page">
            {node.kind === 'file' ? <FileIcon size={14} name={node.name} /> : <FolderIcon size={14} />}
            {node.name}
          </span>
        </li>
      </ol>
    </nav>
  );
};
