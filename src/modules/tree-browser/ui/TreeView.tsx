import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ancestorPaths, type FileTree } from '@/modules/file-tree';
import { usePreferences } from '@/modules/preferences';
import { useNodeHref } from '@/shared/routing/useNodeHref';
import { ChevronIcon, FileIcon, FolderIcon } from '@/shared/ui/icons';
import { useExpandedPaths } from './useExpandedPaths';
import { useTreeKeyboard } from './useTreeKeyboard';
import { useVirtualWindow } from './useVirtualWindow';
import { flattenVisibleRows, type VisibleRow } from './visibleRows';
import styles from './TreeView.module.css';

const ROW_HEIGHT = 28;

const rowId = (path: string): string => `tree-row-${encodeURIComponent(path)}`;

const resolveActiveIndex = (rows: readonly VisibleRow[], activePath: string | null): number => {
  if (rows.length === 0) return -1;
  if (activePath === null) return 0;
  const indexByPath = (path: string) => rows.findIndex((row) => row.node.path === path);
  const exact = indexByPath(activePath);
  if (exact >= 0) return exact;
  for (const ancestor of ancestorPaths(activePath).reverse()) {
    const index = indexByPath(ancestor);
    if (index >= 0) return index;
  }
  return 0;
};

type TreeRowProps = {
  readonly row: VisibleRow;
  readonly index: number;
  readonly active: boolean;
  readonly selected: boolean;
  readonly expanded: boolean;
  readonly href: string;
  readonly onToggle: (path: string) => void;
  readonly onActivate: (path: string) => void;
};

const TreeRow = ({ row, index, active, selected, expanded, href, onToggle, onActivate }: TreeRowProps) => {
  const { node, level, setSize, positionInSet } = row;
  const isFolder = node.kind === 'folder';
  const style = { transform: `translateY(${index * ROW_HEIGHT}px)`, '--level': level } as CSSProperties;

  return (
    <li
      id={rowId(node.path)}
      role="treeitem"
      aria-label={node.name}
      aria-level={level}
      aria-setsize={setSize}
      aria-posinset={positionInSet}
      aria-selected={selected}
      aria-expanded={isFolder ? expanded : undefined}
      data-active={active || undefined}
      className={styles.item}
      style={style}
    >
      <div className={styles.row}>
        {isFolder ? (
          <button
            type="button"
            tabIndex={-1}
            className={styles.toggle}
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${node.name}`}
            onClick={() => {
              onToggle(node.path);
              onActivate(node.path);
            }}
          >
            <ChevronIcon size={11} className={styles.chevron} />
          </button>
        ) : (
          <span />
        )}
        <span className={styles.icon}>{isFolder ? <FolderIcon /> : <FileIcon name={node.name} />}</span>
        <Link
          tabIndex={-1}
          className={styles.link}
          to={href}
          aria-current={selected ? 'page' : undefined}
          onClick={() => onActivate(node.path)}
        >
          {node.name}
        </Link>
      </div>
    </li>
  );
};

type TreeViewProps = {
  readonly tree: FileTree;
  readonly selectedPath: string;
};

export const TreeView = ({ tree, selectedPath }: TreeViewProps) => {
  const navigate = useNavigate();
  const nodeHref = useNodeHref();
  const { childOrder } = usePreferences();
  const expansion = useExpandedPaths();
  const { expand, toggle, isExpanded } = expansion;
  const [activePath, setActivePath] = useState<string | null>(null);

  const rows = useMemo(() => flattenVisibleRows(tree, isExpanded, childOrder), [tree, isExpanded, childOrder]);
  const activeIndex = resolveActiveIndex(rows, activePath);
  const activeRow = rows[activeIndex];
  const { scrollerRef, start, end, totalHeight, onScroll, revealRow } = useVirtualWindow(rows.length, ROW_HEIGHT);

  useEffect(() => {
    expand(ancestorPaths(selectedPath));
    if (selectedPath !== tree.root.path) setActivePath(selectedPath);
  }, [expand, selectedPath, tree]);

  useEffect(() => {
    if (activeIndex >= 0) revealRow(activeIndex);
  }, [activeIndex, revealRow]);

  const handleKeyDown = useTreeKeyboard({
    rows,
    activeIndex,
    expansion,
    activate: setActivePath,
    open: (path) => navigate(nodeHref(path)),
  });

  const rootSelected = selectedPath === tree.root.path;

  return (
    <div className={styles.container}>
      <div className={`${styles.row} ${styles.rootRow}`} data-selected={rootSelected || undefined}>
        <span />
        <span className={styles.icon}>
          <FolderIcon />
        </span>
        <Link className={styles.link} to={nodeHref(tree.root.path)} aria-current={rootSelected ? 'page' : undefined}>
          {tree.root.name}
        </Link>
      </div>
      <div ref={scrollerRef} className={styles.viewport} onScroll={onScroll}>
        <ul
          role="tree"
          aria-label={tree.root.name}
          tabIndex={0}
          aria-activedescendant={activeRow ? rowId(activeRow.node.path) : undefined}
          className={styles.tree}
          style={{ height: totalHeight }}
          onKeyDown={handleKeyDown}
        >
          {rows.slice(start, end).map((row, offset) => (
            <TreeRow
              key={row.node.path}
              row={row}
              index={start + offset}
              active={row === activeRow}
              selected={row.node.path === selectedPath}
              expanded={row.node.kind === 'folder' && isExpanded(row.node.path)}
              href={nodeHref(row.node.path)}
              onToggle={toggle}
              onActivate={setActivePath}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};
