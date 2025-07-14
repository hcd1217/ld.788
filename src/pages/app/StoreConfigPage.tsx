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
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {
  IconAlertCircle,
  IconBuildingStore,
  IconCheck,
} from '@tabler/icons-react';
import {useIsDarkMode} from '@/hooks/useIsDarkMode';
import {useTranslation} from '@/hooks/useTranslation';
import {
  useStoreActions,
  useCurrentStore,
  useStoreLoading,
  useStoreError,
} from '@/stores/useStoreConfigStore';
import {GoBack} from '@/components/common/GoBack';
import {FormContainer} from '@/components/form/FormContainer';
import {StoreConfigForm} from '@/components/store/StoreConfigForm';
import type {CreateStoreRequest} from '@/services/store';

type StoreConfigFormValues = {
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
};

const defaultOperatingHours = {
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
          return 'Store name must be at least 2 characters long';
        }

        return undefined;
      },
      address(value) {
        if (!value || value.trim().length < 5) {
          return 'Store address must be at least 5 characters long';
        }

        return undefined;
      },
      location(value) {
        if (!value?.lat || !value.lng) {
          return 'Store location is required';
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
        title: 'Store Created',
        message: `Store "${newStore.name}" has been created successfully`,
        color: isDarkMode ? 'green.7' : 'green.9',
        icon: <IconCheck size={16} />,
      });

      // Reset form for creating another store
      form.reset();

      // Navigate to store list or dashboard
      navigate('/stores');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create store';

      setShowAlert(true);

      notifications.show({
        title: 'Store Creation Failed',
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
    <Container size="md" mt="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <GoBack />

          {currentStore ? (
            <Button
              variant="light"
              size="sm"
              onClick={() => navigate('/stores')}
            >
              View All Stores
            </Button>
          ) : null}
        </Group>

        <Title order={1} ta="center">
          Create New Store
        </Title>

        <Transition
          mounted
          transition="slide-up"
          duration={400}
          timingFunction="ease"
        >
          {() => (
            <Card shadow="sm" padding="xl" radius="md">
              <FormContainer>
                <LoadingOverlay
                  visible={isLoading}
                  overlayProps={{blur: 2}}
                  transitionProps={{duration: 300}}
                />

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
                          onClose={() => {
                            setShowAlert(false);
                            clearError();
                          }}
                        >
                          {error || 'Please check the form for errors'}
                        </Alert>
                      )}
                    </Transition>

                    <Group justify="flex-end" mt="xl">
                      <Button
                        variant="light"
                        disabled={isLoading}
                        onClick={() => {
                          form.reset();
                          navigate('/home');
                        }}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        leftSection={<IconBuildingStore size={16} />}
                        disabled={isLoading}
                      >
                        Create Store
                      </Button>
                    </Group>
                  </Stack>
                </form>
              </FormContainer>
            </Card>
          )}
        </Transition>
      </Stack>
    </Container>
  );
}
