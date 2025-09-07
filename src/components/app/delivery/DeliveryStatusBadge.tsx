import { Badge } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import { DELIVERY_STATUS_COLORS, type DeliveryStatusType } from '@/constants/deliveryRequest';

interface DeliveryStatusBadgeProps {
  readonly status: DeliveryStatusType;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
}

const statusKeyMap = {
  ALL: 'All',
  PENDING: 'delivery.status.pending',
  IN_TRANSIT: 'delivery.status.inTransit',
  COMPLETED: 'delivery.status.completed',
} as const;

export function DeliveryStatusBadge({ status, size = 'sm' }: DeliveryStatusBadgeProps) {
  const { t } = useTranslation();
  const color = DELIVERY_STATUS_COLORS[status] || 'gray';

  return (
    <Badge color={color} size={size}>
      {status === 'ALL' ? statusKeyMap[status] : t(statusKeyMap[status])}
    </Badge>
  );
}
