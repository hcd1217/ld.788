import { Button, Stack, Alert, Transition, Group, Card, Text, Switch } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { POItemsEditor } from './POItemsEditor';
import { POCustomerSelection } from './POCustomerSelection';
import { POAddressFields } from './POAddressFields';
import { POAdditionalInfo } from './POAdditionalInfo';
import type { Customer } from '@/services/sales/customer';
import type { POItem } from '@/services/sales/purchaseOrder';
import { formatCurrency } from '@/utils/number';
import { useMemo } from 'react';

type POFormValues = {
  customerId: string;
  items: POItem[];
  shippingAddress: {
    street: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  paymentTerms?: string;
  notes?: string;
  useSameAddress?: boolean;
};

type POFormProps = {
  readonly form: UseFormReturnType<POFormValues>;
  readonly customers: Customer[];
  readonly isLoading: boolean;
  readonly error?: string | null;
  readonly onSubmit: (values: POFormValues) => void;
  readonly onCancel: () => void;
  readonly isEditMode?: boolean;
};

export function POForm({
  form,
  customers,
  isLoading,
  error,
  onSubmit,
  onCancel,
  isEditMode = false,
}: POFormProps) {
  const { t } = useTranslation();

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === form.values.customerId),
    [customers, form.values.customerId],
  );

  const totalAmount = useMemo(
    () => form.values.items.reduce((sum, item) => sum + item.totalPrice, 0),
    [form.values.items],
  );

  const creditStatus = useMemo(() => {
    if (!selectedCustomer || !selectedCustomer.creditLimit) return undefined;

    const availableCredit = selectedCustomer.creditLimit - selectedCustomer.creditUsed;
    const afterOrderCredit = availableCredit - totalAmount;

    return {
      limit: selectedCustomer.creditLimit,
      current: selectedCustomer.creditUsed,
      available: availableCredit,
      afterOrder: afterOrderCredit,
      exceeds: afterOrderCredit < 0,
    };
  }, [selectedCustomer, totalAmount]);

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="lg">
        <Transition mounted={Boolean(error)} transition="fade">
          {(styles) => (
            <Alert
              withCloseButton
              style={styles}
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              onClose={() => {}}
            >
              {error || t('common.checkFormErrors')}
            </Alert>
          )}
        </Transition>

        {/* Customer Selection */}
        <POCustomerSelection
          form={form}
          customers={customers}
          selectedCustomer={selectedCustomer}
          creditStatus={creditStatus}
          isEditMode={isEditMode}
        />

        {/* Order Items */}
        <Card withBorder radius="md" p="xl">
          <Stack gap="md">
            <Text fw={500} size="lg">
              {t('po.orderItems')}
            </Text>
            <POItemsEditor
              items={form.values.items}
              onChange={(items) => form.setFieldValue('items', items)}
              disabled={isLoading}
            />
            <Group justify="flex-end">
              <Text size="lg" fw={600}>
                {t('po.totalAmount')}: {formatCurrency(totalAmount)}
              </Text>
            </Group>
          </Stack>
        </Card>

        {/* Shipping Address */}
        <Card withBorder radius="md" p="xl">
          <Stack gap="md">
            <Text fw={500} size="lg">
              {t('po.shippingAddress')}
            </Text>
            <POAddressFields form={form} fieldPrefix="shippingAddress" required />
          </Stack>
        </Card>

        {/* Billing Address */}
        <Card withBorder radius="md" p="xl">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500} size="lg">
                {t('po.billingAddress')}
              </Text>
              <Switch
                label={t('po.sameAsShipping')}
                {...form.getInputProps('useSameAddress', { type: 'checkbox' })}
              />
            </Group>

            {!form.values.useSameAddress && (
              <POAddressFields form={form} fieldPrefix="billingAddress" required />
            )}
          </Stack>
        </Card>

        {/* Additional Information */}
        <POAdditionalInfo form={form} />

        {/* Form Actions */}
        <Group justify="flex-end">
          <Button variant="default" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEditMode ? t('common.save') : t('po.createPO')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
