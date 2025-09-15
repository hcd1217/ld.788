import { Badge, Card, Group, Stack, Table, Text, Title } from '@mantine/core';

import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

type POItemsListProps = {
  readonly purchaseOrder: PurchaseOrder;
};

export function POItemsList({ purchaseOrder }: POItemsListProps) {
  const { t } = useTranslation();

  return (
    <Card shadow="sm" padding="xl" radius="md">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={3}>{t('po.orderItems')}</Title>
          <Badge size="lg" variant="transparent">
            {purchaseOrder.items.length} {t('po.itemsCount')}
          </Badge>
        </Group>

        <Table withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('common.tableDisplayOrder')}</Table.Th>
              <Table.Th>{t('product.productCode')}</Table.Th>
              <Table.Th>{t('po.description')}</Table.Th>
              <Table.Th>{t('product.unit')}</Table.Th>
              <Table.Th>{t('product.category')}</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>{t('po.quantity')}</Table.Th>
              <Table.Th>{t('common.notes')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {purchaseOrder.items.map((item, index) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Text>{index + 1}</Text>
                </Table.Td>
                <Table.Td>
                  <Text fw={500}>{item.productCode}</Text>
                </Table.Td>
                <Table.Td>
                  <Text>{item.description}</Text>
                </Table.Td>
                <Table.Td>
                  <Text>{item.unit}</Text>
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
                <Table.Td>
                  <Text>{item.notes || '-'}</Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Card>
  );
}
