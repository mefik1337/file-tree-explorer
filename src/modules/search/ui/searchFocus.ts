export const SEARCH_INPUT_ID = 'tree-search-input';

export const SEARCH_RESULTS_ID = 'tree-search-results';

const resultLinks = (): HTMLAnchorElement[] => [
  ...(document.getElementById(SEARCH_RESULTS_ID)?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? []),
];

export const focusFirstResult = (): boolean => {
  const [first] = resultLinks();
  first?.focus();
  return first !== undefined;
};

export const focusSearchInput = () => document.getElementById(SEARCH_INPUT_ID)?.focus();

export const moveFocusAmongResults = (from: Element, step: 1 | -1) => {
  const links = resultLinks();
  const index = links.findIndex((link) => link === from);
  if (index < 0) return;
  const next = links[index + step];
  if (next) next.focus();
  else if (step === -1) focusSearchInput();
};
