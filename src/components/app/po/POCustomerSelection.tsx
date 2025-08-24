import { Select, Stack, Text, Card } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import type { CustomerOverview as Customer } from '@/services/client/overview';
import type { UseFormReturnType } from '@mantine/form';

type POCustomerSelectionProps = {
  readonly form: UseFormReturnType<any>;
  readonly customers: Customer[];
  readonly selectedCustomer: Customer | undefined;
  readonly isEditMode?: boolean;
};

export function POCustomerSelection({
  form,
  customers,
  isEditMode = false,
}: POCustomerSelectionProps) {
  const { t } = useTranslation();

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
  }));

  return (
    <Card withBorder radius="md" p="xl">
      <Stack gap="md">
        <Text fw={500} size="lg">
          {t('po.customerInformation')}
        </Text>

        <Select
          searchable
          required
          label={t('po.customer')}
          placeholder={t('po.selectCustomer')}
          data={customerOptions}
          disabled={isEditMode}
          {...form.getInputProps('customerId')}
        />
      </Stack>
    </Card>
  );
}
