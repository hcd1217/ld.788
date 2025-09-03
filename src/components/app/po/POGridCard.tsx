import { Stack, Group, Text } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { SelectableCard } from '@/components/common';
import { getPODetailRoute } from '@/config/routeConfig';
import { POStatusBadge } from './POStatusBadge';
import { formatDateTime } from '@/utils/time';
import { getCustomerNameByCustomerId } from '@/utils/overview';
import { useCustomerMapByCustomerId } from '@/stores/useAppStore';

type POGridCardProps = {
  readonly purchaseOrder: PurchaseOrder;
};

export function POGridCard({ purchaseOrder }: POGridCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const customerMapByCustomerId = useCustomerMapByCustomerId();
  return (
    <SelectableCard
      withBorder
      shadow="sm"
      padding="lg"
      radius="md"
      style={{
        cursor: 'pointer',
      }}
      aria-label={t('po.poCard', {
        number: purchaseOrder.poNumber,
      })}
      onClick={() => navigate(getPODetailRoute(purchaseOrder.id))}
    >
      <Stack
        gap="sm"
        style={{
          position: 'relative',
        }}
      >
        <Group justify="space-between" align="flex-start">
          <Text fw={500} size="lg">
            {purchaseOrder.poNumber}
          </Text>
          <Stack gap="xs" mt="xs" w="100%">
            <Group justify="space-between" w="100%">
              <div>
                <Text size="sm" c="dimmed">
                  {t('po.customer')}
                </Text>
                <Text size="sm" fw={500}>
                  {getCustomerNameByCustomerId(customerMapByCustomerId, purchaseOrder.customerId)}
                </Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  {t('po.items')}
                </Text>
                <Text size="sm" fw={500}>
                  {purchaseOrder.items.length} {t('po.itemsCount')}
                </Text>
              </div>
            </Group>
            <Group justify="space-between" w="100%">
              <div>
                <Text size="sm" c="dimmed">
                  {t('po.orderDate')}
                </Text>
                <Text size="sm" fw={500}>
                  {formatDateTime(purchaseOrder.orderDate)}
                </Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  {t('po.deliveryDate')}
                </Text>
                <Text size="sm" fw={500}>
                  {formatDateTime(purchaseOrder.deliveryRequest?.scheduledDate)}
                </Text>
              </div>
            </Group>
          </Stack>
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
            }}
          >
            <POStatusBadge status={purchaseOrder.status} />
          </div>
        </Group>
      </Stack>
    </SelectableCard>
  );
}
