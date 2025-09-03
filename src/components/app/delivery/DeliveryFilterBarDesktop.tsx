import { Group, Select, MultiSelect, Button } from '@mantine/core';
import { DatePickerInput } from '@/components/common';
import { IconClearAll } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { SearchBar } from '@/components/common';
import { DELIVERY_STATUS, type DeliveryStatusType } from '@/constants/deliveryRequest';
import type { CustomerOverview as Customer } from '@/services/client/overview';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';

interface DeliveryFilterBarDesktopProps {
  readonly searchQuery: string;
  readonly customerId?: string;
  readonly selectedStatuses: DeliveryStatusType[];
  readonly scheduledDateStart?: Date;
  readonly scheduledDateEnd?: Date;
  readonly completedDateStart?: Date;
  readonly completedDateEnd?: Date;
  readonly customers: readonly Customer[];
  readonly hasActiveFilters: boolean;
  readonly onSearchChange: (query: string) => void;
  readonly onCustomerChange: (customerId: string | undefined) => void;
  readonly onStatusesChange: (statuses: DeliveryStatusType[]) => void;
  readonly onScheduledDateChange: (start: Date | undefined, end: Date | undefined) => void;
  readonly onCompletedDateChange: (start: Date | undefined, end: Date | undefined) => void;
  readonly onClearFilters: () => void;
}

export function DeliveryFilterBarDesktop({
  searchQuery,
  customerId,
  selectedStatuses,
  scheduledDateStart,
  scheduledDateEnd,
  completedDateStart,
  completedDateEnd,
  customers,
  hasActiveFilters,
  onSearchChange,
  onCustomerChange,
  onStatusesChange,
  onScheduledDateChange,
  onCompletedDateChange,
  onClearFilters,
}: DeliveryFilterBarDesktopProps) {
  const { t, currentLanguage } = useTranslation();
  const valueFormat = currentLanguage === 'vi' ? 'DD/MM/YYYY' : 'MMM DD, YYYY';

  // Customer options for Select
  const customerOptions = [
    { value: '', label: t('delivery.filters.selectCustomer' as any) },
    ...customers.map((customer) => ({
      value: customer.id,
      label: customer.name,
    })),
  ];

  // Status options for MultiSelect
  const statusOptions = [
    { value: DELIVERY_STATUS.PENDING, label: t('delivery.status.pending') },
    { value: DELIVERY_STATUS.IN_TRANSIT, label: t('delivery.status.inTransit') },
    { value: DELIVERY_STATUS.COMPLETED, label: t('delivery.status.completed') },
  ];

  // Filter out 'all' status if present
  const filteredStatuses = selectedStatuses.filter((s) => s !== DELIVERY_STATUS.ALL);

  // Custom placeholder for MultiSelect to show count
  const statusPlaceholder = useMemo(() => {
    const count = filteredStatuses.length;
    if (count === 0) {
      return t('delivery.filters.selectStatus' as any);
    } else {
      return `${count} selected`;
    }
  }, [filteredStatuses.length, t]);

  return (
    <Group justify="start" align="flex-end" gap="sm" wrap="nowrap" mb="xl">
      {/* Search Bar - flex 2 */}
      <div style={{ flex: 2, minWidth: 200 }}>
        <SearchBar
          placeholder={t('delivery.filters.searchPlaceholder')}
          searchQuery={searchQuery}
          setSearchQuery={onSearchChange}
        />
      </div>

      {/* Customer Select - flex 1 */}
      <Select
        clearable
        searchable
        placeholder={t('delivery.filters.selectCustomer')}
        data={customerOptions}
        value={customerId || ''}
        style={{ flex: 1, minWidth: 150 }}
        onChange={(value) => onCustomerChange(value || undefined)}
        label={t('delivery.fields.customer') as string}
      />

      {/* Status MultiSelect - flex 1 */}
      <MultiSelect
        clearable
        searchable
        placeholder={statusPlaceholder}
        data={statusOptions}
        value={filteredStatuses}
        style={{ flex: 1, minWidth: 180 }}
        onChange={(values) => onStatusesChange(values as DeliveryStatusType[])}
        label={t('delivery.fields.status') as string}
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
        hidePickedOptions={false}
      />

      {/* Scheduled Date Range */}
      <DatePickerInput
        label={t('delivery.fields.scheduledDate')}
        placeholder={t('delivery.filters.selectStatus')}
        value={[scheduledDateStart, scheduledDateEnd]}
        valueFormat={valueFormat}
        style={{ flex: 1.5, minWidth: 220 }}
        onChange={(dates) => {
          if (!dates) {
            onScheduledDateChange(undefined, undefined);
          } else {
            const [start, end] = dates;
            const startDate = start ? new Date(start) : undefined;
            const endDate = end ? new Date(end) : undefined;
            onScheduledDateChange(startDate, endDate);
          }
        }}
      />

      {/* Completed Date Range */}
      <DatePickerInput
        label={t('delivery.fields.completedDate')}
        placeholder={t('delivery.filters.selectStatus')}
        value={[completedDateStart, completedDateEnd]}
        valueFormat={valueFormat}
        style={{ flex: 1.5, minWidth: 220 }}
        onChange={(dates) => {
          if (!dates) {
            onCompletedDateChange(undefined, undefined);
          } else {
            const [start, end] = dates;
            const startDate = start ? new Date(start) : undefined;
            const endDate = end ? new Date(end) : undefined;
            onCompletedDateChange(startDate, endDate);
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
