import { useNavigate } from 'react-router';

import { Group, Stack, Text } from '@mantine/core';

import { SelectableCard, UrgentBadge } from '@/components/common';
import { getDeliveryDetailRoute } from '@/config/routeConfig';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequest } from '@/services/sales/deliveryRequest';
import { useEmployeeMapByEmployeeId } from '@/stores/useAppStore';
import { getEmployeeNameByEmployeeId } from '@/utils/overview';
import { formatDate, formatDateTime } from '@/utils/time';

import { DeliveryStatusBadge } from './DeliveryStatusBadge';

type DeliveryGridCardProps = {
  readonly deliveryRequest: DeliveryRequest;
};

export function DeliveryGridCard({ deliveryRequest }: DeliveryGridCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const employeeMapByEmployeeId = useEmployeeMapByEmployeeId();

  return (
    <SelectableCard
      withBorder
      shadow="sm"
      padding="lg"
      radius="md"
      style={{
        cursor: 'pointer',
        backgroundColor: deliveryRequest.isUrgentDelivery
          ? 'var(--mantine-color-red-0)'
          : undefined,
        borderColor: deliveryRequest.isUrgentDelivery ? 'var(--mantine-color-red-3)' : undefined,
      }}
      aria-label={t('delivery.gridCard', {
        id: deliveryRequest.id.slice(-6),
      })}
      onClick={() => navigate(getDeliveryDetailRoute(deliveryRequest.id))}
    >
      <Stack
        gap="sm"
        style={{
          position: 'relative',
        }}
      >
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={500} size="lg">
              {deliveryRequest.deliveryRequestNumber}
            </Text>
            <Stack gap="xs" mt="xs">
              {deliveryRequest.customerName && (
                <div>
                  <Text size="sm" c="dimmed">
                    {t('delivery.customer')}
                  </Text>
                  <Text size="sm" fw={500}>
                    {deliveryRequest.customerName}
                  </Text>
                </div>
              )}
              <div>
                <Text size="sm" c="dimmed">
                  {t('delivery.purchaseOrder')}
                </Text>
                <Text size="sm" fw={500}>
                  {/* LINK TO PURCHASE ORDER */}
                  {deliveryRequest.purchaseOrderNumber || '-'}
                </Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  {t('delivery.scheduledDate')}
                </Text>
                <Text size="sm" fw={500}>
                  {formatDate(deliveryRequest.scheduledDate)}
                </Text>
              </div>
              {deliveryRequest.assignedTo && (
                <div>
                  <Text size="sm" c="dimmed">
                    {t('delivery.assignedTo')}
                  </Text>
                  <Text size="sm" fw={500}>
                    {getEmployeeNameByEmployeeId(
                      employeeMapByEmployeeId,
                      deliveryRequest.assignedTo,
                    )}
                  </Text>
                </div>
              )}
              {deliveryRequest.completedDate && (
                <div>
                  <Text size="sm" c="dimmed">
                    {t('delivery.completedDate')}
                  </Text>
                  <Text size="sm" fw={500}>
                    {formatDateTime(deliveryRequest.completedDate)}
                  </Text>
                </div>
              )}
            </Stack>
          </div>
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
            }}
          >
            <Group gap="xs">
              {deliveryRequest.isUrgentDelivery && <UrgentBadge size="sm" />}
              <DeliveryStatusBadge status={deliveryRequest.status} />
            </Group>
          </div>
        </Group>
      </Stack>
    </SelectableCard>
  );
}
