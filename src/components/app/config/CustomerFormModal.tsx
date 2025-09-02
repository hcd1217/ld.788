import { Stack, TextInput, Switch, Group, Button, LoadingOverlay, Box } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import { ModalOrDrawer } from '@/components/common';
import type { UseFormReturnType } from '@mantine/form';

export type CustomerFormValues = {
  name: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  googleMapsUrl?: string;
  taxCode?: string;
  isActive?: boolean;
};

type CustomerFormModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly mode: 'create' | 'edit';
  readonly canCreate: boolean;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  readonly form: UseFormReturnType<CustomerFormValues>;
  readonly onSubmit: (values: CustomerFormValues) => void;
  readonly onDelete?: () => void;
  readonly isLoading: boolean;
};

export function CustomerFormModal({
  opened,
  onClose,
  mode,
  canCreate,
  canEdit,
  canDelete,
  form,
  onSubmit,
  onDelete,
  isLoading,
}: CustomerFormModalProps) {
  const { t } = useTranslation();
  const title = mode === 'create' ? t('common.add') : t('common.edit');

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
            <TextInput
              required
              label={t('common.name')}
              placeholder={t('customer.namePlaceholder')}
              error={form.errors.name}
              disabled={isLoading}
              {...form.getInputProps('name')}
            />
            <TextInput
              label={t('customer.company')}
              placeholder={t('customer.companyPlaceholder')}
              error={form.errors.companyName}
              disabled={isLoading}
              {...form.getInputProps('companyName')}
            />
            <TextInput
              label={t('common.email')}
              placeholder={t('customer.emailPlaceholder')}
              error={form.errors.contactEmail}
              disabled={isLoading}
              {...form.getInputProps('contactEmail')}
            />
            <TextInput
              label={t('common.phone')}
              placeholder={t('customer.phonePlaceholder')}
              error={form.errors.contactPhone}
              disabled={isLoading}
              {...form.getInputProps('contactPhone')}
            />
            <TextInput
              label={t('customer.address')}
              placeholder={t('customer.addressPlaceholder')}
              error={form.errors.address}
              disabled={isLoading}
              {...form.getInputProps('address')}
            />
            <TextInput
              label={t('common.googleMapsUrl')}
              placeholder={t('common.googleMapsUrlPlaceholder')}
              error={form.errors.googleMapsUrl}
              disabled={isLoading}
              {...form.getInputProps('googleMapsUrl')}
            />
            <TextInput
              label={t('customer.taxCode')}
              placeholder={t('customer.taxCodePlaceholder')}
              error={form.errors.taxCode}
              disabled={isLoading}
              {...form.getInputProps('taxCode')}
            />
            {mode === 'edit' && (
              <Switch
                label={t('common.active')}
                disabled={isLoading}
                {...form.getInputProps('isActive', { type: 'checkbox' })}
              />
            )}
            <Group justify="space-between" mt="md">
              {mode === 'edit' && onDelete && canDelete ? (
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
