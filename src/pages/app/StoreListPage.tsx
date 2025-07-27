import {useEffect, useState, useMemo} from 'react';
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
  Modal,
  Flex,
  TextInput,
  Pagination,
  Center,
  Select,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {notifications} from '@mantine/notifications';
import {
  IconPlus,
  IconBuildingStore,
  IconAlertTriangle,
  IconCheck,
  IconSearch,
} from '@tabler/icons-react';
import useIsDarkMode from '@/hooks/useIsDarkMode';
import useTranslation from '@/hooks/useTranslation';
import {
  useStores,
  useStoreLoading,
  useStoreError,
  useStoreActions,
  useCurrentStore,
} from '@/stores/useStoreConfigStore';
import {StoreCard} from '@/components/store/StoreCard';
import type {Store} from '@/lib/api/schemas/store.schemas';
import {ErrorAlert} from '@/components/common';

export function StoreListPage() {
  const navigate = useNavigate();
  const [deleteModalOpened, {open: openDeleteModal, close: closeDeleteModal}] =
    useDisclosure(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | undefined>(
    undefined,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('12');
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
      await loadStores();
    };

    void load();
  }, [loadStores]);

  // Client-side filtering
  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) {
      return stores;
    }

    const query = searchQuery.toLowerCase();
    return stores.filter((store) => {
      return (
        store.name.toLowerCase().includes(query) ||
        store.code.toLowerCase().includes(query) ||
        store.address.toLowerCase().includes(query) ||
        store.city.toLowerCase().includes(query) ||
        (store.state?.toLowerCase().includes(query) ?? false) ||
        store.country.toLowerCase().includes(query) ||
        (store.phoneNumber?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [stores, searchQuery]);

  // Client-side pagination
  const paginatedStores = useMemo(() => {
    const size = Number.parseInt(pageSize, 10);
    const startIndex = (currentPage - 1) * size;
    const endIndex = startIndex + size;
    return filteredStores.slice(startIndex, endIndex);
  }, [filteredStores, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    const size = Number.parseInt(pageSize, 10);
    return Math.ceil(filteredStores.length / size);
  }, [filteredStores, pageSize]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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

  const handleEditStore = (store: Store) => {
    navigate(`/stores/edit/${store.id}`);
  };

  const handlePageSizeChange = (value: string | undefined) => {
    if (value) {
      setPageSize(value);
      setCurrentPage(1); // Reset to first page when page size changes
    }
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

          {/* Search Bar - only show when stores > 10 */}
          {stores.length > 10 && (
            <TextInput
              placeholder={t('store.searchPlaceholder')}
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
          )}

          <ErrorAlert error={error} clearError={clearError} />

          <div style={{position: 'relative'}}>
            <LoadingOverlay
              visible={isLoading}
              overlayProps={{blur: 2}}
              transitionProps={{duration: 300}}
            />

            {filteredStores.length === 0 && !isLoading ? (
              <Card shadow="sm" padding="xl" radius="md" ta="center">
                <Stack gap="md">
                  <IconBuildingStore
                    size={48}
                    color="var(--mantine-color-gray-5)"
                  />
                  <div>
                    <Title order={3} c="dimmed">
                      {searchQuery
                        ? t('store.noStoresFoundSearch')
                        : t('store.noStoresFound')}
                    </Title>
                    <Text c="dimmed" mt="xs">
                      {searchQuery
                        ? t('store.tryDifferentSearch')
                        : t('store.createFirstStoreDescription')}
                    </Text>
                  </div>
                  {!searchQuery && (
                    <Button
                      leftSection={<IconPlus size={16} />}
                      mt="md"
                      onClick={() => navigate('/store-config')}
                    >
                      {t('store.createFirstStore')}
                    </Button>
                  )}
                </Stack>
              </Card>
            ) : (
              <SimpleGrid cols={{base: 1, sm: 2, lg: 3}} spacing="lg">
                {paginatedStores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    isSelected={currentStore?.id === store.id}
                    onSelect={handleSelectStore}
                    onEdit={handleEditStore}
                    onDelete={handleDeleteStore}
                  />
                ))}
              </SimpleGrid>
            )}
          </div>

          {/* Pagination */}
          {filteredStores.length > 0 && (
            <Stack gap="md">
              {totalPages > 1 && (
                <Group justify="space-between">
                  <Select
                    value={pageSize}
                    data={[
                      {value: '6', label: '6'},
                      {value: '12', label: '12'},
                      {value: '24', label: '24'},
                      {value: '48', label: '48'},
                    ]}
                    style={{width: 100}}
                    onChange={(value) => {
                      handlePageSizeChange(value ?? undefined);
                    }}
                  />
                  <Center>
                    <Pagination
                      total={totalPages}
                      value={currentPage}
                      size="sm"
                      onChange={setCurrentPage}
                    />
                  </Center>
                  <div style={{width: 100}} /> {/* Spacer for balance */}
                </Group>
              )}
            </Stack>
          )}
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
