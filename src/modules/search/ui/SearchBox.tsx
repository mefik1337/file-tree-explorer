import styles from './Search.module.css';

type SearchBoxProps = {
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
};

export const SearchBox = ({ query, onQueryChange }: SearchBoxProps) => (
  <form role="search" className={styles.form} onSubmit={(event) => event.preventDefault()}>
    <input
      type="search"
      className={styles.input}
      aria-label="Search by name"
      placeholder="Search by name…"
      value={query}
      onChange={(event) => onQueryChange(event.target.value)}
    />
    {query !== '' && (
      <button type="button" className={styles.clear} onClick={() => onQueryChange('')}>
        Clear search
      </button>
    )}
  </form>
);
