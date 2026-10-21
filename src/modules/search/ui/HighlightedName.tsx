import styles from './Search.module.css';

type HighlightedNameProps = {
  readonly name: string;
  readonly query: string;
};

export const HighlightedName = ({ name, query }: HighlightedNameProps) => {
  const needle = query.trim().toLocaleLowerCase();
  const start = name.toLocaleLowerCase().indexOf(needle);
  if (needle === '' || start < 0) return <>{name}</>;

  const end = start + needle.length;
  return (
    <>
      {name.slice(0, start)}
      <mark className={styles.match}>{name.slice(start, end)}</mark>
      {name.slice(end)}
    </>
  );
};
