import { Group, Select, MultiSelect, Button, Stack } from '@mantine/core';
import { DateInput, DatesProvider } from '@mantine/dates';
import { IconClearAll } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { SearchBar } from '@/components/common';
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
  const { t, currentLanguage } = useTranslation();
  const valueFormat = currentLanguage === 'vi' ? 'DD/MM/YYYY' : 'MMM DD, YYYY';

  // Customer options for Select
  const customerOptions = [
    { value: '', label: t('po.allCustomers') },
    ...customers.map((customer) => ({
      value: customer.id,
      label: customer.name,
    })),
  ];

  // Status options for MultiSelect
  const statusOptions = [
    { value: PO_STATUS.NEW, label: t('po.status.NEW') },
    { value: PO_STATUS.CONFIRMED, label: t('po.status.CONFIRMED') },
    { value: PO_STATUS.PROCESSING, label: t('po.status.PROCESSING') },
    { value: PO_STATUS.SHIPPED, label: t('po.status.SHIPPED') },
    { value: PO_STATUS.DELIVERED, label: t('po.status.DELIVERED') },
    { value: PO_STATUS.CANCELLED, label: t('po.status.CANCELLED') },
    { value: PO_STATUS.REFUNDED, label: t('po.status.REFUNDED') },
  ];

  // Filter out 'all' status if present
  const filteredStatuses = selectedStatuses.filter((s) => s !== PO_STATUS.ALL);

  return (
    <DatesProvider settings={{ locale: currentLanguage, firstDayOfWeek: 0, weekendDays: [0, 6] }}>
      <Stack gap="md" mb="xl">
        {/* First Row: Search and Customer */}
        <Group justify="start" align="flex-end" gap="md">
          <SearchBar
            maxWidth={300}
            placeholder={t('po.searchPlaceholder')}
            searchQuery={searchQuery}
            setSearchQuery={onSearchChange}
          />

          <Select
            clearable
            searchable
            placeholder={t('po.selectCustomer')}
            data={customerOptions}
            value={customerId || ''}
            style={{ flex: 1, maxWidth: 250 }}
            onChange={(value) => onCustomerChange(value || undefined)}
            label={t('po.customer')}
          />

          <MultiSelect
            clearable
            searchable
            placeholder={t('po.selectStatus')}
            data={statusOptions}
            value={filteredStatuses}
            style={{ flex: 1, maxWidth: 300 }}
            onChange={(values) => onStatusesChange(values as POStatusType[])}
            label={t('po.poStatus')}
            maxDropdownHeight={280}
          />
        </Group>

        {/* Second Row: Date Filters and Clear */}
        <Group justify="start" align="flex-end" gap="md">
          <DateInput
            clearable
            label={t('po.orderDateFrom')}
            placeholder={t('po.selectStartDate')}
            value={orderDateStart}
            valueFormat={valueFormat}
            style={{ minWidth: 150 }}
            onChange={(date) => onOrderDateChange(date ? new Date(date) : undefined, orderDateEnd)}
            maxDate={orderDateEnd || undefined}
          />

          <DateInput
            clearable
            label={t('po.orderDateTo')}
            placeholder={t('po.selectEndDate')}
            value={orderDateEnd}
            valueFormat={valueFormat}
            style={{ minWidth: 150 }}
            onChange={(date) =>
              onOrderDateChange(orderDateStart, date ? new Date(date) : undefined)
            }
            minDate={orderDateStart || undefined}
          />

          <DateInput
            clearable
            label={t('po.deliveryDateFrom')}
            placeholder={t('po.selectStartDate')}
            value={deliveryDateStart}
            valueFormat={valueFormat}
            style={{ minWidth: 150 }}
            onChange={(date) =>
              onDeliveryDateChange(date ? new Date(date) : undefined, deliveryDateEnd)
            }
            maxDate={deliveryDateEnd || undefined}
          />

          <DateInput
            clearable
            label={t('po.deliveryDateTo')}
            placeholder={t('po.selectEndDate')}
            value={deliveryDateEnd}
            valueFormat={valueFormat}
            style={{ minWidth: 150 }}
            onChange={(date) =>
              onDeliveryDateChange(deliveryDateStart, date ? new Date(date) : undefined)
            }
            minDate={deliveryDateStart || undefined}
          />

          <Button
            disabled={!hasActiveFilters}
            variant="subtle"
            leftSection={<IconClearAll size={16} />}
            onClick={onClearFilters}
          >
            {t('common.clear')}
          </Button>
        </Group>
      </Stack>
    </DatesProvider>
  );
}
