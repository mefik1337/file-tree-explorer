import { useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFileTree } from '@/modules/file-tree';
import { ThemeSwitch } from '@/modules/preferences';
import { readFileAsText } from '@/shared/lib/readFileAsText';
import { paths } from '@/shared/routing/paths';
import buttons from '@/shared/ui/Button.module.css';
import { AppIcon, ChevronIcon, UploadIcon, WarningIcon } from '@/shared/ui/icons';
import { exampleTreeJson } from './exampleTree';
import styles from './ImportPage.module.css';

export const ImportPage = () => {
  const { tree, loadTree } = useFileTree();
  const navigate = useNavigate();
  const [json, setJson] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const explore = (source: string) => {
    const loaded = loadTree(source);
    if (loaded.ok) navigate(paths.tree);
    else setError(loaded.error.message);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    explore(json);
  };

  const importFile = async (file: File) => {
    try {
      const content = await readFileAsText(file);
      setJson(content);
      explore(content);
    } catch {
      setError(`Could not read "${file.name}".`);
    }
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void importFile(file);
  };

  const handleDragOver = (event: DragEvent<HTMLFormElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return;
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLFormElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void importFile(file);
  };

  return (
    <main className={styles.page}>
      <ThemeSwitch className={styles.themeSwitch} />
      <header className={styles.hero}>
        <AppIcon size={76} className={styles.appIcon} />
        <p className={styles.eyebrow}>FileTree Explorer</p>
        <h1 className={styles.title}>Explore any file tree.</h1>
        <p className={styles.lead}>
          Paste a JSON directory structure, drop a file or start with an example, then browse it the way you browse
          Finder.
        </p>
        {tree !== null && (
          <Link className={styles.continue} to={paths.tree}>
            Continue with "{tree.root.name}"
            <ChevronIcon className={styles.continueArrow} />
          </Link>
        )}
      </header>
      <form
        aria-label="Import tree"
        className={styles.card}
        data-dragging={dragging || undefined}
        onSubmit={handleSubmit}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={styles.cardHeader}>
          <label className={styles.label} htmlFor="tree-json">
            Tree JSON
          </label>
          <button
            type="button"
            className={`${buttons.button} ${buttons.plain} ${buttons.small}`}
            onClick={() => setJson(exampleTreeJson)}
          >
            Use example
          </button>
        </div>
        <textarea
          id="tree-json"
          className={styles.textarea}
          spellCheck={false}
          placeholder='{ "name": "root", "type": "folder", "children": [] }'
          value={json}
          onChange={(event) => setJson(event.target.value)}
        />
        <div className={styles.dropZone}>
          <UploadIcon className={styles.dropIcon} />
          <span>Drop a .json file here or</span>
          <label className={styles.chooseFile} htmlFor="tree-file">
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
            <WarningIcon className={styles.errorIcon} />
            {error}
          </p>
        )}
        <div className={styles.footer}>
          <p className={styles.hint}>Everything stays in your browser.</p>
          <button type="submit" className={`${buttons.button} ${buttons.primary} ${buttons.large}`}>
            Explore tree
          </button>
        </div>
      </form>
    </main>
  );
};
