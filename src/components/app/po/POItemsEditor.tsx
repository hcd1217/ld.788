import { Table, TextInput, NumberInput, Select, ActionIcon, Stack, Text } from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatCurrency } from '@/utils/number';
import { useState } from 'react';
import type { POItem } from '@/services/sales/purchaseOrder';

type POItemsEditorProps = {
  readonly items: POItem[];
  readonly onChange: (items: POItem[]) => void;
  readonly disabled?: boolean;
};

const productCategories = [
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Office Supplies', label: 'Office Supplies' },
  { value: 'Hardware', label: 'Hardware' },
  { value: 'Software', label: 'Software' },
  { value: 'Services', label: 'Services' },
];

export function POItemsEditor({ items, onChange, disabled = false }: POItemsEditorProps) {
  const { t } = useTranslation();

  const [newItem, setNewItem] = useState<Partial<POItem>>({
    productCode: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    category: '',
  });

  const handleAddItem = () => {
    if (
      !newItem.productCode ||
      !newItem.description ||
      !newItem.quantity ||
      newItem.unitPrice === undefined
    ) {
      return;
    }

    const quantity = newItem.quantity || 0;
    const unitPrice = newItem.unitPrice || 0;
    const discount = newItem.discount || 0;
    const totalPrice = quantity * unitPrice * (1 - discount / 100);

    const item: POItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      productCode: newItem.productCode,
      description: newItem.description,
      quantity,
      unitPrice,
      totalPrice: Math.round(totalPrice * 100) / 100,
      discount: discount > 0 ? discount : undefined,
      category: newItem.category,
    };

    onChange([...items, item]);

    // Reset form
    setNewItem({
      productCode: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      category: '',
    });
  };

  const handleRemoveItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof POItem, value: any) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };

        // Recalculate total if quantity, price, or discount changed
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
          const quantity = field === 'quantity' ? value : updated.quantity;
          const unitPrice = field === 'unitPrice' ? value : updated.unitPrice;
          const discount = field === 'discount' ? value || 0 : updated.discount || 0;
          updated.totalPrice = Math.round(quantity * unitPrice * (1 - discount / 100) * 100) / 100;
        }

        return updated;
      }
      return item;
    });

    onChange(updatedItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Stack gap="md">
      <Table withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 120 }}>{t('po.productCode')}</Table.Th>
            <Table.Th>{t('po.description')}</Table.Th>
            <Table.Th style={{ width: 120 }}>{t('po.category')}</Table.Th>
            <Table.Th style={{ width: 80 }}>{t('po.quantity')}</Table.Th>
            <Table.Th style={{ width: 120 }}>{t('po.unitPrice')}</Table.Th>
            <Table.Th style={{ width: 80 }}>{t('po.discount')}</Table.Th>
            <Table.Th style={{ width: 120 }}>{t('po.total')}</Table.Th>
            <Table.Th style={{ width: 60 }}></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>
                <TextInput
                  size="xs"
                  value={item.productCode}
                  onChange={(e) => handleUpdateItem(item.id, 'productCode', e.target.value)}
                  disabled={disabled}
                />
              </Table.Td>
              <Table.Td>
                <TextInput
                  size="xs"
                  value={item.description}
                  onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                  disabled={disabled}
                />
              </Table.Td>
              <Table.Td>
                <Select
                  size="xs"
                  value={item.category || ''}
                  onChange={(value) => handleUpdateItem(item.id, 'category', value)}
                  data={productCategories}
                  clearable
                  disabled={disabled}
                />
              </Table.Td>
              <Table.Td>
                <NumberInput
                  size="xs"
                  value={item.quantity}
                  onChange={(value) => handleUpdateItem(item.id, 'quantity', value || 0)}
                  min={1}
                  disabled={disabled}
                />
              </Table.Td>
              <Table.Td>
                <NumberInput
                  size="xs"
                  value={item.unitPrice}
                  onChange={(value) => handleUpdateItem(item.id, 'unitPrice', value || 0)}
                  min={0}
                  thousandSeparator=","
                  disabled={disabled}
                />
              </Table.Td>
              <Table.Td>
                <NumberInput
                  size="xs"
                  value={item.discount || 0}
                  onChange={(value) => handleUpdateItem(item.id, 'discount', value || 0)}
                  min={0}
                  max={100}
                  suffix="%"
                  disabled={disabled}
                />
              </Table.Td>
              <Table.Td>
                <Text size="sm" ta="right">
                  {formatCurrency(item.totalPrice)}
                </Text>
              </Table.Td>
              <Table.Td>
                <ActionIcon
                  color="red"
                  variant="subtle"
                  size="sm"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={disabled}
                  aria-label={t('common.delete')}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}

          {/* Add new item row */}
          <Table.Tr>
            <Table.Td>
              <TextInput
                size="xs"
                placeholder={t('po.enterCode')}
                value={newItem.productCode || ''}
                onChange={(e) => setNewItem({ ...newItem, productCode: e.target.value })}
                disabled={disabled}
              />
            </Table.Td>
            <Table.Td>
              <TextInput
                size="xs"
                placeholder={t('po.enterDescription')}
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                disabled={disabled}
              />
            </Table.Td>
            <Table.Td>
              <Select
                size="xs"
                placeholder={t('po.selectCategory')}
                value={newItem.category || ''}
                onChange={(value) => setNewItem({ ...newItem, category: value || '' })}
                data={productCategories}
                clearable
                disabled={disabled}
              />
            </Table.Td>
            <Table.Td>
              <NumberInput
                size="xs"
                value={newItem.quantity || 1}
                onChange={(value) =>
                  setNewItem({ ...newItem, quantity: typeof value === 'number' ? value : 1 })
                }
                min={1}
                disabled={disabled}
              />
            </Table.Td>
            <Table.Td>
              <NumberInput
                size="xs"
                value={newItem.unitPrice || 0}
                onChange={(value) =>
                  setNewItem({ ...newItem, unitPrice: typeof value === 'number' ? value : 0 })
                }
                min={0}
                thousandSeparator=","
                disabled={disabled}
              />
            </Table.Td>
            <Table.Td>
              <NumberInput
                size="xs"
                value={newItem.discount || 0}
                onChange={(value) =>
                  setNewItem({ ...newItem, discount: typeof value === 'number' ? value : 0 })
                }
                min={0}
                max={100}
                suffix="%"
                disabled={disabled}
              />
            </Table.Td>
            <Table.Td>
              <Text size="sm" ta="right">
                {formatCurrency(
                  (newItem.quantity || 0) *
                    (newItem.unitPrice || 0) *
                    (1 - (newItem.discount || 0) / 100),
                )}
              </Text>
            </Table.Td>
            <Table.Td>
              <ActionIcon
                color="green"
                variant="subtle"
                size="sm"
                onClick={handleAddItem}
                disabled={disabled || !newItem.productCode || !newItem.description}
                aria-label={t('common.add')}
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
        <Table.Tfoot>
          <Table.Tr>
            <Table.Td colSpan={6} ta="right">
              <Text fw={600}>{t('po.subtotal')}:</Text>
            </Table.Td>
            <Table.Td>
              <Text fw={600} ta="right">
                {formatCurrency(subtotal)}
              </Text>
            </Table.Td>
            <Table.Td></Table.Td>
          </Table.Tr>
        </Table.Tfoot>
      </Table>
    </Stack>
  );
}
