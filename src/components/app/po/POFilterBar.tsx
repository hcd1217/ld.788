import { Stack, Group, Box, Button } from '@mantine/core';
import { IconChevronDown, IconClearAll } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { SearchBar } from '@/components/common';
import { PO_STATUS } from '@/constants/purchaseOrder';
import type { Customer } from '@/services/sales/customer';

interface POFilterBarProps {
  readonly searchQuery: string;
  readonly customerId?: string;
  readonly status: (typeof PO_STATUS)[keyof typeof PO_STATUS];
  readonly hasDateFilter: boolean;
  readonly customers: readonly Customer[];
  readonly hasActiveFilters: boolean;
  readonly onSearchChange: (query: string) => void;
  readonly onCustomerClick: () => void;
  readonly onStatusClick: () => void;
  readonly onDateClick: () => void;
  readonly onClearFilters: () => void;
}

export function POFilterBar({
  searchQuery,
  customerId,
  status,
  hasDateFilter,
  customers,
  hasActiveFilters,
  onSearchChange,
  onCustomerClick,
  onStatusClick,
  onDateClick,
  onClearFilters,
}: POFilterBarProps) {
  const { t } = useTranslation();

  const getCustomerLabel = () => {
    if (!customerId) return t('po.allCustomers');
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : t('po.allCustomers');
  };

  return (
    <Box p="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
      <Stack gap="sm">
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
            variant={status !== PO_STATUS.ALL ? 'filled' : 'light'}
            rightSection={<IconChevronDown size={16} />}
            onClick={onStatusClick}
            style={{ flex: 1 }}
          >
            {status === PO_STATUS.ALL ? t('po.allStatus') : t(`po.status.${status}`)}
          </Button>

          <Button
            size="xs"
            variant={hasDateFilter ? 'filled' : 'light'}
            rightSection={<IconChevronDown size={16} />}
            onClick={onDateClick}
            style={{ flex: 1 }}
          >
            {t('po.dateRange')}
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
