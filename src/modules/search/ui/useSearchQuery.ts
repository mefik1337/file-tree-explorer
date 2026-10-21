import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEARCH_QUERY_PARAM } from '@/shared/routing/paths';

export const useSearchQuery = (): readonly [string, (query: string) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get(SEARCH_QUERY_PARAM) ?? '';

  const setQuery = useCallback(
    (nextQuery: string) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (nextQuery === '') next.delete(SEARCH_QUERY_PARAM);
          else next.set(SEARCH_QUERY_PARAM, nextQuery);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return [query, setQuery] as const;
};
