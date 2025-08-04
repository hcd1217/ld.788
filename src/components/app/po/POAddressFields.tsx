import { TextInput, Group, Stack } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { UseFormReturnType } from '@mantine/form';

type POAddressFieldsProps = {
  readonly form: UseFormReturnType<any>;
  readonly fieldPrefix: string;
  readonly required?: boolean;
};

export function POAddressFields({ form, fieldPrefix, required = false }: POAddressFieldsProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      <TextInput
        required={required}
        label={t('po.street')}
        placeholder={t('po.streetPlaceholder')}
        leftSection={<IconMapPin size={16} />}
        {...form.getInputProps(`${fieldPrefix}.street`)}
      />

      <Group grow>
        <TextInput
          required={required}
          label={t('po.city')}
          placeholder={t('po.cityPlaceholder')}
          {...form.getInputProps(`${fieldPrefix}.city`)}
        />
        <TextInput
          label={t('po.state')}
          placeholder={t('po.statePlaceholder')}
          {...form.getInputProps(`${fieldPrefix}.state`)}
        />
      </Group>

      <Group grow>
        <TextInput
          label={t('po.postalCode')}
          placeholder={t('po.postalCodePlaceholder')}
          {...form.getInputProps(`${fieldPrefix}.postalCode`)}
        />
        <TextInput
          required={required}
          label={t('po.country')}
          placeholder={t('po.countryPlaceholder')}
          {...form.getInputProps(`${fieldPrefix}.country`)}
        />
      </Group>
    </Stack>
  );
}
