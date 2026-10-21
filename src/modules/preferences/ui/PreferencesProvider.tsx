import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Preferences, PreferencesRepository, Theme } from '../application/Preferences';

type PreferencesContextValue = Preferences & {
  readonly update: (changes: Partial<Preferences>) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

const systemPrefersDark = (): boolean => window.matchMedia?.(DARK_SCHEME_QUERY).matches ?? false;

const applyTheme = (theme: Theme) => {
  const resolved = theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme;
  document.documentElement.dataset.theme = resolved;
};

type PreferencesProviderProps = {
  readonly repository: PreferencesRepository;
  readonly children: ReactNode;
};

export const PreferencesProvider = ({ repository, children }: PreferencesProviderProps) => {
  const [preferences, setPreferences] = useState<Preferences>(() => repository.load());

  useEffect(() => {
    applyTheme(preferences.theme);
    if (preferences.theme !== 'system') return;
    const media = window.matchMedia?.(DARK_SCHEME_QUERY);
    const follow = () => applyTheme('system');
    media?.addEventListener('change', follow);
    return () => media?.removeEventListener('change', follow);
  }, [preferences.theme]);

  const update = useCallback(
    (changes: Partial<Preferences>) => {
      setPreferences((current) => {
        const next = { ...current, ...changes };
        repository.save(next);
        return next;
      });
    },
    [repository],
  );

  const value = useMemo(() => ({ ...preferences, update }), [preferences, update]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = (): PreferencesContextValue => {
  const context = useContext(PreferencesContext);
  if (context === null) throw new Error('usePreferences must be used within PreferencesProvider');
  return context;
};
