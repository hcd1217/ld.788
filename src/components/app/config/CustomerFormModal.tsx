import { useMemo } from 'react';

import {
  Alert,
  Box,
  Button,
  Group,
  LoadingOverlay,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { IconCheck, IconInfoCircle, IconTrash } from '@tabler/icons-react';

import { ModalOrDrawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { Customer } from '@/services/sales/customer';
import { useClientConfig, usePermissions } from '@/stores/useAppStore';
import { canCreateCustomer, canDeleteCustomer, canEditCustomer } from '@/utils/permission.utils';

import type { UseFormReturnType } from '@mantine/form';

export type CustomerFormValues = {
  name: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  deliveryAddress?: string;
  pic?: string;
  googleMapsUrl?: string;
  taxCode?: string;
  isActive: boolean;
  memo?: string;
};

type CustomerFormModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly mode: 'create' | 'edit';
  readonly form: UseFormReturnType<CustomerFormValues>;
  readonly onSubmit: (values: CustomerFormValues) => void;
  readonly onActivate?: () => void;
  readonly onDeactivate?: () => void;
  readonly isLoading: boolean;
  readonly customer?: Customer;
};

export function CustomerFormModal({
  opened,
  onClose,
  mode,
  form,
  onSubmit,
  onActivate,
  onDeactivate,
  isLoading,
  customer,
}: CustomerFormModalProps) {
  const { t } = useTranslation();
  const title = mode === 'create' ? t('common.add') : t('common.edit');
  const clientConfig = useClientConfig();
  const permissions = usePermissions();

  const { noEmail, noTaxCode } = useMemo(() => {
    return clientConfig.features?.customer ?? { noEmail: false, noTaxCode: false };
  }, [clientConfig]);

  const { canCreate, canEdit, canDelete } = useMemo(() => {
    return {
      canCreate: canCreateCustomer(permissions),
      canEdit: canEditCustomer(permissions),
      canDelete: canDeleteCustomer(permissions),
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
            {/* Customer Status Alert */}
            {mode === 'edit' && customer && (
              <Alert
                icon={<IconInfoCircle size={16} />}
                variant="light"
                color={!customer.isActive ? 'var(--app-inactive-color)' : 'var(--app-active-color)'}
              >
                {t('common.status')}:{' '}
                {!customer.isActive ? t('employee.inactive') : t('common.active')}
              </Alert>
            )}

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
              label={t('customer.deliveryAddress')}
              placeholder={t('customer.deliveryAddressPlaceholder')}
              error={form.errors.deliveryAddress}
              disabled={isLoading}
              {...form.getInputProps('deliveryAddress')}
            />
            <TextInput
              label={
                form.values.deliveryAddress
                  ? t('common.googleMapsUrlForDelivery')
                  : t('common.googleMapsUrlForMain')
              }
              placeholder={t('common.googleMapsUrlPlaceholder')}
              error={form.errors.googleMapsUrl}
              disabled={isLoading}
              {...form.getInputProps('googleMapsUrl')}
            />
            {!noTaxCode && (
              <TextInput
                label={t('customer.taxCode')}
                placeholder={t('customer.taxCodePlaceholder')}
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
            <Group justify="space-between" mt="md">
              <Group>
                {mode === 'edit' && customer && (
                  <>
                    {!customer.isActive ? (
                      <Button
                        color="var(--app-active-color)"
                        leftSection={<IconCheck size={16} />}
                        onClick={onActivate}
                        disabled={isLoading || !canEdit}
                      >
                        {t('common.activate')}
                      </Button>
                    ) : (
                      <Button
                        color="var(--app-inactive-color)"
                        leftSection={<IconTrash size={16} />}
                        onClick={onDeactivate}
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
