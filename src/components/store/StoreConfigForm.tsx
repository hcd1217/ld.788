import {Stack, TextInput, Fieldset} from '@mantine/core';
import {type UseFormReturnType} from '@mantine/form';
import {LocationInput} from './LocationInput';
import {OperatingHoursInput} from './OperatingHoursInput';
import {GoogleMapDisplay} from './GoogleMapDisplay';

type StoreConfigFormProps = {
  readonly form: UseFormReturnType<{
    name: string;
    address: string;
    location: {
      lat: number;
      lng: number;
    };
    operatingHours: Record<
      string,
      {
        open: string;
        close: string;
        closed?: boolean;
      }
    >;
  }>;
  readonly isLoading: boolean;
  readonly onLocationChange: (
    location: {lat: number; lng: number},
    address: string,
  ) => void;
  readonly onAddressChange: (address: string) => void;
  readonly onOperatingHoursChange: (operatingHours: any) => void;
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
  return (
    <Stack gap="lg">
      {/* Basic Store Information */}
      <Fieldset legend="Store Information">
        <Stack gap="md">
          <TextInput
            required
            label="Store Name"
            placeholder="Enter store name"
            error={form.errors.name}
            disabled={isLoading}
            {...form.getInputProps('name')}
            onFocus={onFocus}
          />

          <LocationInput
            label="Store Address"
            placeholder="Search for store address"
            value={form.values.address}
            error={form.errors.address}
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
      <Fieldset legend="Operating Hours">
        <OperatingHoursInput
          value={form.values.operatingHours}
          disabled={isLoading}
          onChange={onOperatingHoursChange}
        />
      </Fieldset>
    </Stack>
  );
}
