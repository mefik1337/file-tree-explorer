import { parsePreferences, type PreferencesRepository } from '../application/Preferences';

export const PREFERENCES_STORAGE_KEY = 'file-tree-explorer:preferences';

const readJson = (text: string | null): unknown => {
  if (text === null) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
};

export const createLocalStoragePreferencesRepository = (storage: Storage): PreferencesRepository => ({
  load: () => parsePreferences(readJson(storage.getItem(PREFERENCES_STORAGE_KEY))),
  save: (preferences) => {
    try {
      storage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      return;
    }
  },
});
