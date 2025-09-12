import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  Select,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';

import { ModalOrDrawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { ProductStatus } from '@/services/sales/product';

import type { UseFormReturnType } from '@mantine/form';

export type ProductFormValues = {
  productCode: string;
  name: string;
  color?: string;
  description?: string;
  category?: string;
  status: ProductStatus;
  unit?: string;
  sku?: string;
  barcode?: string;
  metaData?: Record<string, string>;
};

type ProductFormModalProps = {
  readonly canCreate: boolean;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly mode: 'create' | 'edit';
  readonly form: UseFormReturnType<ProductFormValues>;
  readonly onSubmit: (values: ProductFormValues) => void;
  readonly onDelete?: () => void;
  readonly isLoading: boolean;
};

export function ProductFormModal({
  canCreate,
  canEdit,
  canDelete,
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

            {/* Unit */}
            <TextInput
              label={t('product.unit')}
              placeholder={t('product.unitPlaceholder')}
              error={form.errors.unit}
              disabled={isLoading}
              {...form.getInputProps('unit')}
            />

            {/* Action Buttons */}
            <Group justify="space-between" mt="md">
              {mode === 'edit' && onDelete ? (
                <Button
                  variant="light"
                  color="red"
                  onClick={onDelete}
                  disabled={isLoading || !canDelete}
                >
                  {t('common.delete')}
                </Button>
              ) : (
                <div />
              )}
              <Group>
                <Button variant="default" onClick={onClose} disabled={isLoading}>
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={
                    isLoading || (mode === 'create' && !canCreate) || (mode === 'edit' && !canEdit)
                  }
                >
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
