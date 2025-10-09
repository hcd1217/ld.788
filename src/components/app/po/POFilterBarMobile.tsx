import { useCallback } from 'react';

import { Button, Group, Stack } from '@mantine/core';
import { IconChevronDown, IconClearAll } from '@tabler/icons-react';

import { SearchBar } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermissions } from '@/stores/useAppStore';
import { canFilterPurchaseOrder } from '@/utils/permission.utils';

interface POFilterBarMobileProps {
  readonly searchQuery: string;
  readonly customerId?: string;
  readonly salesId?: string;
  readonly selectedStatuses: string[];
  readonly hasOrderDateFilter: boolean;
  readonly hasDeliveryDateFilter: boolean;
  readonly hasActiveFilters: boolean;
  readonly onSearchChange: (query: string) => void;
  readonly onStatusClick: () => void;
  readonly onAdvancedFiltersClick: () => void;
  readonly onClearFilters: () => void;
}

export function POFilterBarMobile({
  searchQuery,
  customerId,
  salesId,
  selectedStatuses,
  hasOrderDateFilter,
  hasDeliveryDateFilter,
  hasActiveFilters,
  onSearchChange,
  onStatusClick,
  onAdvancedFiltersClick,
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

  const getAdvancedFiltersLabel = useCallback(() => {
    let count = 0;
    if (customerId) count++;
    if (salesId) count++;
    if (hasOrderDateFilter) count++;
    if (hasDeliveryDateFilter) count++;

    if (count === 0) {
      return t('po.moreFilters');
    }
    return `${t('po.moreFilters')} (${count})`;
  }, [customerId, salesId, hasOrderDateFilter, hasDeliveryDateFilter, t]);

  if (!canFilterPurchaseOrder(permissions)) {
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
          variant={
            customerId || salesId || hasOrderDateFilter || hasDeliveryDateFilter
              ? 'filled'
              : 'light'
          }
          rightSection={<IconChevronDown size={16} />}
          onClick={onAdvancedFiltersClick}
          style={{ flex: 1 }}
        >
          {getAdvancedFiltersLabel()}
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
