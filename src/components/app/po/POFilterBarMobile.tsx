import { Button, Group, Stack } from '@mantine/core';
import { IconChevronDown, IconClearAll } from '@tabler/icons-react';

import { SearchBar } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { CustomerOverview as Customer } from '@/services/client/overview';

interface POFilterBarMobileProps {
  readonly searchQuery: string;
  readonly customerId?: string;
  readonly selectedStatuses: string[];
  readonly hasOrderDateFilter: boolean;
  readonly hasDeliveryDateFilter: boolean;
  readonly customers: readonly Customer[];
  readonly hasActiveFilters: boolean;
  readonly onSearchChange: (query: string) => void;
  readonly onCustomerClick: () => void;
  readonly onStatusClick: () => void;
  readonly onDateClick: () => void;
  readonly onClearFilters: () => void;
}

export function POFilterBarMobile({
  searchQuery,
  customerId,
  selectedStatuses,
  hasOrderDateFilter,
  hasDeliveryDateFilter,
  customers,
  hasActiveFilters,
  onSearchChange,
  onCustomerClick,
  onStatusClick,
  onDateClick,
  onClearFilters,
}: POFilterBarMobileProps) {
  const { t } = useTranslation();

  const getCustomerLabel = () => {
    if (!customerId) return t('po.allCustomers');
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : t('po.allCustomers');
  };

  const getStatusLabel = () => {
    if (selectedStatuses.length === 0) {
      return t('po.allStatus');
    }
    if (selectedStatuses.length === 1) {
      // Translate individual status
      const statusKey = `po.status.${selectedStatuses[0]}` as const;
      return t(statusKey as any);
    }
    return `${t('po.poStatus')} (${selectedStatuses.length})`;
  };

  const getDateLabel = () => {
    if (hasOrderDateFilter && hasDeliveryDateFilter) {
      return `${t('po.dateRange')} (2)`;
    }
    if (hasOrderDateFilter || hasDeliveryDateFilter) {
      return `${t('po.dateRange')} (1)`;
    }
    return t('po.dateRange');
  };

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
          variant={customerId ? 'filled' : 'light'}
          rightSection={<IconChevronDown size={16} />}
          onClick={onCustomerClick}
          style={{ flex: 1 }}
        >
          {getCustomerLabel()}
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
