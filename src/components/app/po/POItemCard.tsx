import { Card, Group, Text, ActionIcon, NumberInput, Stack, Badge } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatCurrency } from '@/utils/number';
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

        {/* Quantity and Price Row */}
        <Group grow>
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
          <div>
            <Text size="xs" c="dimmed" mb={4}>
              {t('po.unitPrice')}
            </Text>
            <NumberInput
              value={item.unitPrice}
              step={1000}
              onChange={(value) => onUpdate(item.id, 'unitPrice', value || 0)}
              min={0}
              thousandSeparator=","
              disabled={disabled}
              size="md"
              prefix="₫"
              styles={{
                input: { textAlign: 'right' },
              }}
            />
          </div>
        </Group>

        {/* Discount if present */}
        {(item.discount || 0) > 0 && (
          <Group grow>
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                {t('po.discount')}
              </Text>
              <NumberInput
                value={item.discount || 0}
                onChange={(value) => onUpdate(item.id, 'discount', value || 0)}
                min={0}
                max={100}
                suffix="%"
                disabled={disabled}
                size="md"
                styles={{
                  input: { textAlign: 'center' },
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <Text size="xs" c="dimmed" mb={4}>
                {t('po.originalAmount')}
              </Text>
              <Text size="md" td="line-through" c="dimmed" ta="right">
                {formatCurrency(item.quantity * item.unitPrice)}
              </Text>
            </div>
          </Group>
        )}

        {/* Total */}
        <Group
          justify="space-between"
          pt="xs"
          style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
        >
          <Text size="sm" fw={500}>
            {t('po.total')}
          </Text>
          <Text size="lg" fw={600} c="blue">
            {formatCurrency(item.totalPrice)}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}
