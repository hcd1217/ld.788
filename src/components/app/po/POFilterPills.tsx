import { Badge, Group } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

import { PO_STATUS, type POStatusType } from '@/constants/purchaseOrder';
import { useTranslation } from '@/hooks/useTranslation';
import { useCustomerOptions, useEmployees } from '@/stores/useAppStore';

interface POFilterPillsProps {
  readonly customerId?: string;
  readonly salesId?: string;
  readonly selectedStatuses: POStatusType[];
  readonly orderDateStart?: Date;
  readonly orderDateEnd?: Date;
  readonly deliveryDateStart?: Date;
  readonly deliveryDateEnd?: Date;
  readonly onRemoveCustomer: () => void;
  readonly onRemoveSalesId: () => void;
  readonly onRemoveStatus: (status: POStatusType) => void;
  readonly onRemoveOrderDate: () => void;
  readonly onRemoveDeliveryDate: () => void;
}

export function POFilterPills({
  customerId,
  salesId,
  selectedStatuses,
  orderDateStart,
  orderDateEnd,
  deliveryDateStart,
  deliveryDateEnd,
  onRemoveCustomer,
  onRemoveSalesId,
  onRemoveStatus,
  onRemoveOrderDate,
  onRemoveDeliveryDate,
}: POFilterPillsProps) {
  const { t } = useTranslation();
  const customerOptions = useCustomerOptions();
  const employees = useEmployees();

  // Get customer name from options
  const customerName = customerOptions.find((c) => c.value === customerId)?.label;

  // Get employee name from employees
  const employeeName = employees.find((e) => e.id === salesId)?.fullName;

  // Filter out 'ALL' status
  const filteredStatuses = selectedStatuses.filter((s) => s !== PO_STATUS.ALL);

  // Format date range for display
  const formatDateRange = (start?: Date, end?: Date) => {
    if (!start && !end) return null;
    const startStr = start ? start.toLocaleDateString() : '';
    const endStr = end ? end.toLocaleDateString() : '';
    if (start && end) return `${startStr} - ${endStr}`;
    if (start) return `${t('common.from')} ${startStr}`;
    if (end) return `${t('common.to')} ${endStr}`;
    return null;
  };

  const orderDateRange = formatDateRange(orderDateStart, orderDateEnd);
  const deliveryDateRange = formatDateRange(deliveryDateStart, deliveryDateEnd);

  // Return null if no active filters
  if (
    !customerId &&
    !salesId &&
    filteredStatuses.length === 0 &&
    !orderDateRange &&
    !deliveryDateRange
  ) {
    return null;
  }

  return (
    <Group gap="xs" mb="md">
      {/* Customer Filter Pill */}
      {customerId && customerName && (
        <Badge
          variant="light"
          size="lg"
          rightSection={
            <IconX size={14} style={{ cursor: 'pointer' }} onClick={onRemoveCustomer} />
          }
        >
          {t('common.customer')}: {customerName}
        </Badge>
      )}

      {/* Sales Person Filter Pill */}
      {salesId && employeeName && (
        <Badge
          variant="light"
          size="lg"
          rightSection={<IconX size={14} style={{ cursor: 'pointer' }} onClick={onRemoveSalesId} />}
        >
          {t('po.salesPerson')}: {employeeName}
        </Badge>
      )}

      {/* Status Filter Pills */}
      {filteredStatuses.map((status) => (
        <Badge
          key={status}
          variant="light"
          size="lg"
          rightSection={
            <IconX size={14} style={{ cursor: 'pointer' }} onClick={() => onRemoveStatus(status)} />
          }
        >
          {t('po.poStatus')}: {t(`po.status.${status}` as any)}
        </Badge>
      ))}

      {/* Order Date Range Pill */}
      {orderDateRange && (
        <Badge
          variant="light"
          size="lg"
          rightSection={
            <IconX size={14} style={{ cursor: 'pointer' }} onClick={onRemoveOrderDate} />
          }
        >
          {t('po.orderDate')}: {orderDateRange}
        </Badge>
      )}

      {/* Delivery Date Range Pill */}
      {deliveryDateRange && (
        <Badge
          variant="light"
          size="lg"
          rightSection={
            <IconX size={14} style={{ cursor: 'pointer' }} onClick={onRemoveDeliveryDate} />
          }
        >
          {t('po.deliveryDate')}: {deliveryDateRange}
        </Badge>
      )}
    </Group>
  );
}
