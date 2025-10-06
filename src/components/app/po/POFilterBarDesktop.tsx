import { useEffect, useMemo, useState } from 'react';

import { Button, Group, MultiSelect, Select } from '@mantine/core';
import { IconCheck, IconClearAll } from '@tabler/icons-react';

import { SearchBar } from '@/components/common';
import { PO_STATUS, type POStatusType } from '@/constants/purchaseOrder';
import { useTranslation } from '@/hooks/useTranslation';
import { useCustomerOptions, usePermissions } from '@/stores/useAppStore';
import { canFilterPurchaseOrder } from '@/utils/permission.utils';

import { POAdvancedFiltersPopover } from './POAdvancedFiltersPopover';

interface POFilterBarDesktopProps {
  readonly searchQuery: string;
  readonly customerId?: string;
  readonly salesId?: string;
  readonly selectedStatuses: POStatusType[];
  readonly orderDateStart?: Date;
  readonly orderDateEnd?: Date;
  readonly deliveryDateStart?: Date;
  readonly deliveryDateEnd?: Date;
  readonly hasActiveFilters: boolean;
  readonly onSearchChange: (query: string) => void;
  readonly onCustomerChange: (customerId: string | undefined) => void;
  readonly onSalesIdChange: (salesId: string | undefined) => void;
  readonly onStatusesChange: (statuses: POStatusType[]) => void;
  readonly onOrderDateChange: (start: Date | undefined, end: Date | undefined) => void;
  readonly onDeliveryDateChange: (start: Date | undefined, end: Date | undefined) => void;
  readonly onClearFilters: () => void;
}

export function POFilterBarDesktop({
  searchQuery,
  customerId,
  salesId,
  selectedStatuses,
  orderDateStart,
  orderDateEnd,
  deliveryDateStart,
  deliveryDateEnd,
  hasActiveFilters,
  onSearchChange,
  onCustomerChange,
  onSalesIdChange,
  onStatusesChange,
  onOrderDateChange,
  onDeliveryDateChange,
  onClearFilters,
}: POFilterBarDesktopProps) {
  const { t } = useTranslation();
  const permissions = usePermissions();

  const customerOptions = useCustomerOptions();

  // Local state for pending status changes
  const [pendingStatuses, setPendingStatuses] = useState<POStatusType[]>(selectedStatuses);

  // Sync local state when external filters change (e.g., clear filters)
  useEffect(() => {
    setPendingStatuses(selectedStatuses);
  }, [selectedStatuses]);

  // Check if there are pending changes
  const hasPendingChanges = useMemo(() => {
    if (pendingStatuses.length !== selectedStatuses.length) return true;
    return !pendingStatuses.every((status) => selectedStatuses.includes(status));
  }, [pendingStatuses, selectedStatuses]);

  // Apply pending status changes
  const handleApplyStatuses = () => {
    onStatusesChange(pendingStatuses);
  };

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

  // Custom placeholder for MultiSelect to show count - use pendingStatuses for display
  const { filteredStatuses, statusPlaceholder } = useMemo(() => {
    // Filter out 'all' status if present
    const filteredStatuses = pendingStatuses.filter((s) => s !== PO_STATUS.ALL);
    const count = filteredStatuses.length;
    if (count === 0) {
      return {
        filteredStatuses,
        statusPlaceholder: t('po.selectStatus'),
      };
    }
    if (count === 1) {
      return {
        filteredStatuses,
        statusPlaceholder: statusOptions.find((s) => s.value === filteredStatuses[0])?.label,
      };
    }
    return {
      filteredStatuses,
      statusPlaceholder: t('common.statusesSelected', { count }),
    };
  }, [pendingStatuses, statusOptions, t]);

  if (!canFilterPurchaseOrder(permissions)) {
    return null;
  }

  return (
    <Group justify="start" align="end" gap="sm" wrap="nowrap" mb="xl">
      <div style={{ minWidth: 200 }}>
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
        label={t('common.customer')}
      />

      {/* Status MultiSelect - flex 1 */}
      <MultiSelect
        clearable
        searchable
        placeholder={statusPlaceholder}
        data={statusOptions}
        value={filteredStatuses}
        style={{ flex: 1, minWidth: 180 }}
        onChange={(values) => setPendingStatuses(values as POStatusType[])}
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

      {/* Apply Status Button */}
      <Button
        disabled={!hasPendingChanges}
        variant="filled"
        leftSection={<IconCheck size={16} />}
        onClick={handleApplyStatuses}
      >
        {t('common.apply')}
      </Button>

      {/* Advanced Filters Popover */}
      <POAdvancedFiltersPopover
        salesId={salesId}
        orderDateStart={orderDateStart}
        orderDateEnd={orderDateEnd}
        deliveryDateStart={deliveryDateStart}
        deliveryDateEnd={deliveryDateEnd}
        onSalesIdChange={onSalesIdChange}
        onOrderDateChange={onOrderDateChange}
        onDeliveryDateChange={onDeliveryDateChange}
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
