import {
  memo,
  useState,
  useMemo,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
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
import { useDeviceType } from '@/hooks/useDeviceType';
import { POItemsEditorMobile } from './POItemsEditorMobile';
import { formatCurrency } from '@/utils/number';
import { showErrorNotification } from '@/utils/notifications';
import { useProductList, usePOActions, usePOLoading } from '@/stores/usePOStore';
import { createPOItem, calculateItemTotal } from '@/utils/poItemUtils';
import { PRODUCT_CATEGORIES } from '@/constants/purchaseOrder';
import type { POItem } from '@/services/sales/purchaseOrder';

type POItemsEditorProps = {
  readonly items: POItem[];
  readonly onChange: (items: POItem[]) => void;
  readonly disabled?: boolean;
  readonly onModalStateChange?: (isOpen: boolean) => void;
};

export type POItemsEditorRef = {
  hasPendingItem: () => boolean;
  getPendingItemDetails: () => Partial<POItem> | null;
  buildPendingItem: () => POItem | null;
  addPendingItem: () => POItem | null;
  clearPendingItem: () => void;
};

const POItemsEditorDesktop = forwardRef<POItemsEditorRef, POItemsEditorProps>(
  ({ items, onChange, disabled = false }, ref) => {
    const { t } = useTranslation();

    // Get products from store
    const products = useProductList();
    const isProductsLoading = usePOLoading();
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

    const handleAddItem = useCallback(() => {
      const result = createPOItem(newItem, items);

      if (result.error) {
        showErrorNotification(t('common.error'), result.error);
        return null;
      }

      if (result.item) {
        onChange([...items, result.item]);

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
      (id: string, field: keyof POItem, value: any) => {
        const updatedItems = items.map((item) => {
          if (item.id === id) {
            const updated = { ...item, [field]: value };

            // Recalculate total if quantity, price, or discount changed
            if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
              const quantity = field === 'quantity' ? value : updated.quantity;
              const unitPrice = field === 'unitPrice' ? value : updated.unitPrice;
              const discount = field === 'discount' ? value || 0 : updated.discount || 0;
              updated.totalPrice = calculateItemTotal(quantity, unitPrice, discount);
            }

            return updated;
          }
          return item;
        });

        onChange(updatedItems);
      },
      [items, onChange],
    );

    // Memoized handler creators for table row updates to prevent re-renders
    const handleProductCodeChange = useCallback(
      (id: string, value: string) => {
        handleUpdateItem(id, 'productCode', value);
      },
      [handleUpdateItem],
    );

    const handleDescriptionChange = useCallback(
      (id: string, value: string) => {
        handleUpdateItem(id, 'description', value);
      },
      [handleUpdateItem],
    );

    const handleCategoryChange = useCallback(
      (id: string, value: string | null) => {
        handleUpdateItem(id, 'category', value);
      },
      [handleUpdateItem],
    );

    const handleQuantityChange = useCallback(
      (id: string, value: string | number) => {
        handleUpdateItem(id, 'quantity', value || 0);
      },
      [handleUpdateItem],
    );

    const handleUnitPriceChange = useCallback(
      (id: string, value: string | number) => {
        handleUpdateItem(id, 'unitPrice', value || 0);
      },
      [handleUpdateItem],
    );

    const handleDiscountChange = useCallback(
      (id: string, value: string | number) => {
        handleUpdateItem(id, 'discount', value || 0);
      },
      [handleUpdateItem],
    );

    // Handle product selection from autocomplete dropdown
    const handleProductSelection = useCallback(
      (itemId: string, value: string) => {
        // value is the selected option from dropdown (format: "CODE - Name")
        const productCode = value.split(' - ')[0];
        const product = products.find((p) => p.productCode === productCode);
        if (product) {
          // Update all fields at once
          const updatedItems = items.map((currentItem) => {
            if (currentItem.id === itemId) {
              const quantity = currentItem.quantity;
              const discount = currentItem.discount || 0;
              const unitPrice = product.unitPrice;
              const totalPrice = calculateItemTotal(quantity, unitPrice, discount);

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
      },
      [items, products, onChange],
    );

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    // Helper to build a POItem from newItem without adding it
    const buildItemFromNewItem = useCallback(() => {
      const result = createPOItem(newItem, items);
      return result.item;
    }, [newItem, items]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        hasPendingItem: () => {
          return Boolean(
            newItem.productCode ||
              newItem.description ||
              (newItem.quantity && newItem.quantity !== 1) ||
              (newItem.unitPrice && newItem.unitPrice !== 0) ||
              (newItem.discount && newItem.discount !== 0) ||
              newItem.category,
          );
        },
        getPendingItemDetails: () => {
          if (
            !newItem.productCode &&
            !newItem.description &&
            (!newItem.quantity || newItem.quantity === 1) &&
            (!newItem.unitPrice || newItem.unitPrice === 0)
          ) {
            return null;
          }
          return newItem;
        },
        buildPendingItem: () => {
          return buildItemFromNewItem();
        },
        addPendingItem: () => {
          return handleAddItem();
        },
        clearPendingItem: () => {
          setNewItem({
            productCode: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            discount: 0,
            category: '',
          });
          setProductSearch('');
        },
      }),
      [newItem, handleAddItem, buildItemFromNewItem],
    );

    return (
      <Stack gap="md">
        <Table withTableBorder withColumnBorders aria-label={t('po.itemsTableAriaLabel')}>
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
                    onChange={(value) => handleProductCodeChange(item.id, value)}
                    onOptionSubmit={(value) => handleProductSelection(item.id, value)}
                    data={productOptions}
                    disabled={disabled || isProductsLoading}
                    limit={10}
                    placeholder={isProductsLoading ? t('common.downloading') : undefined}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    size="xs"
                    value={item.description}
                    onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                    disabled={disabled}
                  />
                </Table.Td>
                <Table.Td>
                  <Select
                    size="xs"
                    value={item.category || ''}
                    onChange={(value) => handleCategoryChange(item.id, value)}
                    data={PRODUCT_CATEGORIES}
                    clearable
                    disabled={disabled}
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    size="xs"
                    value={item.quantity}
                    onChange={(value) => handleQuantityChange(item.id, value)}
                    min={1}
                    disabled={disabled}
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    size="xs"
                    value={item.unitPrice}
                    step={1000}
                    onChange={(value) => handleUnitPriceChange(item.id, value)}
                    min={0}
                    thousandSeparator=","
                    disabled={disabled}
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    size="xs"
                    value={item.discount || 0}
                    onChange={(value) => handleDiscountChange(item.id, value)}
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
                  placeholder={isProductsLoading ? t('common.downloading') : t('po.enterCode')}
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
                  disabled={disabled || isProductsLoading}
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
                  data={PRODUCT_CATEGORIES}
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
                  step={1000}
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
  },
);

POItemsEditorDesktop.displayName = 'POItemsEditorDesktop';

const POItemsEditorComponent = forwardRef<POItemsEditorRef, POItemsEditorProps>((props, ref) => {
  const { isMobile } = useDeviceType();

  if (isMobile) {
    return <POItemsEditorMobile ref={ref} {...props} />;
  }

  // Desktop doesn't need modal state change callback
  const { onModalStateChange, ...desktopProps } = props;
  return <POItemsEditorDesktop ref={ref} {...desktopProps} />;
});

POItemsEditorComponent.displayName = 'POItemsEditor';

export const POItemsEditor = memo(POItemsEditorComponent);
