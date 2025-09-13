import { useNavigate } from 'react-router';

import { Anchor, Group, Stack, Text } from '@mantine/core';
import { IconCalendar, IconTruckDelivery, IconUser } from '@tabler/icons-react';

import { getDeliveryDetailRoute } from '@/config/routeConfig';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { useEmployeeMapByEmployeeId, useEmployeeMapByUserId } from '@/stores/useAppStore';
import { getEmployeeNameByEmployeeId, getEmployeeNameByUserId } from '@/utils/overview';
import { formatDate } from '@/utils/time';

import { DeliveryStatusBadge } from '../delivery/DeliveryStatusBadge';

type PODeliverySectionProps = {
  readonly purchaseOrder: PurchaseOrder;
};

export function PODeliverySection({ purchaseOrder }: PODeliverySectionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const employeeMapByUserId = useEmployeeMapByUserId();
  const employeeMapByEmployeeId = useEmployeeMapByEmployeeId();

  const handleViewDeliveryRequest = (deliveryRequestId: string) => {
    navigate(getDeliveryDetailRoute(deliveryRequestId));
  };

  // Conditional render instead of early return
  if (!purchaseOrder.deliveryRequest) return null;

  return (
    <div>
      <Text size="sm" fw={500} c="blue" mb="xs">
        <IconTruckDelivery size={14} style={{ verticalAlign: 'middle' }} />{' '}
        {t('common.entity.deliveryRequest')}
      </Text>
      <Stack gap="xs">
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            {t('delivery.id')}:
          </Text>
          <Anchor
            size="sm"
            c="blue"
            fw="bold"
            onClick={() =>
              handleViewDeliveryRequest(purchaseOrder.deliveryRequest?.deliveryRequestId || '-')
            }
          >
            {purchaseOrder.deliveryRequest.deliveryRequestNumber}
          </Anchor>
        </Group>
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            {t('delivery.status')}:
          </Text>
          <DeliveryStatusBadge status={purchaseOrder.deliveryRequest.status} />
        </Group>
        {purchaseOrder.deliveryRequest.assignedTo && (
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              {t('delivery.assignedTo')}:
            </Text>
            <Group gap={4}>
              <IconUser size={14} color="var(--mantine-color-gray-6)" />
              <Text size="sm">
                {purchaseOrder.deliveryRequest.assignedType === 'EMPLOYEE'
                  ? getEmployeeNameByEmployeeId(
                      employeeMapByEmployeeId,
                      purchaseOrder.deliveryRequest.assignedTo,
                    )
                  : getEmployeeNameByUserId(
                      employeeMapByUserId,
                      purchaseOrder.deliveryRequest.assignedTo,
                    )}
              </Text>
            </Group>
          </Group>
        )}
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            {t('delivery.scheduledDate')}:
          </Text>
          <Group gap={4}>
            <IconCalendar size={14} color="var(--mantine-color-gray-6)" />
            <Text size="sm">{formatDate(purchaseOrder.deliveryRequest.scheduledDate)}</Text>
          </Group>
        </Group>
      </Stack>
    </div>
  );
}
