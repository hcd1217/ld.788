import { Select, Stack, Alert, Text, Card, Divider } from '@mantine/core';
import { IconBuilding } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatCurrency } from '@/utils/number';
import type { Customer } from '@/services/sales/customer';
import type { UseFormReturnType } from '@mantine/form';

type CreditStatus = {
  limit: number;
  current: number;
  available: number;
  afterOrder: number;
  exceeds: boolean;
};

type POCustomerSelectionProps = {
  readonly form: UseFormReturnType<any>;
  readonly customers: Customer[];
  readonly selectedCustomer: Customer | undefined;
  readonly creditStatus: CreditStatus | undefined;
  readonly isEditMode?: boolean;
};

export function POCustomerSelection({
  form,
  customers,
  selectedCustomer,
  creditStatus,
  isEditMode = false,
}: POCustomerSelectionProps) {
  const { t } = useTranslation();

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: `${customer.name}${customer.companyName ? ` - ${customer.companyName}` : ''}`,
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

        {selectedCustomer && creditStatus && (
          <Alert
            color={creditStatus.exceeds ? 'red' : 'blue'}
            variant="light"
            icon={<IconBuilding size={16} />}
          >
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                {t('po.creditStatus')}
              </Text>
              <Text size="xs">
                {t('po.creditLimit')}: {formatCurrency(creditStatus.limit)}
              </Text>
              <Text size="xs">
                {t('po.currentBalance')}: {formatCurrency(creditStatus.current)}
              </Text>
              <Text size="xs">
                {t('po.availableCredit')}: {formatCurrency(creditStatus.available)}
              </Text>
              <Divider size="xs" my={4} />
              <Text size="xs" fw={500} c={creditStatus.exceeds ? 'red' : undefined}>
                {t('po.creditAfterOrder')}: {formatCurrency(creditStatus.afterOrder)}
              </Text>
            </Stack>
          </Alert>
        )}
      </Stack>
    </Card>
  );
}
