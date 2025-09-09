import { Card, Stack, Text, SimpleGrid } from '@mantine/core';
import { DateInput } from '@/components/common';
import type { UseFormReturnType } from '@mantine/form';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';

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
      </Stack>
    </Card>
  );
}
