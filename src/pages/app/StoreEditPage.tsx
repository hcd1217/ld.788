import {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router';
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
import {IconAlertCircle, IconCheck, IconEdit} from '@tabler/icons-react';
import useIsDarkMode from '@/hooks/useIsDarkMode';
import useTranslation from '@/hooks/useTranslation';
import {
  useStoreActions,
  useStores,
  useStoreLoading,
  useStoreError,
} from '@/stores/useStoreConfigStore';
import {GoBack} from '@/components/common';
import {StoreConfigForm} from '@/components/store/StoreConfigForm';
import type {DaySchedule} from '@/components/store/OperatingHoursInput';
import type {
  Store,
  UpdateStoreRequest,
  UpdateStoreOperatingHoursRequest,
} from '@/lib/api/schemas/store.schemas';
import {ROUTERS} from '@/config/routeConfig';

type StoreEditFormValues = {
  // Required fields
  name: string;
  code: string;
  address: string;
  city: string;
  country: string;

  // Optional fields
  state?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;

  // Location (maps to latitude/longitude)
  location: {
    lat: number;
    lng: number;
  };

  // Operating hours (handled separately)
  operatingHours: Record<string, DaySchedule>;
};

const defaultOperatingHours: StoreEditFormValues['operatingHours'] = {
  monday: {open: '09:00', close: '17:00'},
  tuesday: {open: '09:00', close: '17:00'},
  wednesday: {open: '09:00', close: '17:00'},
  thursday: {open: '09:00', close: '17:00'},
  friday: {open: '09:00', close: '17:00'},
  saturday: {open: '10:00', close: '16:00'},
  sunday: {closed: true},
};

export function StoreEditPage() {
  const navigate = useNavigate();
  const {storeId} = useParams<{storeId: string}>();
  const [showAlert, setShowAlert] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | undefined>(
    undefined,
  );
  const [isPageLoading, setIsPageLoading] = useState(true);
  const {t} = useTranslation();
  const isDarkMode = useIsDarkMode();

  const stores = useStores();
  const isLoading = useStoreLoading();
  const error = useStoreError();
  const {
    loadStores,
    clearError,
    updateStore,
    updateOperatingHours,
    loadOperatingHours,
  } = useStoreActions();

  const form = useForm<StoreEditFormValues>({
    initialValues: {
      name: '',
      code: '',
      address: '',
      city: '',
      country: '',
      state: '',
      postalCode: '',
      phoneNumber: '',
      email: '',
      location: {
        lat: 0,
        lng: 0,
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
      code(value) {
        if (!value || value.trim().length === 0) {
          return t('store.codeRequired');
        }

        return undefined;
      },
      address(value) {
        if (!value || value.trim().length < 5) {
          return t('validation.storeAddressRequired');
        }

        return undefined;
      },
      city(value) {
        if (!value || value.trim().length === 0) {
          return t('store.cityRequired');
        }

        return undefined;
      },
      country(value) {
        if (!value || value.trim().length === 0) {
          return t('store.countryRequired');
        }

        return undefined;
      },
      email(value) {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return t('validation.invalidEmail');
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

  // Load store data
  useEffect(() => {
    const loadStoreData = async () => {
      if (!storeId) {
        navigate(ROUTERS.STORES);
        return;
      }

      try {
        setIsPageLoading(true);

        // Load stores if not already loaded
        if (stores.length === 0) {
          await loadStores();
        }

        const store = stores.find((s) => s.id === storeId);

        if (!store) {
          notifications.show({
            title: t('store.storeNotFound'),
            message: t('store.storeNotFoundMessage'),
            color: 'red',
            icon: <IconAlertCircle size={16} />,
          });
          navigate(ROUTERS.STORES);
          return;
        }

        setCurrentStore(store);

        // Load operating hours
        try {
          const hours = await loadOperatingHours(storeId);
          const formattedHours = convertOperatingHoursToFormFormat(hours);

          // Populate form with store data
          form.setValues({
            name: store.name,
            code: store.code,
            address: store.address,
            city: store.city,
            country: store.country,
            state: store.state || '',
            postalCode: store.postalCode || '',
            phoneNumber: store.phoneNumber || '',
            email: store.email || '',
            location: {
              lat: store.latitude || 0,
              lng: store.longitude || 0,
            },
            operatingHours: formattedHours,
          });
        } catch {
          // If operating hours fail to load, just use defaults
          form.setFieldValue('operatingHours', defaultOperatingHours);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t('errors.failedToLoadStore');

        notifications.show({
          title: t('store.loadFailed'),
          message: errorMessage,
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });

        navigate(ROUTERS.STORES);
      } finally {
        setIsPageLoading(false);
      }
    };

    loadStoreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, navigate]);

  useEffect(() => {
    if (error) {
      setShowAlert(true);
    }
  }, [error]);

  const handleSubmit = async (values: StoreEditFormValues) => {
    try {
      clearError();

      if (!currentStore) return;

      // Prepare update data
      const updateData: UpdateStoreRequest = {
        name: values.name.trim(),
        code: values.code.trim(),
        address: values.address.trim(),
        city: values.city.trim(),
        country: values.country.trim(),
        state: values.state?.trim() || undefined,
        postalCode: values.postalCode?.trim() || undefined,
        phoneNumber: values.phoneNumber?.trim() || undefined,
        email: values.email?.trim() || undefined,
        latitude: values.location.lat,
        longitude: values.location.lng,
      };

      // Update store information
      await updateStore(currentStore.id, updateData);

      // Update operating hours separately
      const operatingHours = convertToApiFormat(values.operatingHours);
      await updateOperatingHours(currentStore.id, operatingHours);

      notifications.show({
        title: t('store.storeUpdated'),
        message: t('store.storeUpdatedMessage', {name: values.name}),
        color: isDarkMode ? 'green.7' : 'green.9',
        icon: <IconCheck size={16} />,
      });

      // Navigate back to store list
      navigate(ROUTERS.STORES);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('errors.failedToUpdateStore');

      setShowAlert(true);

      notifications.show({
        title: t('store.storeUpdateFailed'),
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    }
  };

  // Helper to convert UI format to API format
  const convertToApiFormat = (
    hours: Record<string, DaySchedule>,
  ): UpdateStoreOperatingHoursRequest => {
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    return Object.entries(hours).map(([day, schedule]) => ({
      dayOfWeek: dayMap[day],
      openTime: 'closed' in schedule ? '00:00' : schedule.open,
      closeTime: 'closed' in schedule ? '00:00' : schedule.close,
      isClosed: 'closed' in schedule,
    }));
  };

  // Helper to convert API format to UI format
  const convertOperatingHoursToFormFormat = (
    hours: Array<{
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }>,
  ): Record<string, DaySchedule> => {
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const result: Record<string, DaySchedule> = {};

    for (const hour of hours) {
      const dayName = dayNames[hour.dayOfWeek];
      result[dayName] = hour.isClosed
        ? {closed: true}
        : {open: hour.openTime, close: hour.closeTime};
    }

    // Fill in any missing days with defaults
    for (const day of dayNames) {
      result[day] ||= defaultOperatingHours[day];
    }

    return result;
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
    operatingHours: StoreEditFormValues['operatingHours'],
  ) => {
    form.setFieldValue('operatingHours', operatingHours);
  };

  if (isPageLoading) {
    return (
      <Container size="md" mt="xl">
        <LoadingOverlay
          visible
          overlayProps={{blur: 2}}
          transitionProps={{duration: 300}}
        />
      </Container>
    );
  }

  return (
    <Container size="md" mt="xl">
      <Stack gap="xl">
        <GoBack />

        <Title order={1} ta="center">
          <Group gap="xs" justify="center">
            <IconEdit size={32} />
            {t('store.editStore')}
          </Group>
        </Title>

        <Card shadow="sm" padding="xl" radius="md">
          <LoadingOverlay
            visible={isLoading}
            overlayProps={{blur: 2}}
            transitionProps={{duration: 300}}
          />
          <Transition
            mounted={Boolean(
              showAlert && (error || Object.keys(form.errors).length > 0),
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

              <Group justify="flex-end" mt="xl">
                {currentStore ? (
                  <Button
                    variant="light"
                    onClick={() => navigate(ROUTERS.STORES)}
                  >
                    {t('common.cancel')}
                  </Button>
                ) : null}
                <Button type="submit" loading={isLoading}>
                  {t('common.save')}
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Container>
  );
}
