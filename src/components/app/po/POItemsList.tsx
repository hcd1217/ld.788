import { Card, Stack, Title, Table, Text, Group, Badge } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatCurrency } from '@/utils/number';

type POItemsListProps = {
  readonly purchaseOrder: PurchaseOrder;
};

export function POItemsList({ purchaseOrder }: POItemsListProps) {
  const { t } = useTranslation();

  const subtotal = purchaseOrder.items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Card shadow="sm" padding="xl" radius="md">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={3}>{t('po.orderItems')}</Title>
          <Badge size="lg" variant="light">
            {purchaseOrder.items.length} {t('po.itemsCount')}
          </Badge>
        </Group>

        <Table withTableBorder withColumnBorders aria-label={t('po.itemsTableAriaLabel')}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('po.productCode')}</Table.Th>
              <Table.Th>{t('po.description')}</Table.Th>
              <Table.Th>{t('po.category')}</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>{t('po.quantity')}</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>{t('po.unitPrice')}</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>{t('po.discount')}</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>{t('po.total')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {purchaseOrder.items.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Text fw={500}>{item.productCode}</Text>
                </Table.Td>
                <Table.Td>
                  <Text>{item.description}</Text>
                </Table.Td>
                <Table.Td>
                  {item.category ? (
                    <Badge variant="light" size="sm">
                      {item.category}
                    </Badge>
                  ) : (
                    <Text c="dimmed" size="sm">
                      -
                    </Text>
                  )}
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  <Text>{item.quantity}</Text>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text>{formatCurrency(item.unitPrice)}</Text>
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  {item.discount ? <Text>{item.discount}%</Text> : <Text c="dimmed">-</Text>}
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text fw={500}>{formatCurrency(item.totalPrice)}</Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
          <Table.Tfoot>
            <Table.Tr>
              <Table.Td colSpan={6} style={{ textAlign: 'right' }}>
                <Text fw={600} size="lg">
                  {t('po.total')}:
                </Text>
              </Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>
                <Text fw={700} size="lg" c="blue">
                  {formatCurrency(subtotal)}
                </Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </Stack>
    </Card>
  );
}
