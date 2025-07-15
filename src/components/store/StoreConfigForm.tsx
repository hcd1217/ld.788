import {Stack, TextInput, Fieldset} from '@mantine/core';
import {type UseFormReturnType} from '@mantine/form';
import {LocationInput} from './LocationInput';
import {OperatingHoursInput, type DaySchedule} from './OperatingHoursInput';
import {GoogleMapDisplay} from './GoogleMapDisplay';
import {useTranslation} from '@/hooks/useTranslation';

type StoreConfigFormProps = {
  readonly form: UseFormReturnType<{
    name: string;
    address: string;
    location: {
      lat: number;
      lng: number;
    };
    operatingHours: Record<string, DaySchedule>;
  }>;
  readonly isLoading: boolean;
  readonly onLocationChange: (
    location: {lat: number; lng: number},
    address: string,
  ) => void;
  readonly onAddressChange: (address: string) => void;
  readonly onOperatingHoursChange: (
    operatingHours: Record<string, DaySchedule>,
  ) => void;
  readonly onFocus?: () => void;
};

export function StoreConfigForm({
  form,
  isLoading,
  onLocationChange,
  onAddressChange,
  onOperatingHoursChange,
  onFocus,
}: StoreConfigFormProps) {
  const {t} = useTranslation();

  return (
    <Stack gap="lg">
      {/* Basic Store Information */}
      <Fieldset legend={t('store.storeInformation')}>
        <Stack gap="md">
          <TextInput
            required
            label={t('store.storeName')}
            placeholder={t('store.enterStoreName')}
            error={form.errors.name}
            disabled={isLoading}
            {...form.getInputProps('name')}
            onFocus={onFocus}
          />

          <LocationInput
            label={t('store.storeAddress')}
            placeholder={t('store.searchForStoreAddress')}
            value={form.values.address}
            error={form.errors.address ?? undefined}
            disabled={isLoading}
            onLocationSelect={onLocationChange}
            onAddressChange={onAddressChange}
            onFocus={onFocus}
          />

          {/* Map Display */}
          {form.values.location.lat && form.values.location.lng ? (
            <GoogleMapDisplay
              location={form.values.location}
              address={form.values.address}
            />
          ) : null}
        </Stack>
      </Fieldset>

      {/* Operating Hours */}
      <Fieldset legend={t('store.operatingHours')}>
        <OperatingHoursInput
          value={form.values.operatingHours}
          disabled={isLoading}
          onChange={onOperatingHoursChange}
        />
      </Fieldset>
    </Stack>
  );
}
