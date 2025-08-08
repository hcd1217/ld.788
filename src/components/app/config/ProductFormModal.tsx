import {
  Stack,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Group,
  Button,
  LoadingOverlay,
  Box,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ModalOrDrawer } from '@/components/common';
import type { UseFormReturnType } from '@mantine/form';
import type { ProductStatus } from '@/services/sales/product';

export type ProductFormValues = {
  productCode: string;
  name: string;
  description?: string;
  category?: string;
  unitPrice: number;
  costPrice?: number;
  status: ProductStatus;
  stockLevel: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  sku?: string;
  barcode?: string;
};

type ProductFormModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly mode: 'create' | 'edit';
  readonly form: UseFormReturnType<ProductFormValues>;
  readonly onSubmit: (values: ProductFormValues) => void;
  readonly onDelete?: () => void;
  readonly isLoading: boolean;
};

export function ProductFormModal({
  opened,
  onClose,
  mode,
  form,
  onSubmit,
  onDelete,
  isLoading,
}: ProductFormModalProps) {
  const { t } = useTranslation();
  const title = mode === 'create' ? t('product.addProduct') : t('product.editProduct');

  const statusOptions = [
    { value: 'ACTIVE', label: t('product.status.active') },
    { value: 'INACTIVE', label: t('product.status.inactive') },
    { value: 'DISCONTINUED', label: t('product.status.discontinued') },
    { value: 'OUT_OF_STOCK', label: t('product.status.outOfStock') },
    { value: 'LOW_STOCK', label: t('product.status.lowStock') },
  ];

  return (
    <ModalOrDrawer title={title} opened={opened} onClose={onClose} drawerSize="md">
      <Box style={{ position: 'relative' }}>
        <LoadingOverlay
          visible={isLoading}
          overlayProps={{ blur: 2 }}
          transitionProps={{ duration: 300 }}
        />
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack gap="md">
            {/* Basic Information */}
            <TextInput
              required
              label={t('product.productCode')}
              placeholder={t('product.productCodePlaceholder')}
              error={form.errors.productCode}
              disabled={isLoading || mode === 'edit'}
              {...form.getInputProps('productCode')}
            />
            <TextInput
              required
              label={t('common.name')}
              placeholder={t('product.namePlaceholder')}
              error={form.errors.name}
              disabled={isLoading}
              {...form.getInputProps('name')}
            />
            <Textarea
              label={t('common.description')}
              placeholder={t('product.descriptionPlaceholder')}
              error={form.errors.description}
              disabled={isLoading}
              minRows={2}
              {...form.getInputProps('description')}
            />
            <TextInput
              label={t('product.category')}
              placeholder={t('product.categoryPlaceholder')}
              error={form.errors.category}
              disabled={isLoading}
              {...form.getInputProps('category')}
            />

            {/* Pricing */}
            <Group grow>
              <NumberInput
                required
                label={t('product.unitPrice')}
                placeholder={t('product.unitPricePlaceholder')}
                error={form.errors.unitPrice}
                disabled={isLoading}
                decimalScale={2}
                min={0}
                {...form.getInputProps('unitPrice')}
              />
              <NumberInput
                label={t('product.costPrice')}
                placeholder={t('product.costPricePlaceholder')}
                error={form.errors.costPrice}
                disabled={isLoading}
                decimalScale={2}
                min={0}
                {...form.getInputProps('costPrice')}
              />
            </Group>

            {/* Stock Information */}
            <Group grow>
              <NumberInput
                required
                label={t('product.stockLevel')}
                placeholder={t('product.stockLevelPlaceholder')}
                error={form.errors.stockLevel}
                disabled={isLoading}
                min={0}
                {...form.getInputProps('stockLevel')}
              />
              <TextInput
                label={t('product.unit')}
                placeholder={t('product.unitPlaceholder')}
                error={form.errors.unit}
                disabled={isLoading}
                {...form.getInputProps('unit')}
              />
            </Group>

            <Group grow>
              <NumberInput
                label={t('product.minStock')}
                placeholder={t('product.minStockPlaceholder')}
                error={form.errors.minStock}
                disabled={isLoading}
                min={0}
                {...form.getInputProps('minStock')}
              />
              <NumberInput
                label={t('product.maxStock')}
                placeholder={t('product.maxStockPlaceholder')}
                error={form.errors.maxStock}
                disabled={isLoading}
                min={0}
                {...form.getInputProps('maxStock')}
              />
            </Group>

            {/* Status */}
            <Select
              required
              label={t('common.status')}
              placeholder={t('product.statusPlaceholder')}
              data={statusOptions}
              error={form.errors.status}
              disabled={isLoading}
              {...form.getInputProps('status')}
            />

            {/* Additional Information */}
            <Group grow>
              <TextInput
                label={t('product.sku')}
                placeholder={t('product.skuPlaceholder')}
                error={form.errors.sku}
                disabled={isLoading}
                {...form.getInputProps('sku')}
              />
              <TextInput
                label={t('product.barcode')}
                placeholder={t('product.barcodePlaceholder')}
                error={form.errors.barcode}
                disabled={isLoading}
                {...form.getInputProps('barcode')}
              />
            </Group>

            {/* Action Buttons */}
            <Group justify="space-between" mt="md">
              {mode === 'edit' && onDelete ? (
                <Button variant="light" color="red" onClick={onDelete} disabled={isLoading}>
                  {t('common.delete')}
                </Button>
              ) : (
                <div />
              )}
              <Group>
                <Button variant="default" onClick={onClose} disabled={isLoading}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" loading={isLoading}>
                  {mode === 'create' ? t('common.add') : t('common.save')}
                </Button>
              </Group>
            </Group>
          </Stack>
        </form>
      </Box>
    </ModalOrDrawer>
  );
}
