import React from 'react';
import { Stack, Group, Button } from '@mantine/core';
import { IconChevronDown, IconClearAll } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { SearchBar } from '@/components/common';
import type { CustomerOverview as Customer } from '@/services/client/overview';
import type { DeliveryStatusType } from '@/constants/deliveryRequest';

interface DeliveryFilterBarMobileProps {
  readonly searchQuery: string;
  readonly customerId?: string;
  readonly selectedStatuses: DeliveryStatusType[];
  readonly hasScheduledDateFilter: boolean;
  readonly hasCompletedDateFilter: boolean;
  readonly customers: readonly Customer[];
  readonly hasActiveFilters: boolean;
  readonly onSearchChange: (query: string) => void;
  readonly onCustomerClick: () => void;
  readonly onStatusClick: () => void;
  readonly onDateClick: () => void;
  readonly onClearFilters: () => void;
}

export function DeliveryFilterBarMobile({
  searchQuery,
  customerId,
  selectedStatuses,
  hasScheduledDateFilter,
  hasCompletedDateFilter,
  customers,
  hasActiveFilters,
  onSearchChange,
  onCustomerClick,
  onStatusClick,
  onDateClick,
  onClearFilters,
}: DeliveryFilterBarMobileProps) {
  const { t } = useTranslation();

  const getCustomerLabel = () => {
    if (!customerId) return 'All Customers';
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : 'All Customers';
  };

  const getStatusLabel = () => {
    if (selectedStatuses.length === 0) {
      return 'All Status';
    }
    if (selectedStatuses.length === 1) {
      // Translate individual status
      const statusKey = `delivery.status.${selectedStatuses[0].toLowerCase()}` as const;
      return t(statusKey as any);
    }
    return `${t('delivery.fields.status')} (${selectedStatuses.length})`;
  };

  const getDateLabel = () => {
    if (hasScheduledDateFilter && hasCompletedDateFilter) {
      return 'Date Range (2)';
    }
    if (hasScheduledDateFilter || hasCompletedDateFilter) {
      return 'Date Range (1)';
    }
    return 'Date Range';
  };

  return (
    <Stack p="sm" gap="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
      {/* Search Input */}
      <SearchBar
        placeholder={t('delivery.filters.searchPlaceholder')}
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
          {getCustomerLabel() as React.ReactNode}
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
          variant={hasScheduledDateFilter || hasCompletedDateFilter ? 'filled' : 'light'}
          rightSection={<IconChevronDown size={16} />}
          onClick={onDateClick}
          style={{ flex: 1 }}
        >
          {getDateLabel() as React.ReactNode}
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
