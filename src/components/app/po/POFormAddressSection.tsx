import { Card, Stack, Text, Textarea, TextInput, Group } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useTranslation } from '@/hooks/useTranslation';
import type { CustomerOverview as Customer } from '@/services/client/overview';
import { ViewOnMap } from '@/components/common';

type POFormAddressSectionProps = {
  readonly form: UseFormReturnType<any>;
  readonly selectedCustomer?: Customer;
};

export function POFormAddressSection({ form, selectedCustomer }: POFormAddressSectionProps) {
  const { t } = useTranslation();

  const customerGoogleMapsUrl = selectedCustomer?.googleMapsUrl;
  const formGoogleMapsUrl = form.values.shippingAddress?.googleMapsUrl;
  const displayGoogleMapsUrl = formGoogleMapsUrl || customerGoogleMapsUrl;

  return (
    <Card withBorder radius="md" p="xl">
      <Stack gap="md">
        <Text fw={500} size="lg">
          {t('po.shippingAddress')}
          <ViewOnMap googleMapsUrl={displayGoogleMapsUrl} />
        </Text>
        <POAddressFields form={form} fieldPrefix="shippingAddress" />
        {selectedCustomer?.address && (
          <Text size="sm" c="dimmed" fs="italic">
            {t('po.autoFilledFromCustomerAddress')}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

function POAddressFields({
  form,
  noDetail = true,
  fieldPrefix,
}: {
  readonly form: UseFormReturnType<any>;
  readonly fieldPrefix: string;
  readonly noDetail?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      <Textarea
        label={t('po.address')}
        placeholder={t('po.addressPlaceholder')}
        minRows={4}
        autosize
        maxRows={4}
        {...form.getInputProps(`${fieldPrefix}.oneLineAddress`)}
      />

      <TextInput
        label={t('common.googleMapsUrl')}
        placeholder={t('common.googleMapsUrlPlaceholder')}
        {...form.getInputProps(`${fieldPrefix}.googleMapsUrl`)}
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
