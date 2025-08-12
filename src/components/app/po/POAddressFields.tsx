import { TextInput, Group, Stack, Textarea } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import type { UseFormReturnType } from '@mantine/form';

type POAddressFieldsProps = {
  readonly form: UseFormReturnType<any>;
  readonly fieldPrefix: string;
  readonly noDetail?: boolean;
};

export function POAddressFields({ form, noDetail = true, fieldPrefix }: POAddressFieldsProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      <Textarea
        label={t('po.address')}
        placeholder={t('po.addressPlaceholder')}
        // leftSection={<IconMapPin size={16} />}
        minRows={1}
        autosize
        maxRows={4}
        {...form.getInputProps(`${fieldPrefix}.oneLineAddress`)}
      />

      {noDetail ? null : (
        <>
          <TextInput
            label={t('po.street')}
            placeholder={t('po.streetPlaceholder')}
            {...form.getInputProps(`${fieldPrefix}.street`)}
          />
          <Group grow>
            <TextInput
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
              label={t('po.country')}
              placeholder={t('po.countryPlaceholder')}
              {...form.getInputProps(`${fieldPrefix}.country`)}
            />
          </Group>
        </>
      )}
    </Stack>
  );
}
