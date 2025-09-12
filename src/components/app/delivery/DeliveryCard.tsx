import { useCallback } from 'react';

import { useNavigate } from 'react-router';

import { Box, Card, Group, type MantineStyleProp, Text } from '@mantine/core';

import { UrgentBadge } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequest } from '@/services/sales/deliveryRequest';
import { useEmployeeMapByEmployeeId } from '@/stores/useAppStore';
import { getEmployeeNameByEmployeeId } from '@/utils/overview';
import { formatDate, getLocaleFormat } from '@/utils/time';

import { DeliveryStatusBadge } from './DeliveryStatusBadge';

type DeliveryCardProps = {
  readonly deliveryRequest: DeliveryRequest;
  /** Custom styles for the card container */
  readonly style?: MantineStyleProp;
  /** Custom className for the card container */
  readonly className?: string;
};

export function DeliveryCard({ deliveryRequest, style, className }: DeliveryCardProps) {
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const employeeMapByEmployeeId = useEmployeeMapByEmployeeId();

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
          {deliveryRequest.customerName && (
            <Group gap="sm">
              <Text size="sm" c="dimmed">
                {t('delivery.customer')}:
              </Text>
              <Text size="sm" fw={500}>
                {deliveryRequest.customerName}
              </Text>
            </Group>
          )}
          <Group gap="sm">
            <Text size="sm" c="dimmed">
              {t('delivery.scheduledDate')}:
            </Text>
            <Text size="sm" fw={500}>
              {formatDate(deliveryRequest.scheduledDate, getLocaleFormat(currentLanguage))}
            </Text>
          </Group>

          {deliveryRequest.assignedTo && (
            <Group gap="sm">
              <Text size="sm" c="dimmed">
                {t('delivery.assignedTo')}:
              </Text>
              <Text size="sm" fw={500}>
                {getEmployeeNameByEmployeeId(employeeMapByEmployeeId, deliveryRequest.assignedTo)}
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
