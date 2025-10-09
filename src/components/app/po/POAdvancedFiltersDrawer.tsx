import { useEffect, useMemo, useState } from 'react';

import { Button, Drawer, Select, Stack } from '@mantine/core';

import { DatePickerInput } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { useCustomerOptions, useEmployees, usePermissions } from '@/stores/useAppStore';
import { canViewAllPurchaseOrder } from '@/utils/permission.utils';

interface POAdvancedFiltersDrawerProps {
  readonly opened: boolean;
  readonly customerId?: string;
  readonly salesId?: string;
  readonly orderDateStart?: Date;
  readonly orderDateEnd?: Date;
  readonly deliveryDateStart?: Date;
  readonly deliveryDateEnd?: Date;
  readonly onClose: () => void;
  readonly onCustomerChange: (customerId: string | undefined) => void;
  readonly onSalesIdChange: (salesId: string | undefined) => void;
  readonly onOrderDateRangeSelect: (start: Date | undefined, end: Date | undefined) => void;
  readonly onDeliveryDateRangeSelect: (start: Date | undefined, end: Date | undefined) => void;
}

export function POAdvancedFiltersDrawer({
  opened,
  customerId,
  salesId,
  orderDateStart,
  orderDateEnd,
  deliveryDateStart,
  deliveryDateEnd,
  onClose,
  onCustomerChange,
  onSalesIdChange,
  onOrderDateRangeSelect,
  onDeliveryDateRangeSelect,
}: POAdvancedFiltersDrawerProps) {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const employees = useEmployees();
  const customerOptions = useCustomerOptions();
  const canViewAll = canViewAllPurchaseOrder(permissions);

  // Local state for pending filter changes
  const [pendingCustomerId, setPendingCustomerId] = useState<string | undefined>(customerId);
  const [pendingSalesId, setPendingSalesId] = useState<string | undefined>(salesId);
  const [pendingOrderDateStart, setPendingOrderDateStart] = useState<Date | undefined>(
    orderDateStart,
  );
  const [pendingOrderDateEnd, setPendingOrderDateEnd] = useState<Date | undefined>(orderDateEnd);
  const [pendingDeliveryDateStart, setPendingDeliveryDateStart] = useState<Date | undefined>(
    deliveryDateStart,
  );
  const [pendingDeliveryDateEnd, setPendingDeliveryDateEnd] = useState<Date | undefined>(
    deliveryDateEnd,
  );

  // Sync local state when drawer opens or external filters change
  useEffect(() => {
    if (opened) {
      setPendingCustomerId(customerId);
      setPendingSalesId(salesId);
      setPendingOrderDateStart(orderDateStart);
      setPendingOrderDateEnd(orderDateEnd);
      setPendingDeliveryDateStart(deliveryDateStart);
      setPendingDeliveryDateEnd(deliveryDateEnd);
    }
  }, [
    opened,
    customerId,
    salesId,
    orderDateStart,
    orderDateEnd,
    deliveryDateStart,
    deliveryDateEnd,
  ]);

  // Employee options for sales filter
  const employeeOptions = useMemo(() => {
    return employees.map((e) => ({
      value: e.id,
      label: e.fullName,
    }));
  }, [employees]);

  // Apply all pending filter changes
  const handleApply = () => {
    onCustomerChange(pendingCustomerId);
    onSalesIdChange(pendingSalesId);
    onOrderDateRangeSelect(pendingOrderDateStart, pendingOrderDateEnd);
    onDeliveryDateRangeSelect(pendingDeliveryDateStart, pendingDeliveryDateEnd);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={t('po.moreFilters')}
      position="bottom"
      size="auto"
    >
      <Stack gap="md" pb="md">
        {/* Customer Filter */}
        <Select
          clearable
          searchable
          label={t('common.customer')}
          placeholder={t('po.selectCustomer')}
          data={customerOptions}
          value={pendingCustomerId || ''}
          onChange={(value) => setPendingCustomerId(value || undefined)}
        />

        {/* Sales Representative Filter - Only show if user has canViewAll permission */}
        {canViewAll && (
          <Select
            clearable
            searchable
            label={t('po.salesPerson')}
            placeholder={t('po.selectSalesPerson')}
            data={employeeOptions}
            value={pendingSalesId || ''}
            onChange={(value) => setPendingSalesId(value || undefined)}
          />
        )}

        {/* Order Date Range */}
        <DatePickerInput
          label={t('po.orderDate')}
          placeholder={t('po.selectDateRange')}
          value={[pendingOrderDateStart, pendingOrderDateEnd]}
          onChange={(dates) => {
            if (!dates) {
              setPendingOrderDateStart(undefined);
              setPendingOrderDateEnd(undefined);
            } else {
              const [start, end] = dates;
              setPendingOrderDateStart(start ? new Date(start) : undefined);
              setPendingOrderDateEnd(end ? new Date(end) : undefined);
            }
          }}
        />

        {/* Delivery Date Range */}
        <DatePickerInput
          label={t('po.deliveryDate')}
          placeholder={t('po.selectDateRange')}
          value={[pendingDeliveryDateStart, pendingDeliveryDateEnd]}
          onChange={(dates) => {
            if (!dates) {
              setPendingDeliveryDateStart(undefined);
              setPendingDeliveryDateEnd(undefined);
            } else {
              const [start, end] = dates;
              setPendingDeliveryDateStart(start ? new Date(start) : undefined);
              setPendingDeliveryDateEnd(end ? new Date(end) : undefined);
            }
          }}
        />

        {/* Apply Button */}
        <Button onClick={handleApply} fullWidth>
          {t('common.apply')}
        </Button>
      </Stack>
    </Drawer>
  );
}
