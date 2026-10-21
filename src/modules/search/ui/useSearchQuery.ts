import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TreeNode } from '@/modules/file-tree';
import { SEARCH_KIND_PARAM, SEARCH_QUERY_PARAM } from '@/shared/routing/paths';

export type SearchKind = TreeNode['kind'] | 'all';

const parseKind = (value: string | null): SearchKind => (value === 'file' || value === 'folder' ? value : 'all');

export type SearchState = {
  readonly query: string;
  readonly kind: SearchKind;
  readonly setQuery: (query: string) => void;
  readonly setKind: (kind: SearchKind) => void;
};

export const useSearchQuery = (): SearchState => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get(SEARCH_QUERY_PARAM) ?? '';
  const kind = parseKind(searchParams.get(SEARCH_KIND_PARAM));

  const updateParams = useCallback(
    (change: (params: URLSearchParams) => void) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          change(next);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setQuery = useCallback(
    (nextQuery: string) =>
      updateParams((params) => {
        if (nextQuery !== '') {
          params.set(SEARCH_QUERY_PARAM, nextQuery);
          return;
        }
        params.delete(SEARCH_QUERY_PARAM);
        params.delete(SEARCH_KIND_PARAM);
      }),
    [updateParams],
  );

  const setKind = useCallback(
    (nextKind: SearchKind) =>
      updateParams((params) => {
        if (nextKind === 'all') params.delete(SEARCH_KIND_PARAM);
        else params.set(SEARCH_KIND_PARAM, nextKind);
      }),
    [updateParams],
  );

  return { query, kind, setQuery, setKind };
};
