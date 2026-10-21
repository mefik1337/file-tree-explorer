import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ancestorPaths, type FolderNode, type TreeNode } from '@/modules/file-tree';
import { useNodeHref } from '@/shared/routing/useNodeHref';
import { ChevronIcon, FileIcon, FolderIcon } from '@/shared/ui/icons';
import { useExpandedPaths, type ExpandedPaths } from './useExpandedPaths';
import styles from './TreeView.module.css';

const useScrollIntoViewWhen = <T extends HTMLElement>(active: boolean) => {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (active) ref.current?.scrollIntoView?.({ block: 'nearest' });
  }, [active]);
  return ref;
};

type TreeItemProps = {
  readonly node: TreeNode;
  readonly expansion: ExpandedPaths;
  readonly selectedPath: string;
};

const TreeItem = ({ node, expansion, selectedPath }: TreeItemProps) => {
  const nodeHref = useNodeHref();
  const selected = node.path === selectedPath;
  const rowRef = useScrollIntoViewWhen<HTMLDivElement>(selected);
  const link = (
    <Link className={styles.link} to={nodeHref(node.path)} aria-current={selected ? 'page' : undefined}>
      {node.name}
    </Link>
  );

  if (node.kind === 'file') {
    return (
      <li role="treeitem" aria-label={node.name} aria-selected={selected} className={styles.item}>
        <div ref={rowRef} className={styles.row}>
          <span />
          <span className={styles.icon}>
            <FileIcon name={node.name} />
          </span>
          {link}
        </div>
      </li>
    );
  }

  const expanded = expansion.isExpanded(node.path);
  return (
    <li
      role="treeitem"
      aria-label={node.name}
      aria-selected={selected}
      aria-expanded={expanded}
      className={styles.item}
    >
      <div ref={rowRef} className={styles.row}>
        <button
          type="button"
          className={styles.toggle}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${node.name}`}
          onClick={() => expansion.toggle(node.path)}
        >
          <ChevronIcon size={11} className={styles.chevron} />
        </button>
        <span className={styles.icon}>
          <FolderIcon />
        </span>
        {link}
      </div>
      {expanded && <TreeGroup nodes={node.children} expansion={expansion} selectedPath={selectedPath} />}
    </li>
  );
};

type TreeGroupProps = {
  readonly nodes: readonly TreeNode[];
  readonly expansion: ExpandedPaths;
  readonly selectedPath: string;
};

const TreeGroup = ({ nodes, expansion, selectedPath }: TreeGroupProps) => (
  <ul role="group" className={styles.group}>
    {nodes.map((child) => (
      <TreeItem key={child.path} node={child} expansion={expansion} selectedPath={selectedPath} />
    ))}
  </ul>
);

type TreeViewProps = {
  readonly root: FolderNode;
  readonly selectedPath: string;
};

export const TreeView = ({ root, selectedPath }: TreeViewProps) => {
  const nodeHref = useNodeHref();
  const expansion = useExpandedPaths();
  const { expand } = expansion;
  const rootSelected = selectedPath === root.path;

  useEffect(() => {
    expand(ancestorPaths(selectedPath));
  }, [expand, selectedPath]);

  return (
    <>
      <div className={`${styles.row} ${styles.rootRow}`} data-selected={rootSelected || undefined}>
        <span />
        <span className={styles.icon}>
          <FolderIcon />
        </span>
        <Link className={styles.link} to={nodeHref(root.path)} aria-current={rootSelected ? 'page' : undefined}>
          {root.name}
        </Link>
      </div>
      <ul role="tree" aria-label={root.name} className={styles.tree}>
        {root.children.map((child) => (
          <TreeItem key={child.path} node={child} expansion={expansion} selectedPath={selectedPath} />
        ))}
      </ul>
    </>
  );
};
