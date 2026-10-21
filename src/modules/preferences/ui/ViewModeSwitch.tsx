import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import type { ViewMode } from '../application/Preferences';
import { usePreferences } from './PreferencesProvider';

const VIEW_OPTIONS: ReadonlyArray<{ value: ViewMode; label: string }> = [
  { value: 'list', label: 'List' },
  { value: 'columns', label: 'Columns' },
];

type ViewModeSwitchProps = {
  readonly className?: string | undefined;
};

export const ViewModeSwitch = ({ className }: ViewModeSwitchProps) => {
  const { viewMode, update } = usePreferences();
  return (
    <SegmentedControl
      label="View"
      options={VIEW_OPTIONS}
      value={viewMode}
      onChange={(next) => update({ viewMode: next })}
      className={className}
    />
  );
};
