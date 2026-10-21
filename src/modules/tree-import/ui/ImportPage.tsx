import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFileTree } from '@/modules/file-tree';
import { readFileAsText } from '@/shared/lib/readFileAsText';
import { paths } from '@/shared/routing/paths';
import { exampleTreeJson } from './exampleTree';
import styles from './ImportPage.module.css';

export const ImportPage = () => {
  const { tree, loadTree } = useFileTree();
  const navigate = useNavigate();
  const [json, setJson] = useState('');
  const [error, setError] = useState<string | null>(null);

  const explore = (source: string) => {
    const loaded = loadTree(source);
    if (loaded.ok) navigate(paths.tree);
    else setError(loaded.error.message);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    explore(json);
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const content = await readFileAsText(file);
      setJson(content);
      explore(content);
    } catch {
      setError(`Could not read "${file.name}".`);
    }
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>FileTree Explorer</h1>
      <p className={styles.lead}>Paste or upload a JSON directory structure to browse it as a tree.</p>
      {tree !== null && (
        <Link className={styles.continue} to={paths.tree}>
          Continue with "{tree.root.name}"
        </Link>
      )}
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="tree-json">
          Tree JSON
        </label>
        <textarea
          id="tree-json"
          className={styles.textarea}
          spellCheck={false}
          placeholder='{ "name": "root", "type": "folder", "children": [] }'
          value={json}
          onChange={(event) => setJson(event.target.value)}
        />
        <div className={styles.toolbar}>
          <button type="button" className={styles.button} onClick={() => setJson(exampleTreeJson)}>
            Use example
          </button>
          <label className={styles.label} htmlFor="tree-file">
            Upload JSON file
          </label>
          <input
            id="tree-file"
            className={styles.fileInput}
            type="file"
            accept=".json,application/json"
            onChange={handleUpload}
          />
        </div>
        {error !== null && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <button type="submit" className={styles.primary}>
          Explore tree
        </button>
      </form>
    </main>
  );
};
