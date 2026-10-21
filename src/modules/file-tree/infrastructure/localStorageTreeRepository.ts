import type { TreeRepository } from '../application/TreeRepository';

const STORAGE_KEY = 'file-tree-explorer:tree';

export const createLocalStorageTreeRepository = (storage: Storage): TreeRepository => ({
  load: () => storage.getItem(STORAGE_KEY),
  save: (json) => {
    try {
      storage.setItem(STORAGE_KEY, json);
      return true;
    } catch {
      storage.removeItem(STORAGE_KEY);
      return false;
    }
  },
  clear: () => storage.removeItem(STORAGE_KEY),
});
