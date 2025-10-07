import { Card, MultiSelect, Stack, Text, Textarea } from '@mantine/core';

import { useTranslation } from '@/hooks/useTranslation';
import { usePOTags } from '@/stores/useAppStore';

import type { UseFormReturnType } from '@mantine/form';

type POAdditionalInfoProps = {
  readonly form: UseFormReturnType<any>;
};

export function POAdditionalInfo({ form }: POAdditionalInfoProps) {
  const { t } = useTranslation();
  const availableTags = usePOTags();

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
        <MultiSelect
          label={t('po.tags')}
          placeholder={t('po.selectTags')}
          data={availableTags.map((tag) => ({
            value: tag,
            label: t(`po.tag.${tag}` as any),
          }))}
          searchable
          clearable
          {...form.getInputProps('poTags')}
        />
      </Stack>
    </Card>
  );
}
