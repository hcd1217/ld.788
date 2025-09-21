import { useMemo } from 'react';

import { Box, Button, Group, Stack } from '@mantine/core';
import { IconChevronDown, IconClearAll } from '@tabler/icons-react';

import { SearchBar } from '@/components/common';
import { EMPLOYEE_STATUS } from '@/constants/employee';
import { useTranslation } from '@/hooks/useTranslation';
import { useDepartmentOptions } from '@/stores/useAppStore';

interface EmployeeFilterBarProps {
  readonly searchQuery: string;
  readonly departmentId?: string;
  readonly status: (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];
  readonly hasActiveFilters: boolean;
  readonly onSearchChange: (query: string) => void;
  readonly onDepartmentClick: () => void;
  readonly onStatusClick: () => void;
  readonly onClearFilters: () => void;
}

export function EmployeeFilterBar({
  searchQuery,
  departmentId,
  status,
  hasActiveFilters,
  onSearchChange,
  onDepartmentClick,
  onStatusClick,
  onClearFilters,
}: EmployeeFilterBarProps) {
  const { t } = useTranslation();
  const departmentOptions = useDepartmentOptions();

  const selectedDepartmentName = useMemo(() => {
    if (!departmentId) return t('employee.allDepartment');
    const department = departmentOptions.find((department) => department.id === departmentId);
    return department?.label || t('employee.allDepartment');
  }, [departmentId, departmentOptions, t]);

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
            variant={departmentId ? 'filled' : 'light'}
            rightSection={<IconChevronDown size={16} />}
            onClick={onDepartmentClick}
            style={{ flex: 1 }}
          >
            {selectedDepartmentName}
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
