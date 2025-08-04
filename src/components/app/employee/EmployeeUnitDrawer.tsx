import { SimpleGrid, Button } from '@mantine/core';
import { Drawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { Unit } from '@/services/hr/unit';

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

  const handleUnitSelect = (unitId?: string) => {
    onUnitSelect(unitId);
    onClose();
  };

  // Calculate drawer height based on number of items
  const calculateDrawerHeight = () => {
    const itemCount = units.length + 1; // +1 for "All" option
    const rows = Math.ceil(itemCount / 2);
    const buttonHeight = 36;
    const gapHeight = 8;
    const padding = 32;
    const headerHeight = 60;
    const calculatedHeight = headerHeight + padding + rows * buttonHeight + (rows - 1) * gapHeight;
    return `${Math.min(calculatedHeight, 400)}px`; // Max height 400px
  };

  return (
    <Drawer
      opened={opened}
      size={calculateDrawerHeight()}
      title={t('employee.selectUnit')}
      onClose={onClose}
    >
      <SimpleGrid cols={2} spacing="xs">
        <Button
          variant={!selectedUnitId ? 'filled' : 'light'}
          onClick={() => handleUnitSelect(undefined)}
        >
          {t('employee.allUnit')}
        </Button>
        {units.map((unit) => (
          <Button
            key={unit.id}
            variant={selectedUnitId === unit.id ? 'filled' : 'light'}
            onClick={() => handleUnitSelect(unit.id)}
          >
            {unit.name}
          </Button>
        ))}
      </SimpleGrid>
    </Drawer>
  );
}
