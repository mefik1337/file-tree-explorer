import { CHILD_ORDERS, type ChildOrder } from '@/modules/file-tree';

export const THEMES = ['system', 'light', 'dark'] as const;

export type Theme = (typeof THEMES)[number];

export const VIEW_MODES = ['list', 'columns'] as const;

export type ViewMode = (typeof VIEW_MODES)[number];

export type Preferences = {
  readonly theme: Theme;
  readonly childOrder: ChildOrder;
  readonly viewMode: ViewMode;
};

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  childOrder: 'original',
  viewMode: 'list',
};

const pickOneOf = <T extends string>(allowed: readonly T[], value: unknown, fallback: T): T =>
  allowed.find((candidate) => candidate === value) ?? fallback;

export const parsePreferences = (raw: unknown): Preferences => {
  const source = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    theme: pickOneOf(THEMES, source.theme, DEFAULT_PREFERENCES.theme),
    childOrder: pickOneOf(CHILD_ORDERS, source.childOrder, DEFAULT_PREFERENCES.childOrder),
    viewMode: pickOneOf(VIEW_MODES, source.viewMode, DEFAULT_PREFERENCES.viewMode),
  };
};

export interface PreferencesRepository {
  load(): Preferences;
  save(preferences: Preferences): void;
}
