import { Group, Select, MultiSelect, Button } from '@mantine/core';
import { IconClearAll } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { SearchBar, DatePickerInput } from '@/components/common';
import { PO_STATUS, type POStatusType } from '@/constants/purchaseOrder';
import type { CustomerOverview as Customer } from '@/services/client/overview';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';

interface POFilterBarDesktopProps {
  readonly searchQuery: string;
  readonly customerId?: string;
  readonly selectedStatuses: POStatusType[];
  readonly orderDateStart?: Date;
  readonly orderDateEnd?: Date;
  readonly deliveryDateStart?: Date;
  readonly deliveryDateEnd?: Date;
  readonly customers: readonly Customer[];
  readonly hasActiveFilters: boolean;
  readonly onSearchChange: (query: string) => void;
  readonly onCustomerChange: (customerId: string | undefined) => void;
  readonly onStatusesChange: (statuses: POStatusType[]) => void;
  readonly onOrderDateChange: (start: Date | undefined, end: Date | undefined) => void;
  readonly onDeliveryDateChange: (start: Date | undefined, end: Date | undefined) => void;
  readonly onClearFilters: () => void;
}

export function POFilterBarDesktop({
  searchQuery,
  customerId,
  selectedStatuses,
  orderDateStart,
  orderDateEnd,
  deliveryDateStart,
  deliveryDateEnd,
  customers,
  hasActiveFilters,
  onSearchChange,
  onCustomerChange,
  onStatusesChange,
  onOrderDateChange,
  onDeliveryDateChange,
  onClearFilters,
}: POFilterBarDesktopProps) {
  const { t } = useTranslation();

  // Customer options for Select
  const customerOptions = [
    { value: '', label: t('po.allCustomers') },
    ...customers.map((customer) => ({
      value: customer.id,
      label: customer.name,
    })),
  ];

  // Status options for MultiSelect
  const statusOptions = useMemo(() => {
    return [
      { value: PO_STATUS.NEW, label: t('po.status.NEW') },
      { value: PO_STATUS.CONFIRMED, label: t('po.status.CONFIRMED') },
      { value: PO_STATUS.PROCESSING, label: t('po.status.PROCESSING') },
      { value: PO_STATUS.READY_FOR_PICKUP, label: t('po.status.READY_FOR_PICKUP') },
      { value: PO_STATUS.SHIPPED, label: t('po.status.SHIPPED') },
      { value: PO_STATUS.DELIVERED, label: t('po.status.DELIVERED') },
      { value: PO_STATUS.CANCELLED, label: t('po.status.CANCELLED') },
      { value: PO_STATUS.REFUNDED, label: t('po.status.REFUNDED') },
    ];
  }, [t]);

  // Filter out 'all' status if present
  const filteredStatuses = selectedStatuses.filter((s) => s !== PO_STATUS.ALL);

  // Custom placeholder for MultiSelect to show count
  const statusPlaceholder = useMemo(() => {
    const count = filteredStatuses.length;
    if (count === 0) {
      return t('po.selectStatus');
    }
    if (count === 1) {
      return statusOptions.find((s) => s.value === filteredStatuses[0])?.label;
    }
    return `${count} ${t('po.statusesSelected')}`;
  }, [filteredStatuses, statusOptions, t]);

  return (
    <Group justify="start" align="flex-end" gap="sm" wrap="nowrap" mb="xl">
      {/* Search Bar - flex 2 */}
      <div style={{ flex: 2, minWidth: 200 }}>
        <SearchBar
          placeholder={t('po.searchPlaceholder')}
          searchQuery={searchQuery}
          setSearchQuery={onSearchChange}
        />
      </div>

      {/* Customer Select - flex 1 */}
      <Select
        clearable
        searchable
        placeholder={t('po.selectCustomer')}
        data={customerOptions}
        value={customerId || ''}
        style={{ flex: 1, minWidth: 150, borderRadius: '5px' }}
        onChange={(value) => onCustomerChange(value || undefined)}
        label={t('po.customer')}
      />

      {/* Status MultiSelect - flex 1 */}
      <MultiSelect
        clearable
        searchable
        placeholder={statusPlaceholder}
        data={statusOptions}
        value={filteredStatuses}
        style={{ flex: 1, minWidth: 180 }}
        onChange={(values) => onStatusesChange(values as POStatusType[])}
        label={t('po.poStatus')}
        maxDropdownHeight={280}
        styles={{
          input: {
            minHeight: 36,
            height: 'auto',
          },
          pill: {
            display: 'none',
          },
        }}
      />

      {/* Order Date Range */}
      <DatePickerInput
        label={t('po.orderDate')}
        placeholder={t('po.selectDateRange')}
        value={[orderDateStart, orderDateEnd]}
        style={{ flex: 1.5, minWidth: 220 }}
        onChange={(dates) => {
          if (!dates) {
            onOrderDateChange(undefined, undefined);
          } else {
            const [start, end] = dates;
            const startDate = start ? new Date(start) : undefined;
            const endDate = end ? new Date(end) : undefined;
            onOrderDateChange(startDate, endDate);
          }
        }}
      />

      {/* Delivery Date Range */}
      <DatePickerInput
        label={t('po.deliveryDate')}
        placeholder={t('po.selectDateRange')}
        value={[deliveryDateStart, deliveryDateEnd]}
        style={{ flex: 1.5, minWidth: 220 }}
        onChange={(dates) => {
          if (!dates) {
            onDeliveryDateChange(undefined, undefined);
          } else {
            const [start, end] = dates;
            const startDate = start ? new Date(start) : undefined;
            const endDate = end ? new Date(end) : undefined;
            onDeliveryDateChange(startDate, endDate);
          }
        }}
      />

      {/* Clear Button */}
      <Button
        disabled={!hasActiveFilters}
        variant="subtle"
        leftSection={<IconClearAll size={16} />}
        onClick={onClearFilters}
      >
        {t('common.clear')}
      </Button>
    </Group>
  );
}
