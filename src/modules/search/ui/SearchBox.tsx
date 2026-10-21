type SearchBoxProps = {
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
};

export const SearchBox = ({ query, onQueryChange }: SearchBoxProps) => (
  <form role="search" onSubmit={(event) => event.preventDefault()}>
    <input
      type="search"
      aria-label="Search by name"
      placeholder="Search by name…"
      value={query}
      onChange={(event) => onQueryChange(event.target.value)}
    />
    {query !== '' && (
      <button type="button" onClick={() => onQueryChange('')}>
        Clear search
      </button>
    )}
  </form>
);
