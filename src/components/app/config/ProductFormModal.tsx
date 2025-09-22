import { useMemo } from 'react';

import {
  Alert,
  Box,
  Button,
  Group,
  LoadingOverlay,
  ScrollArea,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { IconCheck, IconInfoCircle, IconTrash } from '@tabler/icons-react';

import { ModalOrDrawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { Product } from '@/services/sales/product';
import { usePermissions } from '@/stores/useAppStore';
import { confirmAction } from '@/utils/modals';
import { canCreateProduct, canEditProduct } from '@/utils/permission.utils';

import type { UseFormReturnType } from '@mantine/form';

export type ProductFormValues = {
  productCode: string;
  name: string;
  description?: string;
  category?: string;
  unit?: string;
  color?: string;
};

type ProductFormModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly mode: 'create' | 'edit';
  readonly form: UseFormReturnType<ProductFormValues>;
  readonly onSubmit: (values: ProductFormValues) => void;
  readonly onActivate?: () => void;
  readonly onDeactivate?: () => void;
  readonly isLoading: boolean;
  readonly product?: Product;
};

export function ProductFormModal({
  opened,
  onClose,
  mode,
  form,
  onSubmit,
  onActivate,
  onDeactivate,
  isLoading,
  product,
}: ProductFormModalProps) {
  const { t } = useTranslation();
  const title = mode === 'create' ? t('product.addProduct') : t('product.editProduct');
  const permissions = usePermissions();

  const { canCreate, canEdit } = useMemo(() => {
    return {
      canCreate: canCreateProduct(permissions),
      canEdit: canEditProduct(permissions),
    };
  }, [permissions]);

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
            {/* Product Status Alert */}
            {mode === 'edit' && product && (
              <Alert
                icon={<IconInfoCircle size={16} />}
                variant="light"
                color={product.isDeleted ? 'var(--app-inactive-color)' : 'var(--app-active-color)'}
              >
                {t('common.status')}:{' '}
                {product.isDeleted ? t('product.inactive') : t('product.active')}
              </Alert>
            )}
            <ScrollArea style={{ height: '50vh' }}>
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
              <Textarea
                label={t('common.form.memo')}
                placeholder={t('common.form.memoPlaceholder')}
                minRows={4}
                autosize
                maxRows={4}
                error={form.errors.memo}
                disabled={isLoading}
                {...form.getInputProps('memo')}
              />
            </ScrollArea>

            {/* Action Buttons */}
            <Group justify="space-between" mt="md">
              <Group>
                {mode === 'edit' && product && (
                  <>
                    {product.isDeleted ? (
                      <Button
                        color="var(--app-active-color)"
                        leftSection={<IconCheck size={16} />}
                        onClick={() => {
                          confirmAction({
                            title: t('common.activate'),
                            message: `${t('common.activate')} "${product.name}"?`,
                            confirmLabel: t('common.activate'),
                            cancelLabel: t('common.cancel'),
                            confirmColor: 'var(--app-active-color)',
                            onConfirm: () => onActivate?.(),
                          });
                        }}
                        disabled={isLoading || !canEdit}
                      >
                        {t('common.activate')}
                      </Button>
                    ) : (
                      <Button
                        color="var(--app-inactive-color)"
                        leftSection={<IconTrash size={16} />}
                        onClick={() => {
                          confirmAction({
                            title: t('common.deactivate'),
                            message: `${t('common.deactivate')} "${product.name}"?`,
                            confirmLabel: t('common.deactivate'),
                            cancelLabel: t('common.cancel'),
                            confirmColor: 'var(--app-inactive-color)',
                            onConfirm: () => onDeactivate?.(),
                          });
                        }}
                        disabled={isLoading || !canEdit}
                      >
                        {t('common.deactivate')}
                      </Button>
                    )}
                  </>
                )}
              </Group>
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
