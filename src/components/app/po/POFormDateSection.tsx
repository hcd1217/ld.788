import { Card, Group, SimpleGrid, Stack, Switch, Text, TextInput } from '@mantine/core';

import { DateInput } from '@/components/common';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';

import type { UseFormReturnType } from '@mantine/form';

type POFormDateSectionProps = {
  readonly form: UseFormReturnType<any>;
  readonly isLoading: boolean;
};

export function POFormDateSection({ form, isLoading }: POFormDateSectionProps) {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();

  return (
    <Card withBorder radius="md" p="xl">
      <Stack gap="md">
        <Text fw={500} size="lg">
          {t('po.orderDates')}
        </Text>
        <SimpleGrid cols={isMobile ? 1 : 2}>
          <DateInput
            label={t('po.orderDate')}
            placeholder={t('po.selectOrderDate')}
            clearable
            required
            disabled={isLoading}
            value={form.values.orderDate}
            onChange={(date) => form.setFieldValue('orderDate', date ? new Date(date) : undefined)}
            maxDate={form.values.deliveryDate || undefined}
          />
          <DateInput
            label={t('po.deliveryDate')}
            placeholder={t('po.selectDeliveryDate')}
            clearable
            disabled={isLoading}
            value={form.values.deliveryDate}
            onChange={(date) =>
              form.setFieldValue('deliveryDate', date ? new Date(date) : undefined)
            }
            minDate={form.values.orderDate || undefined}
          />
        </SimpleGrid>
        <Group gap="xs">
          <Switch
            label={t('po.isInternalDelivery')}
            size="md"
            {...form.getInputProps('isInternalDelivery', { type: 'checkbox' })}
          />
          <Switch
            label={t('po.isUrgentPO')}
            size="md"
            color="red"
            {...form.getInputProps('isUrgentPO', { type: 'checkbox' })}
          />
        </Group>
        <TextInput
          label={t('po.customerPONumber')}
          placeholder={t('po.enterCustomerPONumber')}
          value={form.values.customerPONumber}
          onChange={(e) => form.setFieldValue('customerPONumber', e.target.value)}
        />
      </Stack>
    </Card>
  );
}
