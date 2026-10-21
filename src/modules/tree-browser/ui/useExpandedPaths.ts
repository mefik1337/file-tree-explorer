import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'file-tree-explorer:expanded';

export type ExpandedPaths = {
  readonly isExpanded: (path: string) => boolean;
  readonly toggle: (path: string) => void;
  readonly expand: (paths: readonly string[]) => void;
  readonly collapse: (path: string) => void;
};

const restore = (): ReadonlySet<string> => {
  try {
    const stored: unknown = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? '[]');
    return new Set(Array.isArray(stored) ? stored.filter((path): path is string => typeof path === 'string') : []);
  } catch {
    return new Set();
  }
};

const persist = (expanded: ReadonlySet<string>) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...expanded]));
  } catch {
    return;
  }
};

export const useExpandedPaths = (): ExpandedPaths => {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(restore);

  useEffect(() => persist(expanded), [expanded]);

  const isExpanded = useCallback((path: string) => expanded.has(path), [expanded]);

  const toggle = useCallback((path: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const expand = useCallback((paths: readonly string[]) => {
    setExpanded((current) => (paths.every((path) => current.has(path)) ? current : new Set([...current, ...paths])));
  }, []);

  const collapse = useCallback((path: string) => {
    setExpanded((current) => {
      if (!current.has(path)) return current;
      const next = new Set(current);
      next.delete(path);
      return next;
    });
  }, []);

  return { isExpanded, toggle, expand, collapse };
};
