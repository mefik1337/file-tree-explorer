const TREE = '/tree';

export const NODE_PATH_PARAM = 'nodePath';

export const SEARCH_QUERY_PARAM = 'q';

export const paths = {
  home: '/',
  tree: TREE,
  nodeDetails: `:${NODE_PATH_PARAM}`,
} as const;

export const nodeDetailsHref = (nodePath: string): string =>
  nodePath === '' ? TREE : `${TREE}/${encodeURIComponent(nodePath)}`;
