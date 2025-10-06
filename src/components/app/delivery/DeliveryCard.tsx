import { useCallback } from 'react';

import { useNavigate } from 'react-router';

import { Box, Card, Group, type MantineStyleProp, Text } from '@mantine/core';

import { UrgentBadge } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequest } from '@/services/sales';
import { formatDate } from '@/utils/time';

import { DeliveryStatusBadge } from './DeliveryStatusBadge';
import { DeliveryTypeBadge } from './DeliveryTypeBadge';

type DeliveryCardProps = {
  readonly deliveryRequest: DeliveryRequest;
  /** Custom styles for the card container */
  readonly style?: MantineStyleProp;
  /** Custom className for the card container */
  readonly className?: string;
};

export function DeliveryCard({ deliveryRequest, style, className }: DeliveryCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Memoized navigation handler
  const handleCardClick = useCallback(() => {
    navigate(`/delivery/${deliveryRequest.id}`);
  }, [navigate, deliveryRequest.id]);

  return (
    <Card
      withBorder
      shadow="sm"
      padding="md"
      radius="md"
      style={{
        position: 'relative',
        cursor: 'pointer',
        backgroundColor: deliveryRequest.isUrgentDelivery
          ? 'var(--mantine-color-red-0)'
          : undefined,
        borderColor: deliveryRequest.isUrgentDelivery ? 'var(--mantine-color-red-3)' : undefined,
        ...style,
      }}
      className={className}
      onClick={handleCardClick}
    >
      <Group justify="space-between" align="flex-start" gap="xs" style={{ position: 'relative' }}>
        <Box style={{ flex: 1 }}>
          <Text fw="bold" size="sm">
            {deliveryRequest.deliveryRequestNumber}
          </Text>
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {t('delivery.requestType')}:
            </Text>
            <DeliveryTypeBadge type={deliveryRequest.type} />
          </Group>
          {deliveryRequest.isDelivery ? (
            <Group gap="sm">
              <Text size="sm" c="dimmed">
                {t('common.customer')}:
              </Text>
              <Text size="sm" fw={500}>
                {deliveryRequest.customerName}
              </Text>
            </Group>
          ) : (
            <Group gap="sm">
              <Text size="sm" c="dimmed">
                {t('common.vendor')}:
              </Text>
              <Text size="sm" fw={500}>
                {deliveryRequest.vendorName}
              </Text>
            </Group>
          )}
          <Group gap="sm">
            <Text size="sm" c="dimmed">
              {t('delivery.scheduledDate')}:
            </Text>
            <Text size="sm" fw={500}>
              {formatDate(deliveryRequest.scheduledDate)}
            </Text>
          </Group>

          {deliveryRequest.assignedTo && (
            <Group gap="sm">
              <Text size="sm" c="dimmed">
                {t('delivery.assignedTo')}:
              </Text>
              <Text size="sm" fw={500}>
                {deliveryRequest.deliveryPerson}
              </Text>
            </Group>
          )}
          {deliveryRequest.notes && (
            <Group gap="sm">
              <Text size="sm" c="dimmed">
                {t('common.notes')}:
              </Text>
              <Text size="sm" fw={500}>
                {deliveryRequest.notes}
              </Text>
            </Group>
          )}
        </Box>

        <div style={{ position: 'absolute', top: 0, right: 0 }}>
          <Group gap="xs">
            {deliveryRequest.isUrgentDelivery && <UrgentBadge size="xs" />}
            <DeliveryStatusBadge status={deliveryRequest.status} />
          </Group>
        </div>
      </Group>
    </Card>
  );
}
