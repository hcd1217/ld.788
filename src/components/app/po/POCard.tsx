import { useCallback } from 'react';
import { Card, Group, Box, Text, Badge, type MantineStyleProp } from '@mantine/core';
import { useNavigate } from 'react-router';
import { POActions } from './POActions';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { getPODetailRoute } from '@/config/routeConfig';
import { PO_STATUS_COLORS } from '@/constants/purchaseOrder';
import { formatDate } from '@/utils/time';
import { getCustomerNameByCustomerId } from '@/utils/overview';
import { useCustomerMapByCustomerId } from '@/stores/useAppStore';

type POCardProps = {
  readonly canEdit: boolean;
  readonly canConfirm?: boolean;
  readonly canProcess?: boolean;
  readonly canShip?: boolean;
  readonly canMarkReady?: boolean;
  readonly canDeliver?: boolean;
  readonly canRefund?: boolean;
  readonly canCancel?: boolean;
  readonly purchaseOrder: PurchaseOrder;
  readonly isLoading?: boolean;
  readonly onConfirm?: () => void;
  readonly onProcess?: () => void;
  readonly onMarkReady?: () => void;
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
  canEdit = false,
  canConfirm = false,
  canProcess = false,
  canShip = false,
  canMarkReady = false,
  canDeliver = false,
  canRefund = false,
  canCancel = false,
  isLoading = false,
  onConfirm,
  onProcess,
  onMarkReady,
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
  const customerMapByCustomerId = useCustomerMapByCustomerId();
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
            {t('po.customer')}:{' '}
            {getCustomerNameByCustomerId(customerMapByCustomerId, purchaseOrder.customerId)}
          </Text>
          <Text size="xs" c="dimmed">
            {t('po.orderDate')}: {formatDate(purchaseOrder.orderDate)}
          </Text>
        </Box>
        {noActions ? null : (
          <POActions
            style={defaultActionIconsStyle}
            canEdit={canEdit}
            canConfirm={canConfirm}
            canProcess={canProcess}
            canShip={canShip}
            canMarkReady={canMarkReady}
            canDeliver={canDeliver}
            canRefund={canRefund}
            canCancel={canCancel}
            purchaseOrderId={purchaseOrder.id}
            status={purchaseOrder.status}
            isLoading={isLoading}
            onConfirm={onConfirm}
            onProcess={onProcess}
            onMarkReady={onMarkReady}
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
