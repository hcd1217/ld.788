import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import {
  Container,
  Title,
  Stack,
  Card,
  Group,
  Button,
  Text,
  SimpleGrid,
  LoadingOverlay,
  Alert,
  ActionIcon,
  Modal,
  Flex,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {notifications} from '@mantine/notifications';
import {
  IconPlus,
  IconBuildingStore,
  IconMapPin,
  IconClock,
  IconTrash,
  IconAlertTriangle,
  IconCheck,
} from '@tabler/icons-react';
import classes from './StoreListPage.module.css';
import {useIsDarkMode} from '@/hooks/useIsDarkMode';
import {useTranslation} from '@/hooks/useTranslation';
import {
  useStores,
  useStoreLoading,
  useStoreError,
  useStoreActions,
  useCurrentStore,
} from '@/stores/useStoreConfigStore';
import type {Store} from '@/services/store';

export function StoreListPage() {
  const navigate = useNavigate();
  const [deleteModalOpened, {open: openDeleteModal, close: closeDeleteModal}] =
    useDisclosure(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | undefined>(
    undefined,
  );
  const {t} = useTranslation();
  const isDarkMode = useIsDarkMode();

  const stores = useStores();
  const currentStore = useCurrentStore();
  const isLoading = useStoreLoading();
  const error = useStoreError();
  const {loadStores, deleteStore, setCurrentStore, clearError} =
    useStoreActions();

  useEffect(() => {
    const load = async () => {
      try {
        await loadStores();
      } catch (error) {
        console.error(error);
      }
    };

    void load();
  }, [loadStores]);

  const handleDeleteStore = (store: Store) => {
    setStoreToDelete(store);
    openDeleteModal();
  };

  const confirmDeleteStore = async () => {
    if (!storeToDelete) return;

    try {
      await deleteStore(storeToDelete.id);

      notifications.show({
        title: t('store.storeDeleted'),
        message: t('store.storeDeletedMessage', {name: storeToDelete.name}),
        color: isDarkMode ? 'green.7' : 'green.9',
        icon: <IconCheck size={16} />,
      });

      closeDeleteModal();
      setStoreToDelete(undefined);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('errors.failedToDeleteStore');

      notifications.show({
        title: t('store.storeDeleteFailed'),
        message: errorMessage,
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
      });
    }
  };

  const handleSelectStore = (store: Store) => {
    if (currentStore?.id === store.id) {
      return;
    }

    setCurrentStore(store);
    notifications.show({
      title: t('store.storeSelected'),
      message: t('store.storeSelectedMessage', {name: store.name}),
      color: isDarkMode ? 'blue.7' : 'blue.9',
      icon: <IconBuildingStore size={16} />,
    });
  };

  const formatOperatingHours = (operatingHours: Store['operatingHours']) => {
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    const openDays = days.filter((day) => {
      if ('closed' in operatingHours[day]) {
        return false;
      }

      return true;
    });

    if (openDays.length === 0) return t('store.closedAllWeek');
    if (openDays.length === 7) return t('store.open7Days');

    return t('store.openDaysPerWeek', {count: openDays.length});
  };

  const renderStoreCard = (store: Store) => {
    const isSelected = currentStore?.id === store.id;

    return (
      <Card
        key={store.id}
        withBorder
        shadow={isSelected ? 'xl' : 'sm'}
        padding="lg"
        radius="md"
        className={`${classes.storeCard} ${isSelected ? classes.selected : ''}`}
        onClick={() => {
          handleSelectStore(store);
        }}
      >
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4} style={{flex: 1}}>
              <Group gap="xs">
                <Text fw={700} size="lg">
                  {store.name}
                </Text>
              </Group>

              <Group gap="xs" c="dimmed">
                <IconMapPin size={14} />
                <Text
                  size="sm"
                  maw={250}
                  lineClamp={2}
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {store.address}
                </Text>
              </Group>

              <Group gap="xs" c="dimmed">
                <IconClock size={14} />
                <Text size="sm">
                  {formatOperatingHours(store.operatingHours)}
                </Text>
              </Group>
            </Stack>

            <ActionIcon
              color="red"
              variant="light"
              size="sm"
              title={t('store.deleteStoreTooltip')}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteStore(store);
              }}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>

          <Group
            justify="space-between"
            pt="md"
            style={{borderTop: '1px solid var(--mantine-color-gray-3)'}}
          >
            <Text size="xs" c="dimmed">
              {t('common.created')}{' '}
              {new Date(store.createdAt).toLocaleDateString()}
            </Text>

            {!isSelected && (
              <Button
                opacity={0}
                size="xs"
                variant="light"
                onClick={() => {
                  handleSelectStore(store);
                }}
              >
                {t('store.selectStore')}
              </Button>
            )}
          </Group>
        </Stack>
      </Card>
    );
  };

  return (
    <>
      <Container fluid px="xl" mt="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <Title order={1} ta="center">
              {t('store.title')}
            </Title>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate('/store-config')}
            >
              {t('store.createNewStore')}
            </Button>
          </Group>

          {error ? (
            <Alert
              withCloseButton
              icon={<IconAlertTriangle size={16} />}
              color="red"
              variant="light"
              onClose={clearError}
            >
              {error}
            </Alert>
          ) : null}

          <div style={{position: 'relative'}}>
            <LoadingOverlay
              visible={isLoading}
              overlayProps={{blur: 2}}
              transitionProps={{duration: 300}}
            />

            {stores.length === 0 && !isLoading ? (
              <Card shadow="sm" padding="xl" radius="md" ta="center">
                <Stack gap="md">
                  <IconBuildingStore
                    size={48}
                    color="var(--mantine-color-gray-5)"
                  />
                  <div>
                    <Title order={3} c="dimmed">
                      {t('store.noStoresFound')}
                    </Title>
                    <Text c="dimmed" mt="xs">
                      {t('store.createFirstStoreDescription')}
                    </Text>
                  </div>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    mt="md"
                    onClick={() => navigate('/store-config')}
                  >
                    {t('store.createFirstStore')}
                  </Button>
                </Stack>
              </Card>
            ) : (
              <SimpleGrid cols={{base: 1, sm: 2, lg: 3}} spacing="lg">
                {stores.map((store) => renderStoreCard(store))}
              </SimpleGrid>
            )}
          </div>
        </Stack>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal
        centered
        opened={deleteModalOpened}
        title={<Title order={3}>{t('store.confirmDeleteTitle')}</Title>}
        onClose={closeDeleteModal}
      >
        <Stack gap="md">
          <Text>
            {t('store.confirmDeleteMessage', {name: storeToDelete?.name || ''})}
          </Text>

          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="red"
            variant="light"
          >
            {t('store.deleteWarning')}
          </Alert>

          <Flex gap="sm" justify="flex-end">
            <Button variant="light" onClick={closeDeleteModal}>
              {t('common.cancel')}
            </Button>
            <Button color="red" onClick={confirmDeleteStore}>
              {t('store.deleteStore')}
            </Button>
          </Flex>
        </Stack>
      </Modal>
    </>
  );
}
