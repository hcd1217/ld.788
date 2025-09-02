import { useCallback } from 'react';
import { Card, Group, Box, Text, type MantineStyleProp } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequest } from '@/services/sales/deliveryRequest';
import { formatDate, getLocaleFormat } from '@/utils/time';
import { getEmployeeNameByEmployeeId } from '@/utils/overview';
import { useEmployeeMapByEmployeeId } from '@/stores/useAppStore';
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
        cursor: 'pointer',
        ...style,
      }}
      className={className}
      onClick={handleCardClick}
    >
      <Group justify="space-between" align="flex-start" style={{ position: 'relative' }}>
        <Box style={{ flex: 1 }}>
          <Text fw={500} size="sm">
            {deliveryRequest.deliveryRequestNumber}
          </Text>
          {deliveryRequest.customerName && (
            <Text size="xs" c="dimmed">
              {t('delivery.fields.customer')}: {deliveryRequest.customerName}
            </Text>
          )}
          <Text size="xs" c="dimmed">
            {t('delivery.fields.scheduledDate')}:{' '}
            {formatDate(deliveryRequest.scheduledDate, getLocaleFormat(currentLanguage))}
          </Text>
          {deliveryRequest.assignedTo && (
            <Text size="xs" c="dimmed" mt="xs">
              {t('delivery.fields.assignedTo')}:{' '}
              {getEmployeeNameByEmployeeId(employeeMapByEmployeeId, deliveryRequest.assignedTo)}
            </Text>
          )}
          {deliveryRequest.notes && (
            <Text size="xs" c="dimmed" lineClamp={2} mt="xs">
              {t('delivery.fields.notes')}: {deliveryRequest.notes}
            </Text>
          )}
        </Box>

        <DeliveryStatusBadge status={deliveryRequest.status} />
      </Group>
    </Card>
  );
}
