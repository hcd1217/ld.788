import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router';
import {
  Container,
  Title,
  Stack,
  Card,
  Group,
  Button,
  LoadingOverlay,
  Alert,
  Transition,
  Box,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {IconAlertCircle, IconCheck} from '@tabler/icons-react';
import {useIsDarkMode} from '@/hooks/useIsDarkMode';
import {useTranslation} from '@/hooks/useTranslation';
import {
  useStoreActions,
  useCurrentStore,
  useStoreLoading,
  useStoreError,
} from '@/stores/useStoreConfigStore';
import {GoBack} from '@/components/common/GoBack';
import {StoreConfigForm} from '@/components/store/StoreConfigForm';
import type {DaySchedule} from '@/components/store/OperatingHoursInput';
import type {CreateStoreRequest} from '@/services/store';

type StoreConfigFormValues = {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  operatingHours: Record<string, DaySchedule>;
};

const defaultOperatingHours: StoreConfigFormValues['operatingHours'] = {
  monday: {open: '09:00', close: '17:00'},
  tuesday: {open: '09:00', close: '17:00'},
  wednesday: {open: '09:00', close: '17:00'},
  thursday: {open: '09:00', close: '17:00'},
  friday: {open: '09:00', close: '17:00'},
  saturday: {open: '10:00', close: '16:00'},
  sunday: {closed: true},
};

export function StoreConfigPage() {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const {t} = useTranslation();
  const isDarkMode = useIsDarkMode();

  const currentStore = useCurrentStore();
  const isLoading = useStoreLoading();
  const error = useStoreError();
  const {createStore, clearError} = useStoreActions();

  const form = useForm<StoreConfigFormValues>({
    initialValues: {
      name: '',
      address: '',
      location: {
        lat: 37.7749, // Default to San Francisco
        lng: -122.4194,
      },
      operatingHours: defaultOperatingHours,
    },
    validate: {
      name(value) {
        if (!value || value.trim().length < 2) {
          return t('validation.storeNameRequired');
        }

        return undefined;
      },
      address(value) {
        if (!value || value.trim().length < 5) {
          return t('validation.storeAddressRequired');
        }

        return undefined;
      },
      location(value) {
        if (!value?.lat || !value.lng) {
          return t('validation.storeLocationRequired');
        }

        return undefined;
      },
    },
  });

  useEffect(() => {
    if (error) {
      setShowAlert(true);
    }
  }, [error]);

  const handleSubmit = async (values: StoreConfigFormValues) => {
    try {
      clearError();

      const storeData: CreateStoreRequest = {
        name: values.name.trim(),
        address: values.address.trim(),
        location: values.location,
        operatingHours: values.operatingHours,
      };

      const newStore = await createStore(storeData);

      notifications.show({
        title: t('store.storeCreated'),
        message: t('store.storeCreatedMessage', {name: newStore.name}),
        color: isDarkMode ? 'green.7' : 'green.9',
        icon: <IconCheck size={16} />,
      });

      // Reset form for creating another store
      form.reset();

      // Navigate to store list or dashboard
      navigate('/stores');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('errors.failedToCreateStore');

      setShowAlert(true);

      notifications.show({
        title: t('store.storeCreationFailed'),
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    }
  };

  const handleLocationChange = (
    location: {lat: number; lng: number},
    address: string,
  ) => {
    form.setFieldValue('location', location);
    if (address && address !== form.values.address) {
      form.setFieldValue('address', address);
    }
  };

  const handleAddressChange = (address: string) => {
    form.setFieldValue('address', address);
  };

  const handleOperatingHoursChange = (
    operatingHours: StoreConfigFormValues['operatingHours'],
  ) => {
    form.setFieldValue('operatingHours', operatingHours);
  };

  return (
    <Container fluid mt="xl">
      <Stack gap="xs">
        <Container fluid w="100%" px="md">
          <Group justify="space-between">
            {currentStore ? (
              <Button
                variant="light"
                size="sm"
                onClick={() => navigate('/stores')}
              >
                {t('store.viewAllStores')}
              </Button>
            ) : (
              <GoBack />
            )}
          </Group>
        </Container>

        <Title order={1} ta="center">
          {t('store.createNewStore')}
        </Title>

        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Box style={{width: '100%'}}>
            <Transition
              mounted
              transition="slide-up"
              duration={400}
              timingFunction="ease"
            >
              {() => (
                <Card shadow="sm" padding="xl" radius="md">
                  <LoadingOverlay
                    visible={isLoading}
                    overlayProps={{blur: 2}}
                    transitionProps={{duration: 300}}
                  />
                  <Transition
                    mounted={Boolean(
                      showAlert &&
                        (error || Object.keys(form.errors).length > 0),
                    )}
                    transition="fade"
                    duration={300}
                    timingFunction="ease"
                  >
                    {(styles) => (
                      <Alert
                        withCloseButton
                        style={styles}
                        icon={<IconAlertCircle size={16} />}
                        color="red"
                        variant="light"
                        my="md"
                        onClose={() => {
                          setShowAlert(false);
                          clearError();
                        }}
                      >
                        {error || t('common.checkFormErrors')}
                      </Alert>
                    )}
                  </Transition>

                  <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="lg">
                      <StoreConfigForm
                        form={form}
                        isLoading={isLoading}
                        onLocationChange={handleLocationChange}
                        onAddressChange={handleAddressChange}
                        onOperatingHoursChange={handleOperatingHoursChange}
                        onFocus={() => {
                          setShowAlert(false);
                        }}
                      />
                    </Stack>
                  </form>
                </Card>
              )}
            </Transition>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
