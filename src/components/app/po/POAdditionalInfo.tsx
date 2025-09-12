import { Card, Stack, Text, Textarea } from '@mantine/core';

import { useTranslation } from '@/hooks/useTranslation';

import type { UseFormReturnType } from '@mantine/form';

type POAdditionalInfoProps = {
  readonly form: UseFormReturnType<any>;
};

export function POAdditionalInfo({ form }: POAdditionalInfoProps) {
  const { t } = useTranslation();

  return (
    <Card withBorder radius="md" p="xl">
      <Stack gap="md">
        <Text fw={500} size="lg">
          {t('po.additionalInformation')}
        </Text>

        <Textarea
          label={t('common.notes')}
          placeholder={t('po.notesPlaceholder')}
          rows={4}
          {...form.getInputProps('notes')}
        />
      </Stack>
    </Card>
  );
}
