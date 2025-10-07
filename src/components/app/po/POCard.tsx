import { useCallback } from 'react';

import { useNavigate } from 'react-router';

import { Box, Card, Group, type MantineStyleProp, Text } from '@mantine/core';

import { getPODetailRoute } from '@/config/routeConfig';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatDate } from '@/utils/time';

import { POCustomer } from './POCustomer';
import { PODeliveryBadge } from './PODeliveryBadge';
import { POStatusBadge } from './POStatusBadge';
import { POTags } from './POTags';
import { POUrgentBadge } from './POUrgentBadge';

type POCardProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly isLoading?: boolean;

  /** Custom styles for the card container */
  readonly style?: MantineStyleProp;
  /** Custom className for the card container */
  readonly className?: string;
  /** Whether to hide the actions */
  readonly noActions?: boolean;
};

export function POCard({ purchaseOrder, style, className }: POCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Memoized navigation handler
  const handleCardClick = useCallback(() => {
    navigate(getPODetailRoute(purchaseOrder.id));
  }, [navigate, purchaseOrder.id]);

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
      bg={purchaseOrder.isUrgentPO ? 'var(--mantine-color-red-1)' : undefined}
      onClick={handleCardClick}
    >
      <Group justify="space-between" align="flex-start" style={{ position: 'relative' }}>
        <Box>
          <Text fw={500} size="sm">
            {purchaseOrder.poNumber}
          </Text>
          <Group gap="lg">
            <Text size="xs" c="dimmed">
              {t('common.customer')}:
            </Text>
            <Text size="xs" fw={500}>
              <POCustomer purchaseOrder={purchaseOrder} />
            </Text>
          </Group>

          {purchaseOrder.customerPONumber && (
            <Group gap="lg">
              <Text size="xs" c="dimmed">
                {t('po.customerPONumber')}:
              </Text>
              <Text size="xs" fw={500}>
                {purchaseOrder.customerPONumber}
              </Text>
            </Group>
          )}

          {purchaseOrder.salesPerson && (
            <Group gap="lg">
              <Text size="xs" c="dimmed">
                {t('po.salesPerson')}:
              </Text>
              <Text size="xs" fw={500}>
                {purchaseOrder.salesPerson}
              </Text>
            </Group>
          )}

          <Group gap="lg">
            <Text size="xs" c="dimmed">
              {t('po.orderDate')}:
            </Text>
            <Text size="xs" fw={500}>
              {formatDate(purchaseOrder.orderDate)}
            </Text>
          </Group>

          <POTags tags={purchaseOrder.poTags} />
        </Box>
        <Group gap="xs">
          <POUrgentBadge isUrgentPO={purchaseOrder.isUrgentPO} />
          <POStatusBadge status={purchaseOrder.status} />
          <PODeliveryBadge isInternalDelivery={purchaseOrder.isInternalDelivery} />
        </Group>
      </Group>
    </Card>
  );
}
