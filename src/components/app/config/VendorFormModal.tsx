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
import type { Vendor } from '@/services/sales/vendor';
import { useClientConfig, usePermissions } from '@/stores/useAppStore';
import { confirmAction } from '@/utils/modals';
import { canCreateVendor, canDeleteVendor, canEditVendor } from '@/utils/permission.utils';

import type { UseFormReturnType } from '@mantine/form';

export type VendorFormValues = {
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  googleMapsUrl?: string;
  taxCode?: string;
  isActive: boolean;
  memo?: string;
  pic?: string;
};

type VendorFormModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly mode: 'create' | 'edit';
  readonly form: UseFormReturnType<VendorFormValues>;
  readonly onSubmit: (values: VendorFormValues) => void;
  readonly onActivate?: () => void;
  readonly onDeactivate?: () => void;
  readonly isLoading: boolean;
  readonly vendor?: Vendor;
};

export function VendorFormModal({
  opened,
  onClose,
  mode,
  form,
  onSubmit,
  onActivate,
  onDeactivate,
  isLoading,
  vendor,
}: VendorFormModalProps) {
  const { t } = useTranslation();
  const title = mode === 'create' ? t('common.add') : t('common.edit');
  const clientConfig = useClientConfig();
  const permissions = usePermissions();

  const { noEmail, noTaxCode } = useMemo(() => {
    return clientConfig.features?.vendor ?? { noEmail: false, noTaxCode: false };
  }, [clientConfig]);

  const { canCreate, canEdit, canDelete } = useMemo(() => {
    return {
      canCreate: canCreateVendor(permissions),
      canEdit: canEditVendor(permissions),
      canDelete: canDeleteVendor(permissions),
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
            {/* Vendor Status Alert */}
            {mode === 'edit' && vendor && (
              <Alert
                icon={<IconInfoCircle size={16} />}
                variant="light"
                color={!vendor.isActive ? 'var(--app-inactive-color)' : 'var(--app-active-color)'}
              >
                {t('common.status')}:{' '}
                {!vendor.isActive ? t('employee.inactive') : t('common.active')}
              </Alert>
            )}
            <ScrollArea style={{ height: '50vh' }}>
              <TextInput
                required
                label={t('common.name')}
                placeholder={t('vendor.namePlaceholder')}
                error={form.errors.name}
                disabled={isLoading}
                {...form.getInputProps('name')}
              />

              <TextInput
                label={t('common.form.pic')}
                placeholder={t('common.form.picPlaceholder')}
                error={form.errors.pic}
                disabled={isLoading}
                {...form.getInputProps('pic')}
              />

              {!noEmail && (
                <TextInput
                  label={t('common.form.email')}
                  placeholder={t('common.form.emailPlaceholder')}
                  error={form.errors.contactEmail}
                  disabled={isLoading}
                  {...form.getInputProps('contactEmail')}
                />
              )}

              <TextInput
                label={t('common.phone')}
                placeholder={t('vendor.phonePlaceholder')}
                error={form.errors.contactPhone}
                disabled={isLoading}
                {...form.getInputProps('contactPhone')}
              />

              <TextInput
                label={t('vendor.address')}
                placeholder={t('vendor.addressPlaceholder')}
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

              {!noTaxCode && (
                <TextInput
                  label={t('vendor.taxCode')}
                  placeholder={t('vendor.taxCodePlaceholder')}
                  error={form.errors.taxCode}
                  disabled={isLoading}
                  {...form.getInputProps('taxCode')}
                />
              )}

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
            <Group justify="space-between" mt="md">
              <Group>
                {mode === 'edit' && vendor && (
                  <>
                    {!vendor.isActive ? (
                      <Button
                        color="var(--app-active-color)"
                        leftSection={<IconCheck size={16} />}
                        onClick={() => {
                          confirmAction({
                            title: t('common.activate'),
                            message: `${t('common.activate')} "${vendor.name}"?`,
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
                            message: `${t('common.deactivate')} "${vendor.name}"?`,
                            confirmLabel: t('common.deactivate'),
                            cancelLabel: t('common.cancel'),
                            confirmColor: 'var(--app-inactive-color)',
                            onConfirm: () => onDeactivate?.(),
                          });
                        }}
                        disabled={isLoading || !canDelete}
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
