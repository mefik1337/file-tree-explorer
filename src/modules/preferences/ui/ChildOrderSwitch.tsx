import type { ChildOrder } from '@/modules/file-tree';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { usePreferences } from './PreferencesProvider';

const ORDER_OPTIONS: ReadonlyArray<{ value: ChildOrder; label: string }> = [
  { value: 'original', label: 'As imported' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
];

type ChildOrderSwitchProps = {
  readonly className?: string | undefined;
};

export const ChildOrderSwitch = ({ className }: ChildOrderSwitchProps) => {
  const { childOrder, update } = usePreferences();
  return (
    <SegmentedControl
      label="Sort by"
      options={ORDER_OPTIONS}
      value={childOrder}
      onChange={(next) => update({ childOrder: next })}
      className={className}
    />
  );
};
