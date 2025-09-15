import { useCallback } from 'react';

import { Button, Group, Stack } from '@mantine/core';
import { IconChevronDown, IconClearAll } from '@tabler/icons-react';

import { SearchBar } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermissions } from '@/stores/useAppStore';

interface POFilterBarMobileProps {
  readonly searchQuery: string;
  readonly selectedStatuses: string[];
  readonly hasOrderDateFilter: boolean;
  readonly hasDeliveryDateFilter: boolean;
  readonly hasActiveFilters: boolean;
  readonly onSearchChange: (query: string) => void;
  readonly onStatusClick: () => void;
  readonly onDateClick: () => void;
  readonly onClearFilters: () => void;
}

export function POFilterBarMobile({
  searchQuery,
  selectedStatuses,
  hasOrderDateFilter,
  hasDeliveryDateFilter,
  hasActiveFilters,
  onSearchChange,
  onStatusClick,
  onDateClick,
  onClearFilters,
}: POFilterBarMobileProps) {
  const { t } = useTranslation();

  const permissions = usePermissions();

  const getStatusLabel = useCallback(() => {
    if (selectedStatuses.length === 0) {
      return t('common.filters.allStatus');
    }
    if (selectedStatuses.length === 1) {
      // Translate individual status
      const statusKey = `po.status.${selectedStatuses[0]}` as const;
      return t(statusKey as any);
    }
    return `${t('po.poStatus')} (${selectedStatuses.length})`;
  }, [selectedStatuses, t]);

  const getDateLabel = useCallback(() => {
    if (hasOrderDateFilter && hasDeliveryDateFilter) {
      return `${t('po.dateRange')} (2)`;
    }
    if (hasOrderDateFilter || hasDeliveryDateFilter) {
      return `${t('po.dateRange')} (1)`;
    }
    return t('po.dateRange');
  }, [hasOrderDateFilter, hasDeliveryDateFilter, t]);

  if (!permissions.purchaseOrder.query.canFilter) {
    return null;
  }

  return (
    <Stack p="sm" gap="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
      {/* Search Input */}
      <SearchBar
        placeholder={t('po.searchPlaceholder')}
        searchQuery={searchQuery}
        setSearchQuery={onSearchChange}
      />

      {/* Filter Buttons */}
      <Group gap="xs">
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
          variant={hasOrderDateFilter || hasDeliveryDateFilter ? 'filled' : 'light'}
          rightSection={<IconChevronDown size={16} />}
          onClick={onDateClick}
          style={{ flex: 1 }}
        >
          {getDateLabel()}
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
