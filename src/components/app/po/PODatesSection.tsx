import { Grid, Text, Group } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate, formatDateTime } from '@/utils/time';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

type PODatesSectionProps = {
  readonly purchaseOrder: PurchaseOrder;
};

const span = { base: 12, md: 6 };

export function PODatesSection({ purchaseOrder }: PODatesSectionProps) {
  const { t } = useTranslation();

  return (
    <Grid>
      <Grid.Col span={span}>
        <div>
          <Text size="sm" fw={500} c="dimmed">
            {t('po.orderDate')}
          </Text>
          <Group gap="xs">
            <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
            <Text>{formatDate(purchaseOrder.orderDate)}</Text>
          </Group>
        </div>
      </Grid.Col>
      <Grid.Col span={span}>
        <div>
          <Text size="sm" fw={500} c="dimmed">
            {t('po.deliveryDate')}
          </Text>
          <Group gap="xs">
            <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
            <Text>{formatDate(purchaseOrder.deliveryDate)}</Text>
          </Group>
        </div>
      </Grid.Col>
      <Grid.Col span={span}>
        <div>
          <Text size="sm" fw={500} c="dimmed">
            {t('po.completedDate')}
          </Text>
          <Group gap="xs">
            <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
            <Text>{formatDateTime(purchaseOrder.completedDate)}</Text>
          </Group>
        </div>
      </Grid.Col>
    </Grid>
  );
}
