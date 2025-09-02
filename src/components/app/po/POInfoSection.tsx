import { Grid, Stack, Text, Group, Badge } from '@mantine/core';
import { IconBuilding } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { POStatusBadge } from './POStatusBadge';
import { getCustomerNameByCustomerId } from '@/utils/overview';
import { useCustomerMapByCustomerId } from '@/stores/useAppStore';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

type POInfoSectionProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly onNavigateToItemsList?: () => void;
};

const span = { base: 12, md: 6 };

export function POInfoSection({ purchaseOrder, onNavigateToItemsList }: POInfoSectionProps) {
  const { t } = useTranslation();
  const customerMapByCustomerId = useCustomerMapByCustomerId();

  return (
    <Grid>
      <Grid.Col span={span}>
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} c="dimmed">
              {t('po.poNumber')}
            </Text>
            <Text size="lg" fw={600}>
              {purchaseOrder.poNumber}
            </Text>
          </div>

          <div>
            <Text size="sm" fw={500} c="dimmed">
              {t('po.poStatus')}
            </Text>
            <Group justify="start" gap="sm" align="center">
              <POStatusBadge status={purchaseOrder.status} size="md" />
            </Group>
          </div>
        </Stack>
      </Grid.Col>

      <Grid.Col span={span}>
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} c="dimmed">
              {t('po.customer')}
            </Text>
            <Group gap="xs">
              <IconBuilding size={16} color="var(--mantine-color-gray-6)" />
              <div>
                <Text fw={500}>
                  {getCustomerNameByCustomerId(customerMapByCustomerId, purchaseOrder.customerId)}
                </Text>
              </div>
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
    </Grid>
  );
}
