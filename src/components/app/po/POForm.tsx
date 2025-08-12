import { Button, Stack, Alert, Transition, Group, Card, Text } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { POItemsEditor } from './POItemsEditor';
import { POCustomerSelection } from './POCustomerSelection';
import { POAddressFields } from './POAddressFields';
import { POAdditionalInfo } from './POAdditionalInfo';
import type { Customer } from '@/lib/api/schemas/sales.schemas';
import type { POItem } from '@/lib/api/schemas/sales.schemas';
import { formatCurrency } from '@/utils/number';
import { useMemo, useEffect, useCallback } from 'react';

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

// Helper function to format address into single line
function formatAddressToSingleLine(address: string | undefined): {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
} {
  if (!address) {
    return {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Vietnam',
    };
  }

  // Parse address assuming format: "Street, City, State PostalCode, Country"
  // or simpler formats like "Street, City"
  const parts = address.split(',').map((part) => part.trim());

  let street = '';
  let city = '';
  let state = '';
  let postalCode = '';
  let country = 'Vietnam';

  if (parts.length >= 2) {
    street = parts[0] || '';
    city = parts[1] || '';

    if (parts.length >= 3) {
      // Check if third part contains state and postal code
      const statePostal = parts[2];
      const postalMatch = statePostal.match(/(\d+)/);
      if (postalMatch) {
        postalCode = postalMatch[1];
        state = statePostal.replace(postalMatch[1], '').trim();
      } else {
        state = statePostal;
      }
    }

    if (parts.length >= 4) {
      country = parts[3] || 'Vietnam';
    }
  } else if (parts.length === 1) {
    // If only one part, use it as street
    street = parts[0];
  }

  return {
    street,
    city,
    state,
    postalCode,
    country,
  };
}

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

  // Auto-fill shipping address when customer is selected
  useEffect(() => {
    if (selectedCustomer?.address && !isEditMode) {
      const parsedAddress = formatAddressToSingleLine(selectedCustomer.address);
      form.setFieldValue('shippingAddress', parsedAddress);
      // Always use shipping address as billing address
      form.setFieldValue('useSameAddress', true);
      form.setFieldValue('billingAddress', parsedAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomer?.id, isEditMode]);

  // Handle form submission with address sync
  const handleSubmit = useCallback(
    (values: POFormValues) => {
      // Always ensure billing address matches shipping address
      const submissionValues = {
        ...values,
        useSameAddress: true,
        billingAddress: values.shippingAddress,
      };
      onSubmit(submissionValues);
    },
    [onSubmit],
  );

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
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
            {selectedCustomer?.address && (
              <Text size="sm" c="dimmed" fs="italic">
                Auto-filled from customer address
              </Text>
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
