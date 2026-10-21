import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Result } from '@/shared/lib/result';
import { importFileTree, type ImportError } from '../application/importFileTree';
import type { TreeRepository } from '../application/TreeRepository';
import type { FileTree } from '../domain/FileTree';

type FileTreeContextValue = {
  readonly tree: FileTree | null;
  readonly loadTree: (json: string) => Result<FileTree, ImportError>;
};

const FileTreeContext = createContext<FileTreeContextValue | null>(null);

const restoreTree = (repository: TreeRepository): FileTree | null => {
  const stored = repository.load();
  if (stored === null) return null;
  const restored = importFileTree(stored);
  return restored.ok ? restored.value : null;
};

type FileTreeProviderProps = {
  readonly repository: TreeRepository;
  readonly children: ReactNode;
};

export const FileTreeProvider = ({ repository, children }: FileTreeProviderProps) => {
  const [tree, setTree] = useState<FileTree | null>(() => restoreTree(repository));

  const loadTree = useCallback(
    (json: string) => {
      const imported = importFileTree(json);
      if (imported.ok) {
        repository.save(json);
        setTree(imported.value);
      }
      return imported;
    },
    [repository],
  );

  const value = useMemo(() => ({ tree, loadTree }), [tree, loadTree]);

  return <FileTreeContext.Provider value={value}>{children}</FileTreeContext.Provider>;
};

export const useFileTree = (): FileTreeContextValue => {
  const context = useContext(FileTreeContext);
  if (context === null) throw new Error('useFileTree must be used within FileTreeProvider');
  return context;
};
