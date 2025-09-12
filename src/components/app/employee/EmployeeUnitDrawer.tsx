import { useMemo } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import type { Unit } from '@/services/hr/employee';

import { SelectionDrawer, type SelectionItem } from './SelectionDrawer';

interface EmployeeUnitDrawerProps {
  readonly opened: boolean;
  readonly units: readonly Unit[];
  readonly selectedUnitId?: string;
  readonly onClose: () => void;
  readonly onUnitSelect: (unitId?: string) => void;
}

export function EmployeeUnitDrawer({
  opened,
  units,
  selectedUnitId,
  onClose,
  onUnitSelect,
}: EmployeeUnitDrawerProps) {
  const { t } = useTranslation();

  const unitItems = useMemo<SelectionItem[]>(
    () =>
      units.map((unit) => ({
        id: unit.id,
        label: unit.name,
      })),
    [units],
  );

  return (
    <SelectionDrawer
      opened={opened}
      title={t('employee.selectUnit')}
      items={unitItems}
      selectedId={selectedUnitId}
      onClose={onClose}
      onSelect={onUnitSelect}
      allOptionLabel={t('employee.allUnit')}
    />
  );
}
