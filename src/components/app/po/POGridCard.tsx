import { Stack, Group, Text } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { SelectableCard } from '@/components/common';
import { getPODetailRoute } from '@/config/routeConfig';
import { POStatusBadge } from './POStatusBadge';
import { formatCurrency } from '@/utils/number';
import { formatDate } from '@/utils/time';

type POGridCardProps = {
  readonly purchaseOrder: PurchaseOrder;
};

export function POGridCard({ purchaseOrder }: POGridCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
          <div>
            <Text fw={500} size="lg">
              {purchaseOrder.poNumber}
            </Text>
            <Stack gap="xs" mt="xs">
              <div>
                <Text size="sm" fw={500}>
                  {t('po.customer')}
                </Text>
                <Text size="sm" c="dimmed">
                  {purchaseOrder.customer?.name ?? '-'}
                </Text>
                {purchaseOrder.customer?.companyName && (
                  <Text size="xs" c="dimmed">
                    ({purchaseOrder.customer.companyName})
                  </Text>
                )}
              </div>
              <div>
                <Text size="sm" fw={500}>
                  {t('po.orderDate')}
                </Text>
                <Text size="sm" c="dimmed">
                  {formatDate(purchaseOrder.orderDate)}
                </Text>
              </div>
              <div>
                <Text size="sm" fw={500}>
                  {t('po.items')}
                </Text>
                <Text size="sm" c="dimmed">
                  {purchaseOrder.items.length} {t('po.itemsCount')}
                </Text>
              </div>
              <div>
                <Text size="md" fw={600} c="blue">
                  {formatCurrency(purchaseOrder.totalAmount)}
                </Text>
              </div>
            </Stack>
          </div>
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
