import { useCallback, useMemo } from 'react';

import { Button, Group, Stack } from '@mantine/core';
import { IconCalendar, IconChevronDown, IconClearAll, IconUser } from '@tabler/icons-react';

import { SearchBar } from '@/components/common';
import type { DeliveryStatusType } from '@/constants/deliveryRequest';
import { useTranslation } from '@/hooks/useTranslation';
import { useEmployees, usePermissions } from '@/stores/useAppStore';
import { canFilterDeliveryRequest } from '@/utils/permission.utils';

interface DeliveryFilterBarMobileProps {
  readonly searchQuery: string;
  readonly selectedStatuses: DeliveryStatusType[];
  readonly assignedTo?: string;
  readonly hasDateFilter: boolean;
  readonly quickAction?: string;
  readonly hasActiveFilters: boolean;
  readonly onSearchChange: (query: string) => void;
  readonly onQuickActionsClick: () => void;
  readonly onStatusClick: () => void;
  readonly onEmployeeClick: () => void;
  readonly onClearFilters: () => void;
}

export function DeliveryFilterBarMobile({
  searchQuery,
  selectedStatuses,
  assignedTo,
  hasDateFilter,
  quickAction,
  hasActiveFilters,
  onSearchChange,
  onQuickActionsClick,
  onStatusClick,
  onEmployeeClick,
  onClearFilters,
}: DeliveryFilterBarMobileProps) {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const employees = useEmployees();

  const canFilter = useMemo(() => canFilterDeliveryRequest(permissions), [permissions]);

  const getStatusLabel = useCallback(() => {
    if (selectedStatuses.length === 0) {
      return t('common.filters.allStatus');
    }
    if (selectedStatuses.length === 1) {
      const statusKey = `delivery.statuses.${selectedStatuses[0].toLowerCase()}` as any;
      return t(statusKey);
    }
    return `${t('delivery.status')} (${selectedStatuses.length})`;
  }, [selectedStatuses, t]);

  const getQuickActionLabel = useCallback(() => {
    if (quickAction) {
      return quickAction;
    }
    return hasDateFilter
      ? `${t('delivery.quickActions.title')} (1)`
      : t('delivery.quickActions.title');
  }, [quickAction, hasDateFilter, t]);

  const getEmployeeLabel = useCallback((): string => {
    if (!assignedTo) {
      return t('delivery.filters.allEmployees');
    }
    const employee = employees.find((emp) => emp.id === assignedTo);
    return employee?.fullName ?? t('delivery.filters.allEmployees');
  }, [assignedTo, employees, t]);

  if (!canFilter) {
    return null;
  }

  return (
    <Stack p="sm" gap="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
      {/* Search Input for Delivery Number */}
      <SearchBar
        placeholder={t('delivery.filters.searchPlaceholder')}
        searchQuery={searchQuery}
        setSearchQuery={onSearchChange}
      />

      {/* Filter Buttons */}
      <Group gap="xs">
        <Button
          size="xs"
          variant={hasDateFilter || quickAction ? 'filled' : 'light'}
          rightSection={<IconCalendar size={16} />}
          onClick={onQuickActionsClick}
          style={{ flex: 1 }}
        >
          {getQuickActionLabel()}
        </Button>

        <Button
          size="xs"
          variant={assignedTo ? 'filled' : 'light'}
          rightSection={<IconUser size={16} />}
          onClick={onEmployeeClick}
          style={{ flex: 1 }}
        >
          {getEmployeeLabel()}
        </Button>

        <Button
          size="xs"
          variant={selectedStatuses.length > 0 ? 'filled' : 'light'}
          rightSection={<IconChevronDown size={16} />}
          onClick={onStatusClick}
          style={{ flex: 1 }}
        >
          {getStatusLabel()}
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
  );
}
