import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { nodeDetailsHref } from './paths';

export const useNodeHref = (): ((nodePath: string) => string) => {
  const { search } = useLocation();
  return useCallback((nodePath: string) => `${nodeDetailsHref(nodePath)}${search}`, [search]);
};
