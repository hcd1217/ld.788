import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Drawer,
  TextInput,
  NumberInput,
  Select,
  Autocomplete,
  Button,
  Group,
  Stack,
  Text,
  ScrollArea,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { formatCurrency } from '@/utils/number';
import { showErrorNotification } from '@/utils/notifications';
import { calculateItemTotal } from '@/utils/poItemUtils';
import { PRODUCT_CATEGORIES } from '@/constants/purchaseOrder';
import {
  FOCUS_DELAY_MS,
  DRAWER_BODY_PADDING_BOTTOM,
  DRAWER_HEADER_PADDING,
  DRAWER_HEIGHT_CALC,
} from '@/constants/po.constants';
import type { POItem } from '@/services/sales/purchaseOrder';
import type { Product } from '@/services/sales/product';

type POAddItemModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onAdd: (
    item: Omit<POItem, 'id' | 'purchaseOrderId' | 'createdAt' | 'updatedAt'>,
  ) => void;
  readonly products: Product[];
  readonly existingItems: POItem[];
};

export function POAddItemModal({
  opened,
  onClose,
  onAdd,
  products,
  existingItems,
}: POAddItemModalProps) {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const initialFocusRef = useRef<HTMLInputElement>(null);

  const [productSearch, setProductSearch] = useState('');
  const [productCode, setProductCode] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  // Generate autocomplete options
  const productOptions = products.map((p) => `${p.productCode} - ${p.name}`);

  // Calculate total
  const totalPrice = calculateItemTotal(quantity, unitPrice, discount);

  // Reset form when modal closes and handle focus when modal opens
  useEffect(() => {
    if (!opened) {
      setProductSearch('');
      setProductCode('');
      setDescription('');
      setCategory(undefined);
      setQuantity(1);
      setUnitPrice(0);
      setDiscount(0);
    } else if (!isMobile) {
      // Only auto-focus on desktop to avoid disruptive keyboard/dropdown on mobile
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        if (initialFocusRef.current) {
          initialFocusRef.current.focus();
        }
      }, FOCUS_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [opened, isMobile]);

  const handleProductSelect = (value: string) => {
    const code = value.split(' - ')[0];
    const product = products.find((p) => p.productCode === code);
    if (product) {
      setProductCode(product.productCode);
      setDescription(product.name);
      setUnitPrice(product.unitPrice);
      setCategory(product.category || undefined);
      setProductSearch(product.productCode);
    }
  };

  const handleAdd = () => {
    // Validation
    if (!productCode || !description) {
      showErrorNotification(t('common.error'), t('po.itemsRequired'));
      return;
    }

    if (quantity <= 0 || unitPrice < 0) {
      showErrorNotification(t('common.error'), t('po.invalidQuantityOrPrice'));
      return;
    }

    // Check for duplicates
    const isDuplicate = existingItems.some((item) => item.productCode === productCode);
    if (isDuplicate) {
      showErrorNotification(t('common.error'), t('po.productAlreadyAdded', { productCode }));
      return;
    }

    // Create item
    const newItem = {
      productCode,
      description,
      quantity,
      unitPrice,
      totalPrice,
      discount: discount > 0 ? discount : undefined,
      category: category || undefined,
    };

    onAdd(newItem);
    onClose();
  };

  const content = (
    <Stack gap="md">
      {/* Product Search */}
      <Autocomplete
        ref={initialFocusRef}
        label={t('po.productCode')}
        placeholder={t('po.searchCustomer')}
        value={productSearch}
        onChange={(value) => {
          setProductSearch(value);
          if (!value.includes(' - ')) {
            setProductCode(value);
          }
        }}
        onOptionSubmit={handleProductSelect}
        data={productOptions}
        leftSection={<IconSearch size={16} />}
        size="md"
        required
        // Don't open dropdown on focus, only when typing
        defaultDropdownOpened={false}
      />

      {/* Description */}
      <TextInput
        label={t('po.description')}
        placeholder={t('po.enterDescription')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        size="md"
        required
      />

      {/* Category */}
      <Select
        label={t('po.category')}
        placeholder={t('po.selectCategory')}
        value={category || null}
        onChange={(value) => setCategory(value || undefined)}
        data={PRODUCT_CATEGORIES}
        clearable
        size="md"
      />

      {/* Quantity and Price */}
      <Group grow>
        <NumberInput
          label={t('po.quantity')}
          value={quantity}
          onChange={(val) => setQuantity(typeof val === 'number' ? val : 1)}
          min={1}
          size="md"
          required
        />
        <NumberInput
          label={t('po.unitPrice')}
          value={unitPrice}
          onChange={(val) => setUnitPrice(typeof val === 'number' ? val : 0)}
          min={0}
          step={1000}
          thousandSeparator=","
          prefix="₫"
          size="md"
          required
        />
      </Group>

      {/* Discount */}
      <NumberInput
        label={t('po.discount')}
        value={discount}
        onChange={(val) => setDiscount(typeof val === 'number' ? val : 0)}
        min={0}
        max={100}
        suffix="%"
        size="md"
      />

      {/* Total */}
      <Group
        justify="space-between"
        p="md"
        style={{
          backgroundColor: 'var(--mantine-color-gray-0)',
          borderRadius: 'var(--mantine-radius-md)',
        }}
      >
        <Text fw={500}>{t('po.total')}:</Text>
        <Text size="xl" fw={600} c="blue">
          {formatCurrency(totalPrice)}
        </Text>
      </Group>

      {/* Actions */}
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handleAdd} disabled={!productCode || !description || quantity <= 0}>
          {t('po.addPO')}
        </Button>
      </Group>
    </Stack>
  );

  // Use Drawer for mobile, Modal for desktop
  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        title={t('po.addPO')}
        position="bottom"
        size="90%"
        trapFocus
        returnFocus
        styles={{
          body: { paddingBottom: DRAWER_BODY_PADDING_BOTTOM },
          header: { padding: DRAWER_HEADER_PADDING },
        }}
      >
        <ScrollArea h={DRAWER_HEIGHT_CALC} type="never">
          {content}
        </ScrollArea>
      </Drawer>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('po.addPO')}
      size="lg"
      centered
      trapFocus
      returnFocus
    >
      {content}
    </Modal>
  );
}
