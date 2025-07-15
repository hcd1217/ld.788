import {
  Grid,
  Stack,
  TextInput,
  Fieldset,
  Group,
  Button,
  Box,
} from '@mantine/core';
import {type UseFormReturnType} from '@mantine/form';
import {IconBuildingStore} from '@tabler/icons-react';
import {useNavigate} from 'react-router';
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
  const navigate = useNavigate();
  const {t} = useTranslation();

  const buttonGroups = (
    <Group justify="flex-end" mt="xl">
      <Button
        variant="light"
        disabled={isLoading}
        onClick={() => {
          form.reset();
          navigate('/home');
        }}
      >
        {t('common.cancel')}
      </Button>

      <Button
        type="submit"
        leftSection={<IconBuildingStore size={16} />}
        disabled={isLoading}
      >
        {t('store.createStore')}
      </Button>
    </Group>
  );

  return (
    <Grid gutter="xl">
      {/* Basic Store Information */}
      <Grid.Col span={{base: 12, sm: 12, md: 12, lg: 6}}>
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
        <Box visibleFrom="lg" mt="xl">
          {buttonGroups}
        </Box>
      </Grid.Col>

      {/* Operating Hours */}
      <Grid.Col span={{base: 12, sm: 12, md: 12, lg: 6}}>
        <Fieldset legend={t('store.operatingHours')}>
          <OperatingHoursInput
            value={form.values.operatingHours}
            disabled={isLoading}
            onChange={onOperatingHoursChange}
          />
        </Fieldset>
      </Grid.Col>
      <Grid.Col span={12} hiddenFrom="lg">
        {buttonGroups}
      </Grid.Col>
    </Grid>
  );
}
