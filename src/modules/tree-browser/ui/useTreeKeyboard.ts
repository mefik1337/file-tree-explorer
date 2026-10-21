import { useRef, type KeyboardEvent } from 'react';
import type { ExpandedPaths } from './useExpandedPaths';
import type { VisibleRow } from './visibleRows';

const TYPE_AHEAD_RESET_MS = 600;

type TreeKeyboardOptions = {
  readonly rows: readonly VisibleRow[];
  readonly activeIndex: number;
  readonly expansion: ExpandedPaths;
  readonly activate: (path: string) => void;
  readonly open: (path: string) => void;
};

const isPrintable = (event: KeyboardEvent): boolean =>
  event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey;

export const useTreeKeyboard = ({ rows, activeIndex, expansion, activate, open }: TreeKeyboardOptions) => {
  const typed = useRef({ text: '', at: 0 });

  const moveTo = (index: number) => {
    const row = rows[Math.min(Math.max(index, 0), rows.length - 1)];
    if (row) activate(row.node.path);
  };

  const findByPrefix = (key: string): number => {
    const now = Date.now();
    const text = now - typed.current.at < TYPE_AHEAD_RESET_MS ? typed.current.text + key : key;
    typed.current = { text, at: now };
    const prefix = text.toLocaleLowerCase();
    const firstCandidate = text.length > 1 ? activeIndex : activeIndex + 1;
    for (let offset = 0; offset < rows.length; offset += 1) {
      const index = (firstCandidate + offset) % rows.length;
      if (rows[index]?.node.name.toLocaleLowerCase().startsWith(prefix)) return index;
    }
    return -1;
  };

  const handlers: Readonly<Record<string, (row: VisibleRow) => void>> = {
    ArrowDown: () => moveTo(activeIndex + 1),
    ArrowUp: () => moveTo(activeIndex - 1),
    Home: () => moveTo(0),
    End: () => moveTo(rows.length - 1),
    Enter: (row) => open(row.node.path),
    ArrowRight: (row) => {
      if (row.node.kind !== 'folder') return;
      if (!expansion.isExpanded(row.node.path)) expansion.expand([row.node.path]);
      else if (row.node.children.length > 0) moveTo(activeIndex + 1);
    },
    ArrowLeft: (row) => {
      if (row.node.kind === 'folder' && expansion.isExpanded(row.node.path)) expansion.collapse(row.node.path);
      else if (row.parentPath !== null) activate(row.parentPath);
    },
  };

  return (event: KeyboardEvent<HTMLElement>) => {
    const row = rows[activeIndex];
    if (!row) return;
    const handler = handlers[event.key];
    if (handler) {
      event.preventDefault();
      handler(row);
      return;
    }
    if (!isPrintable(event)) return;
    const match = findByPrefix(event.key);
    if (match >= 0) {
      event.preventDefault();
      moveTo(match);
    }
  };
};
