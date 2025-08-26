import { useCallback } from 'react';
import { Card, Group, Box, Text, Badge, type MantineStyleProp } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequest } from '@/services/sales/deliveryRequest';
import { DELIVERY_STATUS_COLORS } from '@/constants/deliveryRequest';
import { formatDate } from '@/utils/time';

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

  const statusColor = DELIVERY_STATUS_COLORS[deliveryRequest.status] || 'gray';

  return (
    <Card
      withBorder
      shadow="sm"
      padding="md"
      radius="md"
      style={{
        cursor: 'pointer',
        ...style,
      }}
      className={className}
      onClick={handleCardClick}
    >
      <Group justify="space-between" align="flex-start" style={{ position: 'relative' }}>
        <Box style={{ flex: 1 }}>
          <Text fw={500} size="sm">
            DR-{deliveryRequest.id.slice(-6)}
          </Text>
          <Text size="xs" c="dimmed">
            {t('delivery.fields.scheduledDate')}: {formatDate(deliveryRequest.scheduledDate)}
          </Text>
          {deliveryRequest.assignedName && (
            <Text size="xs" c="dimmed" mt="xs">
              {t('delivery.fields.assignedTo')}: {deliveryRequest.assignedName}
            </Text>
          )}
          {deliveryRequest.notes && (
            <Text size="xs" c="dimmed" lineClamp={2} mt="xs">
              {t('delivery.fields.notes')}: {deliveryRequest.notes}
            </Text>
          )}
        </Box>

        <Badge color={statusColor} size="sm">
          {deliveryRequest.status === 'PENDING' && t('delivery.status.pending')}
          {deliveryRequest.status === 'IN_TRANSIT' && t('delivery.status.inTransit')}
          {deliveryRequest.status === 'COMPLETED' && t('delivery.status.completed')}
        </Badge>
      </Group>
    </Card>
  );
}
