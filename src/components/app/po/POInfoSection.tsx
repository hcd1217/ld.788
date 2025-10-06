import { Badge, Grid, Group, Stack, Text } from '@mantine/core';
import { IconBuilding } from '@tabler/icons-react';

import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

import { POCustomer } from './POCustomer';
import { PODeliveryBadge } from './PODeliveryBadge';
import { POStatusBadge } from './POStatusBadge';
import { POUrgentBadge } from './POUrgentBadge';

type POInfoSectionProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly onNavigateToItemsList?: () => void;
};

const span = { base: 12, md: 6 };

export function POInfoSection({ purchaseOrder, onNavigateToItemsList }: POInfoSectionProps) {
  const { t } = useTranslation();

  return (
    <Grid>
      <Grid.Col span={span}>
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} c="dimmed">
              {t('po.poNumber')}
            </Text>
            <Group justify="start" gap="sm" align="center">
              <Text size="lg" fw={600}>
                {purchaseOrder.poNumber}
              </Text>
              <POStatusBadge status={purchaseOrder.status} size="md" />
              <PODeliveryBadge isInternalDelivery={purchaseOrder.isInternalDelivery} size="md" />
              <POUrgentBadge isUrgentPO={purchaseOrder.isUrgentPO} size="md" />
            </Group>
          </div>

          <div>
            <Text size="sm" fw={500} c="dimmed">
              {t('po.items')}
            </Text>
            <Badge
              variant="transparent"
              size="lg"
              style={{ cursor: 'pointer' }}
              onClick={onNavigateToItemsList}
            >
              {purchaseOrder.items.length} {t('po.itemsCount')}
            </Badge>
          </div>
        </Stack>
      </Grid.Col>

      <Grid.Col span={span}>
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} c="dimmed">
              {t('common.customer')}
            </Text>
            <Group gap="xs">
              <IconBuilding size={16} color="var(--mantine-color-gray-6)" />
              <div>
                <Text fw={500}>
                  <POCustomer purchaseOrder={purchaseOrder} />
                </Text>
              </div>
            </Group>
          </div>

          <div>
            <Text size="sm" fw={500} c="dimmed">
              {t('po.salesPerson')}
            </Text>
            <Text fw={500}>{purchaseOrder.salesPerson ?? '-'}</Text>
          </div>

          <div>
            <Text size="sm" fw={500} c="dimmed">
              {t('po.customerPONumber')}
            </Text>
            <Text fw={500}>{purchaseOrder.customerPONumber}</Text>
          </div>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
