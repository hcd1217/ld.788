import { useCallback } from 'react';
import { Card, Group, Box, Text, Badge, type MantineStyleProp } from '@mantine/core';
import { useNavigate } from 'react-router';
import { POActions } from './POActions';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { getPODetailRoute } from '@/config/routeConfig';
import { PO_STATUS_COLORS } from '@/constants/purchaseOrder';
import { formatCurrency } from '@/utils/number';
import { formatDate } from '@/utils/time';

type POCardProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly isLoading?: boolean;
  readonly onConfirm?: () => void;
  readonly onProcess?: () => void;
  readonly onShip?: () => void;
  readonly onDeliver?: () => void;
  readonly onCancel?: () => void;
  readonly onRefund?: () => void;
  /** Custom styles for the card container */
  readonly style?: MantineStyleProp;
  /** Custom className for the card container */
  readonly className?: string;
  /** Custom styles for the action icons group */
  readonly actionIconsStyle?: MantineStyleProp;
  /** Whether to hide the actions */
  readonly noActions?: boolean;
};

export function POCard({
  purchaseOrder,
  isLoading = false,
  onConfirm,
  onProcess,
  onShip,
  onDeliver,
  onCancel,
  onRefund,
  style,
  className,
  actionIconsStyle,
  noActions,
}: POCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Memoized navigation handler
  const handleCardClick = useCallback(() => {
    navigate(getPODetailRoute(purchaseOrder.id));
  }, [navigate, purchaseOrder.id]);

  const defaultActionIconsStyle: MantineStyleProp = {
    position: 'absolute',
    top: 'var(--mantine-spacing-xs)',
    right: 'var(--mantine-spacing-xs)',
    ...actionIconsStyle,
  };

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
          <Text size="xs" c="dimmed">
            {t('po.customer')}: {purchaseOrder.customer?.name ?? '-'}
          </Text>
          <Text size="xs" c="dimmed">
            {t('po.orderDate')}: {formatDate(purchaseOrder.orderDate)}
          </Text>
          <Text size="xs" fw={500}>
            {t('po.total')}: {formatCurrency(purchaseOrder.totalAmount)}
          </Text>
        </Box>
        {noActions ? null : (
          <POActions
            style={defaultActionIconsStyle}
            purchaseOrderId={purchaseOrder.id}
            status={purchaseOrder.status}
            isLoading={isLoading}
            onConfirm={onConfirm}
            onProcess={onProcess}
            onShip={onShip}
            onDeliver={onDeliver}
            onCancel={onCancel}
            onRefund={onRefund}
          />
        )}
        <Badge color={statusColor} size="sm">
          {t(`po.status.${purchaseOrder.status}`)}
        </Badge>
      </Group>
    </Card>
  );
}
