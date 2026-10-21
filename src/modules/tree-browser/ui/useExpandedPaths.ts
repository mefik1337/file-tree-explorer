import { useCallback, useState } from 'react';

export type ExpandedPaths = {
  readonly isExpanded: (path: string) => boolean;
  readonly toggle: (path: string) => void;
};

export const useExpandedPaths = (): ExpandedPaths => {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());

  const isExpanded = useCallback((path: string) => expanded.has(path), [expanded]);

  const toggle = useCallback((path: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  return { isExpanded, toggle };
};
