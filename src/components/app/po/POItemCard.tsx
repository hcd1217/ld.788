import { ActionIcon, Badge, Card, Group, NumberInput, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

import { useTranslation } from '@/hooks/useTranslation';
import type { POItem } from '@/services/sales/purchaseOrder';

type POItemCardProps = {
  readonly item: POItem;
  readonly onUpdate: (id: string, field: keyof POItem, value: any) => void;
  readonly onRemove: (id: string) => void;
  readonly disabled?: boolean;
};

export function POItemCard({ item, onUpdate, onRemove, disabled = false }: POItemCardProps) {
  const { t } = useTranslation();

  return (
    <Card withBorder radius="md" p="md">
      <Stack gap="sm">
        {/* Product Header */}
        <Group justify="space-between" align="flex-start">
          <div style={{ flex: 1 }}>
            <Text size="sm" c="dimmed" fw={500}>
              {item.productCode}
            </Text>
            <Text size="md" fw={500}>
              {item.description}
            </Text>
            {item.category && (
              <Badge size="sm" variant="light" mt={4}>
                {item.category}
              </Badge>
            )}
          </div>
          <ActionIcon
            color="red"
            variant="light"
            size="md"
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            aria-label={t('common.delete')}
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>

        {/* Quantity */}
        <div>
          <Text size="xs" c="dimmed" mb={4}>
            {t('po.quantity')}
          </Text>
          <NumberInput
            value={item.quantity}
            onChange={(value) => onUpdate(item.id, 'quantity', value || 0)}
            min={1}
            disabled={disabled}
            size="md"
            styles={{
              input: { textAlign: 'center' },
            }}
          />
        </div>
      </Stack>
    </Card>
  );
}
