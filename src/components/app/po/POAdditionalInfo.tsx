import { Select, Stack, Text, Card, Textarea } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import type { UseFormReturnType } from '@mantine/form';

const paymentTermsOptions = [
  { value: 'NET30', label: 'Net 30' },
  { value: 'NET60', label: 'Net 60' },
  { value: 'DUE_ON_RECEIPT', label: 'Due on Receipt' },
  { value: 'COD', label: 'Cash on Delivery' },
  { value: '2_10_NET30', label: '2/10 Net 30' },
];

type POAdditionalInfoProps = {
  readonly form: UseFormReturnType<any>;
};

export function POAdditionalInfo({ form }: POAdditionalInfoProps) {
  const { t } = useTranslation();

  const translatedPaymentTermsOptions = paymentTermsOptions.map((option) => {
    const key = option.value.toLowerCase().replace(/_/g, '');
    return {
      value: option.value,
      label: t(`po.${key}` as any),
    };
  });

  return (
    <Card withBorder radius="md" p="xl">
      <Stack gap="md">
        <Text fw={500} size="lg">
          {t('po.additionalInformation')}
        </Text>

        <Select
          label={t('po.paymentTerms')}
          placeholder={t('po.selectPaymentTerms')}
          data={translatedPaymentTermsOptions}
          {...form.getInputProps('paymentTerms')}
        />

        <Textarea
          label={t('po.notes')}
          placeholder={t('po.notesPlaceholder')}
          rows={4}
          {...form.getInputProps('notes')}
        />
      </Stack>
    </Card>
  );
}
