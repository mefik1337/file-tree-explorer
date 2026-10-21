import { err, ok, type Result } from '@/shared/lib/result';
import { FileTree } from '../domain/FileTree';

export type ImportError = {
  readonly kind: 'invalid-json' | 'invalid-tree';
  readonly message: string;
};

const parseJson = (json: string): Result<unknown, ImportError> => {
  if (json.trim() === '') return err({ kind: 'invalid-json', message: 'Paste or upload a JSON document first.' });
  try {
    return ok(JSON.parse(json) as unknown);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return err({ kind: 'invalid-json', message: `The input is not valid JSON: ${reason}` });
  }
};

export const importFileTree = (json: string): Result<FileTree, ImportError> => {
  const parsed = parseJson(json);
  if (!parsed.ok) return parsed;

  const tree = FileTree.fromSnapshot(parsed.value);
  return tree.ok ? tree : err({ kind: 'invalid-tree', message: tree.error.message });
};
