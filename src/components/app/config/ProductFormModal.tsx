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
import { useTranslation } from '@/hooks/useTranslation';
import { ModalOrDrawer } from '@/components/common';
import type { UseFormReturnType } from '@mantine/form';
import type { ProductStatus } from '@/services/sales/product';

export type ProductFormValues = {
  productCode: string;
  name: string;
  color?: string;
  description?: string;
  category?: string;
  unitPrice: number;
  costPrice?: number;
  status: ProductStatus;
  stockLevel?: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  sku?: string;
  barcode?: string;
  metaData?: Record<string, string>;
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
            <Select
              required
              label={t('common.status')}
              placeholder={t('product.statusPlaceholder')}
              data={statusOptions}
              error={form.errors.status}
              disabled={isLoading}
              {...form.getInputProps('status')}
            />
            <Group grow>
              <TextInput
                label={t('product.category')}
                placeholder={t('product.categoryPlaceholder')}
                error={form.errors.category}
                disabled={isLoading}
                {...form.getInputProps('category')}
              />
              <TextInput
                label={t('product.color')}
                placeholder={t('product.colorPlaceholder')}
                error={form.errors.color}
                disabled={isLoading}
                {...form.getInputProps('color')}
              />
            </Group>

            {/* Stock information */}
            <Group grow>
              <NumberInput
                label={t('product.stockLevel')}
                placeholder={t('product.stockLevelPlaceholder')}
                error={form.errors.stockLevel}
                disabled={isLoading}
                {...form.getInputProps('stockLevel')}
              />
              <NumberInput
                label={t('product.minStock')}
                placeholder={t('product.minStockPlaceholder')}
                error={form.errors.minStock}
                disabled={isLoading}
                {...form.getInputProps('minStock')}
              />
            </Group>

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
              <TextInput
                label={t('product.unit')}
                placeholder={t('product.unitPlaceholder')}
                error={form.errors.unit}
                disabled={isLoading}
                {...form.getInputProps('unit')}
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
