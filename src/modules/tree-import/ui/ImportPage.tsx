import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileTree } from '@/modules/file-tree';
import { readFileAsText } from '@/shared/lib/readFileAsText';
import { paths } from '@/shared/routing/paths';

export const ImportPage = () => {
  const { loadTree } = useFileTree();
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
    <form onSubmit={handleSubmit}>
      <label htmlFor="tree-json">Tree JSON</label>
      <textarea id="tree-json" value={json} onChange={(event) => setJson(event.target.value)} />
      <label htmlFor="tree-file">Upload JSON file</label>
      <input id="tree-file" type="file" accept=".json,application/json" onChange={handleUpload} />
      {error !== null && <p role="alert">{error}</p>}
      <button type="submit">Explore tree</button>
    </form>
  );
};
