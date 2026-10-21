import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ancestorPaths, type FileTree, type FolderNode } from '@/modules/file-tree';
import { usePreferences } from '@/modules/preferences';
import { useNodeHref } from '@/shared/routing/useNodeHref';
import { ChevronIcon, FileIcon, FolderIcon } from '@/shared/ui/icons';
import styles from './ColumnBrowser.module.css';

const foldersOnPath = (tree: FileTree, selectedPath: string): FolderNode[] => {
  const chain = [...ancestorPaths(selectedPath), selectedPath].flatMap((path) => {
    const node = tree.find(path);
    return node?.kind === 'folder' && node !== tree.root ? [node] : [];
  });
  return [tree.root, ...chain];
};

type ColumnBrowserProps = {
  readonly tree: FileTree;
  readonly selectedPath: string;
  readonly children: ReactNode;
};

export const ColumnBrowser = ({ tree, selectedPath, children }: ColumnBrowserProps) => {
  const nodeHref = useNodeHref();
  const { childOrder } = usePreferences();
  const stripRef = useRef<HTMLDivElement>(null);
  const folders = foldersOnPath(tree, selectedPath);
  const pathPrefixes = new Set(ancestorPaths(selectedPath));

  useEffect(() => {
    const strip = stripRef.current;
    if (strip) strip.scrollLeft = strip.scrollWidth;
  }, [selectedPath]);

  return (
    <div ref={stripRef} className={styles.strip}>
      <section aria-label="Columns" className={styles.columns}>
        {folders.map((folder) => (
          <ul key={folder.path} aria-label={folder.name} className={styles.column}>
            {tree.orderedChildren(folder, childOrder).map((child) => {
              const current = child.path === selectedPath ? 'page' : pathPrefixes.has(child.path) ? 'true' : undefined;
              return (
                <li key={child.path}>
                  <Link className={styles.item} to={nodeHref(child.path)} aria-current={current}>
                    {child.kind === 'folder' ? <FolderIcon /> : <FileIcon name={child.name} />}
                    <span className={styles.name}>{child.name}</span>
                    {child.kind === 'folder' && <ChevronIcon className={styles.chevron} />}
                  </Link>
                </li>
              );
            })}
            {folder.children.length === 0 && <li className={styles.empty}>Empty folder</li>}
          </ul>
        ))}
      </section>
      <aside aria-label="Preview" className={styles.preview}>
        {children}
      </aside>
    </div>
  );
};
