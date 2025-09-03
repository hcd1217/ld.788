import { useCallback } from 'react';
import { Card, Group, Box, Text, Badge, type MantineStyleProp } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { getPODetailRoute } from '@/config/routeConfig';
import { PO_STATUS_COLORS } from '@/constants/purchaseOrder';
import { formatDate } from '@/utils/time';
import { getCustomerNameByCustomerId } from '@/utils/overview';
import { useCustomerMapByCustomerId } from '@/stores/useAppStore';

type POCardProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly isLoading?: boolean;

  /** Custom styles for the card container */
  readonly style?: MantineStyleProp;
  /** Custom className for the card container */
  readonly className?: string;
  /** Custom styles for the action icons group */
  readonly actionIconsStyle?: MantineStyleProp;
  /** Whether to hide the actions */
  readonly noActions?: boolean;
};

export function POCard({ purchaseOrder, style, className }: POCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const customerMapByCustomerId = useCustomerMapByCustomerId();
  // Memoized navigation handler
  const handleCardClick = useCallback(() => {
    navigate(getPODetailRoute(purchaseOrder.id));
  }, [navigate, purchaseOrder.id]);

  const statusColor = PO_STATUS_COLORS[purchaseOrder.status] || 'gray';

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
      aria-label={t('po.poCard', {
        number: purchaseOrder.poNumber,
      })}
      onClick={handleCardClick}
    >
      <Group justify="space-between" align="flex-start" style={{ position: 'relative' }}>
        <Box>
          <Text fw={500} size="sm">
            {purchaseOrder.poNumber}
          </Text>
          <Group gap="lg">
            <Text size="xs" c="dimmed">
              {t('po.customer')}:
            </Text>
            <Text size="xs" fw={500}>
              {getCustomerNameByCustomerId(customerMapByCustomerId, purchaseOrder.customerId)}
            </Text>
          </Group>

          <Group gap="lg">
            <Text size="xs" c="dimmed">
              {t('po.orderDate')}:
            </Text>
            <Text size="xs" fw={500}>
              {formatDate(purchaseOrder.orderDate)}
            </Text>
          </Group>
        </Box>
        <Badge color={statusColor} size="sm">
          {t(`po.status.${purchaseOrder.status}`)}
        </Badge>
      </Group>
    </Card>
  );
}
