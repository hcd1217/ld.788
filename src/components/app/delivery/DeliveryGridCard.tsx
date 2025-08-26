import { Stack, Group, Text } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequest } from '@/services/sales/deliveryRequest';
import { SelectableCard } from '@/components/common';
import { getDeliveryDetailRoute } from '@/config/routeConfig';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';
import { formatDateTime } from '@/utils/time';

type DeliveryGridCardProps = {
  readonly deliveryRequest: DeliveryRequest;
};

export function DeliveryGridCard({ deliveryRequest }: DeliveryGridCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <SelectableCard
      withBorder
      shadow="sm"
      padding="lg"
      radius="md"
      style={{
        cursor: 'pointer',
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
              DR-{deliveryRequest.id.slice(-6)}
            </Text>
            <Stack gap="xs" mt="xs">
              <div>
                <Text size="sm" fw={500}>
                  {t('delivery.fields.purchaseOrder')}
                </Text>
                <Text size="sm" c="dimmed">
                  {deliveryRequest.purchaseOrderId}
                </Text>
              </div>
              <div>
                <Text size="sm" fw={500}>
                  {t('delivery.fields.scheduledDate')}
                </Text>
                <Text size="sm" c="dimmed">
                  {formatDateTime(deliveryRequest.scheduledDate)}
                </Text>
              </div>
              {deliveryRequest.assignedName && (
                <div>
                  <Text size="sm" fw={500}>
                    {t('delivery.fields.assignedTo')}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {deliveryRequest.assignedName}
                  </Text>
                </div>
              )}
              {deliveryRequest.completedDate && (
                <div>
                  <Text size="sm" fw={500}>
                    {t('delivery.fields.completedDate')}
                  </Text>
                  <Text size="sm" c="dimmed">
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
            <DeliveryStatusBadge status={deliveryRequest.status} />
          </div>
        </Group>
      </Stack>
    </SelectableCard>
  );
}
