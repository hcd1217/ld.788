import { useMemo } from 'react';

import { Button, Drawer, Select, Stack } from '@mantine/core';

import { DatePickerInput } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { useEmployees, usePermissions } from '@/stores/useAppStore';
import { canViewAllPurchaseOrder } from '@/utils/permission.utils';

interface POAdvancedFiltersDrawerProps {
  readonly opened: boolean;
  readonly salesId?: string;
  readonly orderDateStart?: Date;
  readonly orderDateEnd?: Date;
  readonly deliveryDateStart?: Date;
  readonly deliveryDateEnd?: Date;
  readonly onClose: () => void;
  readonly onSalesIdChange: (salesId: string | undefined) => void;
  readonly onOrderDateRangeSelect: (start: Date | undefined, end: Date | undefined) => void;
  readonly onDeliveryDateRangeSelect: (start: Date | undefined, end: Date | undefined) => void;
}

export function POAdvancedFiltersDrawer({
  opened,
  salesId,
  orderDateStart,
  orderDateEnd,
  deliveryDateStart,
  deliveryDateEnd,
  onClose,
  onSalesIdChange,
  onOrderDateRangeSelect,
  onDeliveryDateRangeSelect,
}: POAdvancedFiltersDrawerProps) {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const employees = useEmployees();
  const canViewAll = canViewAllPurchaseOrder(permissions);

  // Employee options for sales filter
  const employeeOptions = useMemo(() => {
    return employees.map((e) => ({
      value: e.id,
      label: e.fullName,
    }));
  }, [employees]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={t('po.moreFilters')}
      position="bottom"
      size="auto"
    >
      <Stack gap="md" pb="md">
        {/* Sales Representative Filter - Only show if user has canViewAll permission */}
        {canViewAll && (
          <Select
            clearable
            searchable
            label={t('po.salesPerson')}
            placeholder={t('po.selectSalesPerson')}
            data={employeeOptions}
            value={salesId || ''}
            onChange={(value) => onSalesIdChange(value || undefined)}
          />
        )}

        {/* Order Date Range */}
        <DatePickerInput
          label={t('po.orderDate')}
          placeholder={t('po.selectDateRange')}
          value={[orderDateStart, orderDateEnd]}
          onChange={(dates) => {
            if (!dates) {
              onOrderDateRangeSelect(undefined, undefined);
            } else {
              const [start, end] = dates;
              const startDate = start ? new Date(start) : undefined;
              const endDate = end ? new Date(end) : undefined;
              onOrderDateRangeSelect(startDate, endDate);
            }
          }}
        />

        {/* Delivery Date Range */}
        <DatePickerInput
          label={t('po.deliveryDate')}
          placeholder={t('po.selectDateRange')}
          value={[deliveryDateStart, deliveryDateEnd]}
          onChange={(dates) => {
            if (!dates) {
              onDeliveryDateRangeSelect(undefined, undefined);
            } else {
              const [start, end] = dates;
              const startDate = start ? new Date(start) : undefined;
              const endDate = end ? new Date(end) : undefined;
              onDeliveryDateRangeSelect(startDate, endDate);
            }
          }}
        />

        {/* Apply Button */}
        <Button onClick={onClose} fullWidth>
          {t('common.apply')}
        </Button>
      </Stack>
    </Drawer>
  );
}
