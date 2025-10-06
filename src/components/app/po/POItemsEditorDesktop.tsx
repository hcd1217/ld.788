import { useCallback, useMemo, useState } from 'react';

import {
  ActionIcon,
  Box,
  Button,
  Card,
  NumberInput,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

import { useTranslation } from '@/hooks/useTranslation';
import type { ProductOverview } from '@/lib/api';
import type { POItem } from '@/services/sales/purchaseOrder';
import { useAppStore } from '@/stores/useAppStore';
import { showErrorNotification } from '@/utils/notifications';
import { createPOItem } from '@/utils/poItemUtils';

import { POProductSearch } from './POProductSearch';

type POItemsEditorDesktopProps = {
  readonly items: POItem[];
  readonly onChange: (items: POItem[]) => void;
  readonly isReadOnly?: boolean;
};

type NewItem = Omit<POItem, 'id' | 'purchaseOrderId'>;

const DEFAULT_NEW_ITEM: Omit<POItem, 'id' | 'purchaseOrderId'> = {
  productCode: '',
  description: '',
  quantity: 1,
  category: '',
  notes: '',
  unit: '',
  productId: '',
};

export function POItemsEditorDesktop({
  items,
  onChange,
  isReadOnly = false,
}: POItemsEditorDesktopProps) {
  const { t } = useTranslation();
  const { overviewData } = useAppStore();
  const [newItem, setNewItem] = useState<NewItem>({
    ...DEFAULT_NEW_ITEM,
  });

  const handleAddItem = useCallback(() => {
    const result = createPOItem(newItem, items);

    if (result.error) {
      showErrorNotification(t('common.errors.notificationTitle'), result.error);
      return null;
    }

    if (result.item) {
      onChange([...items, result.item]);

      // Reset form
      setNewItem({ ...DEFAULT_NEW_ITEM });
      return result.item;
    }

    return null;
  }, [items, newItem, onChange, t]);

  const handleRemoveItem = useCallback(
    (id: string) => {
      onChange(items.filter((item) => item.id !== id));
    },
    [items, onChange],
  );

  const handleUpdateItem = useCallback(
    (id: string, field: keyof POItem, value: string | number | undefined) => {
      onChange(
        items.map((item) => {
          if (item.id === id) {
            return { ...item, [field]: value };
          }
          return item;
        }),
      );
    },
    [items, onChange],
  );

  const handleProductSelection = useCallback(
    (itemId: string | 'new', product?: ProductOverview) => {
      if (!product) return;

      if (itemId === 'new') {
        setNewItem({
          ...newItem,
          productId: product.id,
          productCode: product.code,
          description: product.name,
          unit: product.unit || '',
          category: newItem.category || '',
        });
      } else {
        // Find current item to preserve quantity, unit and other fields
        const currentItem = items.find((i) => i.id === itemId);
        if (currentItem) {
          handleUpdateItem(itemId, 'productCode', product.code);
          handleUpdateItem(itemId, 'description', product.name);
          handleUpdateItem(itemId, 'unit', product.unit || '');
        }
      }
    },
    [newItem, items, handleUpdateItem],
  );

  // Generate autocomplete options from products
  const productOptions = useMemo(() => {
    // TODO: check if the product is already in the existing items
    return overviewData?.products.map((p) => `${p.code} - ${p.name}`) || [];
  }, [overviewData]);

  // Empty state
  if (!isReadOnly && items.length === 0) {
    return (
      <Card shadow="sm" padding="xl" radius="md">
        <Stack gap="lg">
          <Title order={3}>{t('po.orderItems')}</Title>
          <Text c="dimmed" ta="center" py="xl">
            {t('po.noItemsMessage')}
          </Text>
          {/* Add first item form */}
          <Box>
            <Text size="sm" fw={500} mb="sm">
              {t('po.addFirstItem')}
            </Text>
            <Stack gap="sm">
              <POProductSearch
                productOptions={productOptions}
                onChange={(product) => handleProductSelection('new', product)}
              />
              <TextInput
                placeholder={t('po.description')}
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
              <NumberInput
                placeholder={t('po.quantity')}
                value={newItem.quantity || 1}
                min={1}
                onChange={(value) =>
                  setNewItem({ ...newItem, quantity: typeof value === 'number' ? value : 1 })
                }
              />
              <TextInput
                placeholder={t('common.notes')}
                value={newItem.notes || ''}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              />
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={handleAddItem}
                disabled={
                  !newItem.productCode ||
                  !newItem.description ||
                  !newItem.quantity ||
                  newItem.quantity <= 0
                }
              >
                {t('po.addItem')}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Card>
    );
  }

  // Desktop layout with table
  return (
    <Card shadow="sm" padding="xl" radius="md">
      <Stack gap="lg">
        <Title order={3}>{t('po.orderItems')}</Title>
        <Box style={{ overflowX: 'auto' }}>
          <Table withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 200 }}>{t('po.productCode')}</Table.Th>
                <Table.Th style={{ minWidth: 200 }}>{t('po.description')}</Table.Th>
                <Table.Th style={{ width: 80 }}>{t('po.quantity')}</Table.Th>
                <Table.Th style={{ width: 120 }}>{t('common.unit')}</Table.Th>
                <Table.Th style={{ width: 300 }}>{t('common.notes')}</Table.Th>
                {!isReadOnly && <Table.Th style={{ width: 60 }}>{t('common.actions')}</Table.Th>}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    {isReadOnly ? (
                      <Text size="sm">{item.productCode}</Text>
                    ) : (
                      <POProductSearch
                        size="xs"
                        value={`${item.productCode} - ${item.description}`}
                        productOptions={productOptions}
                        onChange={(product) => handleProductSelection(item.id, product)}
                      />
                    )}
                  </Table.Td>
                  <Table.Td>
                    {isReadOnly ? (
                      <Text size="sm">{item.description}</Text>
                    ) : (
                      <TextInput
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        size="xs"
                      />
                    )}
                  </Table.Td>
                  <Table.Td>
                    {isReadOnly ? (
                      <Text size="sm" ta="center">
                        {item.quantity}
                      </Text>
                    ) : (
                      <NumberInput
                        value={item.quantity}
                        min={1}
                        onChange={(value) => handleUpdateItem(item.id, 'quantity', value || 1)}
                        size="xs"
                        disabled={isReadOnly}
                      />
                    )}
                  </Table.Td>
                  <Table.Td>
                    {isReadOnly ? (
                      <Text size="sm" ta="center">
                        {item.unit}
                      </Text>
                    ) : (
                      <TextInput
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                        size="xs"
                        disabled={isReadOnly}
                      />
                    )}
                  </Table.Td>
                  <Table.Td>
                    {isReadOnly ? (
                      <Text size="sm" ta="center">
                        {item.notes}
                      </Text>
                    ) : (
                      <TextInput
                        value={item.notes}
                        onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)}
                        size="xs"
                      />
                    )}
                  </Table.Td>
                  {!isReadOnly && (
                    <Table.Td>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
              {!isReadOnly && (
                <Table.Tr>
                  <Table.Td>
                    <POProductSearch
                      size="xs"
                      productOptions={productOptions}
                      key={items.length}
                      onChange={(product) => handleProductSelection('new', product)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <TextInput
                      placeholder={t('po.description')}
                      value={newItem.description || ''}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      size="xs"
                    />
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      placeholder={t('po.quantity')}
                      value={newItem.quantity || 1}
                      min={1}
                      onChange={(value) =>
                        setNewItem({ ...newItem, quantity: typeof value === 'number' ? value : 1 })
                      }
                      size="xs"
                    />
                  </Table.Td>
                  <Table.Td>
                    <TextInput
                      placeholder={t('common.unit')}
                      value={newItem.unit || ''}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      size="xs"
                    />
                  </Table.Td>
                  <Table.Td>
                    <TextInput
                      placeholder={t('common.notes')}
                      value={newItem.notes || ''}
                      onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                      size="xs"
                    />
                  </Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={handleAddItem}
                      disabled={
                        !newItem.productCode ||
                        !newItem.description ||
                        !newItem.quantity ||
                        newItem.quantity <= 0
                      }
                    >
                      {t('common.add')}
                    </Button>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Stack>
    </Card>
  );
}
