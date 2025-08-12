import { memo, useState, useMemo, useEffect } from 'react';
import {
  Table,
  TextInput,
  NumberInput,
  Select,
  ActionIcon,
  Stack,
  Text,
  Autocomplete,
} from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatCurrency } from '@/utils/number';
import { showErrorNotification } from '@/utils/notifications';
import { useProductList, usePOActions } from '@/stores/usePOStore';
import type { POItem } from '@/lib/api/schemas/sales.schemas';

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

function POItemsEditorComponent({ items, onChange, disabled = false }: POItemsEditorProps) {
  const { t } = useTranslation();

  // Get products from store
  const products = useProductList();
  const { loadProducts } = usePOActions();
  const [productSearch, setProductSearch] = useState('');

  const [newItem, setNewItem] = useState<Partial<POItem>>({
    productCode: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    category: '',
  });

  // Load products on mount if not already loaded
  useEffect(() => {
    if (products.length === 0) {
      loadProducts();
    }
  }, [products.length, loadProducts]);

  // Generate autocomplete data from products with search filter
  const productOptions = useMemo(() => {
    // For Mantine Autocomplete, we need to return an array of strings
    // We'll create a map to look up products by their display label
    return products.map((p) => `${p.productCode} - ${p.name}`);
  }, [products]);

  const handleAddItem = () => {
    if (
      !newItem.productCode ||
      !newItem.description ||
      !newItem.quantity ||
      newItem.unitPrice === undefined
    ) {
      return;
    }

    // Check for duplicate product
    const isDuplicate = items.some((item) => item.productCode === newItem.productCode);

    if (isDuplicate) {
      showErrorNotification(t('common.error'), `Product ${newItem.productCode} is already added`);
      return;
    }

    const quantity = newItem.quantity || 0;
    const unitPrice = newItem.unitPrice || 0;
    const discount = newItem.discount || 0;
    const totalPrice = quantity * unitPrice * (1 - discount / 100);

    const item: POItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      purchaseOrderId: '', // Will be set when the PO is created
      productCode: newItem.productCode,
      description: newItem.description,
      quantity,
      unitPrice,
      totalPrice: Math.round(totalPrice * 100) / 100,
      discount: discount > 0 ? discount : undefined,
      category: newItem.category,
      createdAt: new Date(),
      updatedAt: new Date(),
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
    setProductSearch('');
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
            <Table.Th style={{ width: 150 }}>{t('po.productCode')}</Table.Th>
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
                <Autocomplete
                  size="xs"
                  value={item.productCode}
                  onChange={(value) => {
                    handleUpdateItem(item.id, 'productCode', value);
                  }}
                  onOptionSubmit={(value) => {
                    // value is the selected option from dropdown (format: "CODE - Name")
                    const productCode = value.split(' - ')[0];
                    const product = products.find((p) => p.productCode === productCode);
                    if (product) {
                      // Update all fields at once
                      const updatedItems = items.map((currentItem) => {
                        if (currentItem.id === item.id) {
                          const quantity = currentItem.quantity;
                          const discount = currentItem.discount || 0;
                          const unitPrice = product.unitPrice;
                          const totalPrice =
                            Math.round(quantity * unitPrice * (1 - discount / 100) * 100) / 100;

                          return {
                            ...currentItem,
                            productCode: product.productCode,
                            description: product.name,
                            unitPrice: product.unitPrice,
                            category: product.category || currentItem.category,
                            totalPrice,
                          };
                        }
                        return currentItem;
                      });
                      onChange(updatedItems);
                    }
                  }}
                  data={productOptions}
                  disabled={disabled}
                  limit={10}
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
              <Autocomplete
                size="xs"
                placeholder={t('po.enterCode')}
                value={productSearch}
                onChange={(value) => {
                  setProductSearch(value);
                  // Only update productCode if no product is selected from dropdown
                  // The auto-fill happens in onOptionSubmit
                  if (!value.includes(' - ')) {
                    setNewItem({ ...newItem, productCode: value });
                  }
                }}
                onOptionSubmit={(value) => {
                  // value is the selected option from dropdown (format: "CODE - Name")
                  const productCode = value.split(' - ')[0];
                  const product = products.find((p) => p.productCode === productCode);
                  if (product) {
                    // Update all fields at once for new item
                    setNewItem({
                      ...newItem,
                      productCode: product.productCode,
                      description: product.name,
                      unitPrice: product.unitPrice,
                      category: product.category || newItem.category || '',
                    });
                    setProductSearch(product.productCode);
                  }
                }}
                data={productOptions}
                disabled={disabled}
                limit={10}
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

export const POItemsEditor = memo(POItemsEditorComponent);
