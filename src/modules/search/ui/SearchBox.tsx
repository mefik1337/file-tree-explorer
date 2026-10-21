import { ClearIcon, SearchIcon } from '@/shared/ui/icons';
import styles from './Search.module.css';

type SearchBoxProps = {
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
};

export const SearchBox = ({ query, onQueryChange }: SearchBoxProps) => (
  <form role="search" className={styles.form} onSubmit={(event) => event.preventDefault()}>
    <SearchIcon className={styles.searchIcon} />
    <input
      type="search"
      className={styles.input}
      aria-label="Search by name"
      placeholder="Search"
      value={query}
      onChange={(event) => onQueryChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onQueryChange('');
      }}
    />
    {query !== '' && (
      <button type="button" className={styles.clear} aria-label="Clear search" onClick={() => onQueryChange('')}>
        <ClearIcon />
      </button>
    )}
  </form>
);
