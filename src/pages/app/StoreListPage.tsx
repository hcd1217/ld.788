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
  Badge,
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
import {useIsDarkMode} from '@/hooks/useIsDarkMode';
// Import {useTranslation} from '@/hooks/useTranslation';
import {
  useStores,
  useStoreLoading,
  useStoreError,
  useStoreActions,
  useCurrentStore,
} from '@/stores/useStoreConfigStore';
import {GoBack} from '@/components/common/GoBack';
import type {Store} from '@/services/store';

export function StoreListPage() {
  const navigate = useNavigate();
  const [deleteModalOpened, {open: openDeleteModal, close: closeDeleteModal}] =
    useDisclosure(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | undefined>(
    undefined,
  );
  // Const {t} = useTranslation();
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
        title: 'Store Deleted',
        message: `Store "${storeToDelete.name}" has been deleted successfully`,
        color: isDarkMode ? 'green.7' : 'green.9',
        icon: <IconCheck size={16} />,
      });

      closeDeleteModal();
      setStoreToDelete(undefined);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete store';

      notifications.show({
        title: 'Delete Failed',
        message: errorMessage,
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
      });
    }
  };

  const handleSelectStore = (store: Store) => {
    setCurrentStore(store);
    notifications.show({
      title: 'Store Selected',
      message: `"${store.name}" is now your current store`,
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

    if (openDays.length === 0) return 'Closed all week';
    if (openDays.length === 7) return 'Open 7 days a week';

    return `Open ${openDays.length} days a week`;
  };

  const renderStoreCard = (store: Store) => {
    const isSelected = currentStore?.id === store.id;

    return (
      <Card
        key={store.id}
        withBorder
        shadow="sm"
        padding="lg"
        radius="md"
        style={
          isSelected ? {borderColor: 'var(--mantine-color-blue-6)'} : undefined
        }
      >
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4} style={{flex: 1}}>
              <Group gap="xs">
                <Text fw={700} size="lg">
                  {store.name}
                </Text>
                {isSelected ? (
                  <Badge size="sm" color="blue" variant="filled">
                    Current
                  </Badge>
                ) : null}
              </Group>

              <Group gap="xs" c="dimmed">
                <IconMapPin size={14} />
                <Text size="sm" lineClamp={2}>
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
              title="Delete store"
              onClick={() => {
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
              Created {new Date(store.createdAt).toLocaleDateString()}
            </Text>

            {!isSelected && (
              <Button
                size="xs"
                variant="light"
                onClick={() => {
                  handleSelectStore(store);
                }}
              >
                Select Store
              </Button>
            )}
          </Group>
        </Stack>
      </Card>
    );
  };

  return (
    <>
      <Container size="lg" mt="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <GoBack />
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate('/store-config')}
            >
              Create New Store
            </Button>
          </Group>

          <Title order={1} ta="center">
            Store Management
          </Title>

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
                      No stores found
                    </Title>
                    <Text c="dimmed" mt="xs">
                      Create your first store to get started
                    </Text>
                  </div>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    mt="md"
                    onClick={() => navigate('/store-config')}
                  >
                    Create Your First Store
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
        title="Delete Store"
        onClose={closeDeleteModal}
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete &quot;{storeToDelete?.name}&quot;?
            This action cannot be undone.
          </Text>

          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="red"
            variant="light"
          >
            Warning: All staff members associated with this store will also be
            affected.
          </Alert>

          <Flex gap="sm" justify="flex-end">
            <Button variant="light" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDeleteStore}>
              Delete Store
            </Button>
          </Flex>
        </Stack>
      </Modal>
    </>
  );
}
