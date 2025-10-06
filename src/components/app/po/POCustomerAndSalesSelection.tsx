import { Card, Select, Stack, Switch, Text, TextInput } from '@mantine/core';

import { useTranslation } from '@/hooks/useTranslation';
import type { CustomerOverview as Customer } from '@/services/client/overview';
import { useCustomerOptions } from '@/stores/useAppStore';
import { usePurchaseOrderAssigneeOptions } from '@/stores/usePOStore';

import type { UseFormReturnType } from '@mantine/form';

type POCustomerAndSalesSelectionProps = {
  readonly form: UseFormReturnType<any>;
  readonly selectedCustomer: Customer | undefined;
  readonly isEditMode?: boolean;
};

export function POCustomerAndSalesSelection({
  form,
  isEditMode = false,
}: POCustomerAndSalesSelectionProps) {
  const { t } = useTranslation();
  const salesOptions = usePurchaseOrderAssigneeOptions();
  const customerOptions = useCustomerOptions();

  return (
    <Card withBorder radius="md" p="xl">
      <Stack gap="md">
        <Text fw={500} size="lg">
          {t('po.customerInformation')}
        </Text>

        <Select
          searchable
          required={!form.values.isPersonalCustomer}
          label={t('common.customer')}
          placeholder={t('po.selectCustomer')}
          data={customerOptions}
          disabled={isEditMode || form.values.isPersonalCustomer}
          {...form.getInputProps('customerId')}
        />

        <TextInput
          disabled={!form.values.isPersonalCustomer}
          label={t('po.personalCustomerName')}
          placeholder={t('po.personalCustomerName')}
          value={form.values.personalCustomerName || ''}
          onChange={(e) => form.setFieldValue('personalCustomerName', e.target.value)}
        />

        <Switch
          disabled={isEditMode}
          label={t('po.isPersonalCustomer')}
          size="md"
          {...form.getInputProps('isPersonalCustomer', { type: 'checkbox' })}
        />

        <Select
          searchable
          clearable
          label={t('po.salesPerson')}
          placeholder={t('po.selectSalesPerson')}
          data={salesOptions}
          {...form.getInputProps('salesId')}
        />
      </Stack>
    </Card>
  );
}
