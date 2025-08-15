import { memo, useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Stack, Text, Affix, ActionIcon, Group, Card, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from '@/hooks/useTranslation';
import { formatCurrency } from '@/utils/number';
import { useProductList, usePOActions } from '@/stores/usePOStore';
import { POItemCard } from './POItemCard';
import { POAddItemModal } from './POAddItemModal';
import { createPOItem, calculateItemTotal } from '@/utils/poItemUtils';
import { FAB_BOTTOM_OFFSET, FAB_RIGHT_OFFSET, FAB_Z_INDEX } from '@/constants/po.constants';
import type { POItem } from '@/services/sales/purchaseOrder';
import type { POItemsEditorRef } from './POItemsEditor';

type POItemsEditorMobileProps = {
  readonly items: POItem[];
  readonly onChange: (items: POItem[]) => void;
  readonly disabled?: boolean;
  readonly onModalStateChange?: (isOpen: boolean) => void;
};

const POItemsEditorMobileComponent = forwardRef<POItemsEditorRef, POItemsEditorMobileProps>(
  ({ items, onChange, disabled = false, onModalStateChange }, ref) => {
    const { t } = useTranslation();
    const products = useProductList();
    const { loadProducts } = usePOActions();
    const [modalOpened, setModalOpened] = useState(false);
    const [pendingItem, setPendingItem] = useState<Partial<POItem> | undefined>(undefined);

    // Load products on mount if not already loaded
    useEffect(() => {
      if (products.length === 0) {
        loadProducts();
      }
    }, [products.length, loadProducts]);

    // Notify parent component when modal state changes
    useEffect(() => {
      onModalStateChange?.(modalOpened);
    }, [modalOpened, onModalStateChange]);

    const handleAddItem = useCallback(
      (newItemData: Omit<POItem, 'id' | 'purchaseOrderId' | 'createdAt' | 'updatedAt'>) => {
        const item: POItem = {
          id: uuidv4(),
          purchaseOrderId: '',
          ...newItemData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        onChange([...items, item]);
        setPendingItem(undefined);
      },
      [items, onChange],
    );

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

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    // Helper to build a POItem from pending item without adding it
    const buildItemFromPendingItem = useCallback(() => {
      if (!pendingItem) {
        return null;
      }

      const result = createPOItem(pendingItem, items);
      return result.item;
    }, [pendingItem, items]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        hasPendingItem: () => {
          // In mobile, we don't have inline editing, so check if modal has unsaved data
          return false; // Modal handles its own state
        },
        getPendingItemDetails: () => {
          return pendingItem || null;
        },
        buildPendingItem: () => {
          return buildItemFromPendingItem();
        },
        addPendingItem: () => {
          if (pendingItem) {
            const item = buildItemFromPendingItem();
            if (item) {
              handleAddItem({
                productCode: item.productCode,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                discount: item.discount,
                category: item.category,
              });
              return item;
            }
          }
          return null;
        },
        clearPendingItem: () => {
          setPendingItem(undefined);
        },
      }),
      [pendingItem, buildItemFromPendingItem, handleAddItem],
    );

    return (
      <>
        <Stack gap="md">
          {/* Items List */}
          {items.length === 0 ? (
            <Card withBorder radius="md" p="xl">
              <Stack align="center" gap="md">
                <Text size="sm" c="dimmed">
                  {t('po.itemsRequired')}
                </Text>
                <Button
                  leftSection={<IconPlus size={18} />}
                  onClick={() => setModalOpened(true)}
                  disabled={disabled}
                  size="md"
                >
                  {t('po.addPO')}
                </Button>
              </Stack>
            </Card>
          ) : (
            items.map((item) => (
              <POItemCard
                key={item.id}
                item={item}
                onUpdate={handleUpdateItem}
                onRemove={handleRemoveItem}
                disabled={disabled}
              />
            ))
          )}

          {/* Subtotal */}
          {items.length > 0 && (
            <Card
              withBorder
              radius="md"
              p="md"
              style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}
            >
              <Group justify="space-between">
                <Text fw={600} size="lg">
                  {t('po.subtotal')}:
                </Text>
                <Text fw={700} size="xl" c="blue">
                  {formatCurrency(subtotal)}
                </Text>
              </Group>
            </Card>
          )}
        </Stack>

        {/* Floating Action Button - hide when modal is open */}
        {!disabled && items.length > 0 && !modalOpened && (
          <Affix
            position={{ bottom: FAB_BOTTOM_OFFSET, right: FAB_RIGHT_OFFSET }}
            zIndex={FAB_Z_INDEX}
          >
            <ActionIcon
              size="xl"
              radius="xl"
              color="blue"
              onClick={() => setModalOpened(true)}
              aria-label={t('po.addPO')}
            >
              <IconPlus size={24} />
            </ActionIcon>
          </Affix>
        )}

        {/* Add Item Modal */}
        <POAddItemModal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          onAdd={handleAddItem}
          products={products}
          existingItems={items}
        />
      </>
    );
  },
);

POItemsEditorMobileComponent.displayName = 'POItemsEditorMobile';

export const POItemsEditorMobile = memo(POItemsEditorMobileComponent);
