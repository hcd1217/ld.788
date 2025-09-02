import { Stack, Group, Text } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

type POAccordionItemsPanelProps = {
  readonly purchaseOrder: PurchaseOrder;
};

export function POAccordionItemsPanel({ purchaseOrder }: POAccordionItemsPanelProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="xs">
      {purchaseOrder.items.map((item) => (
        <Group
          key={item.id}
          justify="space-between"
          p="xs"
          style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
        >
          <div>
            <Text size="sm" fw={500}>
              {item.description}
            </Text>
            <Text size="xs" c="dimmed">
              {item.productCode}
            </Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text size="sm">
              {t('po.quantity')}: {item.quantity}
            </Text>
          </div>
        </Group>
      ))}
    </Stack>
  );
}
