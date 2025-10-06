import { useNavigate } from 'react-router';

import { Group, Stack, Text } from '@mantine/core';

import { SelectableCard } from '@/components/common';
import { getPODetailRoute } from '@/config/routeConfig';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { useCustomerMapByCustomerId } from '@/stores/useAppStore';
import { getCustomerNameByCustomerId } from '@/utils/overview';
import { formatDate } from '@/utils/time';

import { PODeliveryBadge } from './PODeliveryBadge';
import { POStatusBadge } from './POStatusBadge';
import { POUrgentBadge } from './POUrgentBadge';

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
      bg={purchaseOrder.isUrgentPO ? 'var(--mantine-color-red-1)' : undefined}
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
                  {t('common.customer')}
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
                  {t('po.salesPerson')}
                </Text>
                <Text size="sm" fw={500}>
                  {purchaseOrder.salesPerson ?? '-'}
                </Text>
              </div>
              {purchaseOrder.customerPONumber && (
                <div>
                  <Text size="sm" c="dimmed">
                    {t('po.customerPONumber')}
                  </Text>
                  <Text size="sm" fw={500}>
                    {purchaseOrder.customerPONumber ?? '-'}
                  </Text>
                </div>
              )}
            </Group>
            <Group justify="space-between" w="100%">
              <div>
                <Text size="sm" c="dimmed">
                  {t('po.orderDate')}
                </Text>
                <Text size="sm" fw={500}>
                  {formatDate(purchaseOrder.orderDate)}
                </Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  {t('po.deliveryDate')}
                </Text>
                <Text size="sm" fw={500}>
                  {formatDate(purchaseOrder.deliveryDate)}
                </Text>
              </div>
            </Group>
          </Stack>
          <Stack
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
            }}
            gap="xs"
            align="flex-end"
          >
            <POStatusBadge status={purchaseOrder.status} />
            <PODeliveryBadge isInternalDelivery={purchaseOrder.isInternalDelivery} />
            <POUrgentBadge isUrgentPO={purchaseOrder.isUrgentPO} />
          </Stack>
        </Group>
      </Stack>
    </SelectableCard>
  );
}
