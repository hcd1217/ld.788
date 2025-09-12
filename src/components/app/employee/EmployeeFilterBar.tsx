import { useMemo } from 'react';

import { Box, Button, Group, Stack } from '@mantine/core';
import { IconChevronDown, IconClearAll } from '@tabler/icons-react';

import { SearchBar } from '@/components/common';
import { EMPLOYEE_STATUS } from '@/constants/employee';
import { useTranslation } from '@/hooks/useTranslation';
import type { Unit } from '@/services/hr/employee';

interface EmployeeFilterBarProps {
  readonly searchQuery: string;
  readonly unitId?: string;
  readonly status: (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];
  readonly units: readonly Unit[];
  readonly hasActiveFilters: boolean;
  readonly onSearchChange: (query: string) => void;
  readonly onUnitClick: () => void;
  readonly onStatusClick: () => void;
  readonly onClearFilters: () => void;
}

export function EmployeeFilterBar({
  searchQuery,
  unitId,
  status,
  units,
  hasActiveFilters,
  onSearchChange,
  onUnitClick,
  onStatusClick,
  onClearFilters,
}: EmployeeFilterBarProps) {
  const { t } = useTranslation();

  const selectedUnitName = useMemo(() => {
    if (!unitId) return t('employee.allUnit');
    const unit = units.find((unit) => unit.id === unitId);
    return unit?.name || t('employee.allUnit');
  }, [unitId, units, t]);

  return (
    <Box p="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
      <Stack gap="sm">
        {/* Search Input */}
        <SearchBar
          placeholder={t('employee.searchPlaceholder')}
          searchQuery={searchQuery}
          setSearchQuery={onSearchChange}
        />

        {/* Filter Buttons */}
        <Group gap="xs">
          <Button
            size="xs"
            variant={unitId ? 'filled' : 'light'}
            rightSection={<IconChevronDown size={16} />}
            onClick={onUnitClick}
            style={{ flex: 1 }}
          >
            {selectedUnitName}
          </Button>

          <Button
            size="xs"
            variant={status !== EMPLOYEE_STATUS.ALL ? 'filled' : 'light'}
            rightSection={<IconChevronDown size={16} />}
            onClick={onStatusClick}
            style={{ flex: 1 }}
          >
            {t(`employee.${status}`)}
          </Button>

          <Button
            size="xs"
            variant="subtle"
            color="red"
            disabled={!hasActiveFilters}
            onClick={onClearFilters}
            leftSection={<IconClearAll size={16} color="var(--mantine-color-red-6)" />}
          >
            {t('common.clear')}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
