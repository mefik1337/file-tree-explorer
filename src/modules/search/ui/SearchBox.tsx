import { ClearIcon, SearchIcon } from '@/shared/ui/icons';
import { focusFirstResult, SEARCH_INPUT_ID, SEARCH_RESULTS_ID } from './searchFocus';
import styles from './Search.module.css';

type SearchBoxProps = {
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
};

export const SearchBox = ({ query, onQueryChange }: SearchBoxProps) => (
  <form role="search" className={styles.form} onSubmit={(event) => event.preventDefault()}>
    <SearchIcon className={styles.searchIcon} />
    <input
      id={SEARCH_INPUT_ID}
      type="search"
      className={styles.input}
      aria-label="Search by name"
      aria-controls={SEARCH_RESULTS_ID}
      placeholder="Search names or paths"
      value={query}
      onChange={(event) => onQueryChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onQueryChange('');
        if (event.key === 'ArrowDown' && focusFirstResult()) event.preventDefault();
      }}
    />
    {query !== '' && (
      <button type="button" className={styles.clear} aria-label="Clear search" onClick={() => onQueryChange('')}>
        <ClearIcon />
      </button>
    )}
  </form>
);
