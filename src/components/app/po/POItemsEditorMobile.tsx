import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useState } from 'react';

import { ActionIcon, Affix, Button, Card, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { v4 as uuidv4 } from 'uuid';

import { FAB_BOTTOM_OFFSET, FAB_RIGHT_OFFSET, FAB_Z_INDEX } from '@/constants/po.constants';
import { useTranslation } from '@/hooks/useTranslation';
import type { POItem } from '@/services/sales/purchaseOrder';
import { createPOItem } from '@/utils/poItemUtils';

import { POAddItemModal } from './POAddItemModal';
import { POItemCard } from './POItemCard';

// Define POItemsEditorRef locally since it's not exported from POItemsEditor
export type POItemsEditorRef = {
  hasPendingItem: () => boolean;
  getPendingItemDetails: () => Partial<POItem> | null;
  buildPendingItem: () => POItem | null;
  addPendingItem: () => POItem | null;
  clearPendingItem: () => void;
};

type POItemsEditorMobileProps = {
  readonly items: POItem[];
  readonly onChange: (items: POItem[]) => void;
  readonly disabled?: boolean;
  readonly onModalStateChange?: (isOpen: boolean) => void;
};

const POItemsEditorMobileComponent = forwardRef<POItemsEditorRef, POItemsEditorMobileProps>(
  ({ items, onChange, disabled = false, onModalStateChange }, ref) => {
    const { t } = useTranslation();
    const [modalOpened, setModalOpened] = useState(false);
    const [pendingItem, setPendingItem] = useState<Partial<POItem> | undefined>(undefined);

    // Notify parent component when modal state changes
    useEffect(() => {
      onModalStateChange?.(modalOpened);
    }, [modalOpened, onModalStateChange]);

    const handleAddItem = useCallback(
      (newItemData: Omit<POItem, 'id' | 'purchaseOrderId'>) => {
        const item: POItem = {
          id: uuidv4(),
          purchaseOrderId: '',
          ...newItemData,
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
            return updated;
          }
          return item;
        });

        onChange(updatedItems);
      },
      [items, onChange],
    );

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
                category: item.category,
                notes: item.notes,
                unit: item.unit,
                productId: item.productId,
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
        </Stack>

        {/* Floating Action Button - hide when modal is open */}
        {!disabled && items.length > 0 && !modalOpened && (
          <Affix
            position={{ bottom: FAB_BOTTOM_OFFSET, right: FAB_RIGHT_OFFSET }}
            zIndex={FAB_Z_INDEX}
          >
            <ActionIcon size="xl" radius="xl" color="blue" onClick={() => setModalOpened(true)}>
              <IconPlus size={24} />
            </ActionIcon>
          </Affix>
        )}

        {/* Add Item Modal */}
        <POAddItemModal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          onAdd={handleAddItem}
          existingItems={items}
        />
      </>
    );
  },
);

POItemsEditorMobileComponent.displayName = 'POItemsEditorMobile';

export const POItemsEditorMobile = memo(POItemsEditorMobileComponent);
