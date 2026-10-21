import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import type { Theme } from '../application/Preferences';
import { usePreferences } from './PreferencesProvider';

const THEME_OPTIONS: ReadonlyArray<{ value: Theme; label: string }> = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

type ThemeSwitchProps = {
  readonly className?: string | undefined;
};

export const ThemeSwitch = ({ className }: ThemeSwitchProps) => {
  const { theme, update } = usePreferences();
  return (
    <SegmentedControl
      label="Appearance"
      options={THEME_OPTIONS}
      value={theme}
      onChange={(next) => update({ theme: next })}
      className={className}
    />
  );
};
