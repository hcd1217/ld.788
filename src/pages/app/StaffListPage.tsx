import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import {
  Container,
  Title,
  Stack,
  Group,
  Button,
  TextInput,
  Select,
  LoadingOverlay,
  Alert,
  Modal,
  Text,
  Flex,
  Pagination,
  ActionIcon,
} from '@mantine/core';
import {useDisclosure, useDebouncedValue} from '@mantine/hooks';
import {notifications} from '@mantine/notifications';
import {
  IconPlus,
  IconSearch,
  IconAlertTriangle,
  IconCheck,
  IconUserMinus,
  IconUserCheck,
} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {useIsDarkMode} from '@/hooks/useIsDarkMode';
import {
  useStaffList,
  useStaffLoading,
  useStaffError,
  useStaffPagination,
  useStaffFilters,
  useStaffActions,
} from '@/stores/useStaffStore';
import {useCurrentStore, useStores} from '@/stores/useStoreConfigStore';
import {GoBack} from '@/components/common/GoBack';
import {StoreSelector} from '@/components/store';
import {StaffList} from '@/components/staff';
import type {Staff} from '@/services/staff';

export function StaffListPage() {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const [deleteModalOpened, {open: openDeleteModal, close: closeDeleteModal}] =
    useDisclosure(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | undefined>(
    undefined,
  );
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const isDarkMode = useIsDarkMode();

  const staff = useStaffList();
  const isLoading = useStaffLoading();
  const error = useStaffError();
  const pagination = useStaffPagination();
  const filters = useStaffFilters();
  const currentStore = useCurrentStore();
  const stores = useStores();

  const {
    loadStaff,
    deleteStaff,
    deactivateStaff,
    activateStaff,
    setFilters,
    setPagination,
    resetFilters,
    clearError,
  } = useStaffActions();

  // Load staff when component mounts or filters change
  useEffect(() => {
    const load = async () => {
      if (currentStore) {
        try {
          await loadStaff({storeId: currentStore.id});
        } catch (error) {
          console.error(error);
        }
      }
    };

    void load();
  }, [loadStaff, currentStore]);

  // Update search filter when debounced value changes
  useEffect(() => {
    setFilters({search: debouncedSearch});
  }, [debouncedSearch, setFilters]);

  const handleDeleteStaff = (staffMember: Staff) => {
    setStaffToDelete(staffMember);
    openDeleteModal();
  };

  const confirmDeleteStaff = async () => {
    if (!staffToDelete) return;

    try {
      await deleteStaff(staffToDelete.id);

      notifications.show({
        title: t('staff.deleteSuccess'),
        message: t('staff.deleteSuccessMessage', {
          name: staffToDelete.fullName,
        }),
        color: isDarkMode ? 'green.7' : 'green.9',
        icon: <IconCheck size={16} />,
      });

      closeDeleteModal();
      setStaffToDelete(undefined);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('staff.deleteFailedDefault');

      notifications.show({
        title: t('staff.deleteFailed'),
        message: errorMessage,
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
      });
    }
  };

  const handleToggleStaffStatus = async (staffMember: Staff) => {
    try {
      if (staffMember.status === 'active') {
        await deactivateStaff(staffMember.id);
        notifications.show({
          title: t('staff.deactivateSuccess'),
          message: t('staff.deactivateSuccessMessage', {
            name: staffMember.fullName,
          }),
          color: 'orange',
          icon: <IconUserMinus size={16} />,
        });
      } else {
        await activateStaff(staffMember.id);
        notifications.show({
          title: t('staff.activateSuccess'),
          message: t('staff.activateSuccessMessage', {
            name: staffMember.fullName,
          }),
          color: isDarkMode ? 'green.7' : 'green.9',
          icon: <IconUserCheck size={16} />,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('staff.updateStatusFailedDefault');

      notifications.show({
        title: t('staff.updateFailed'),
        message: errorMessage,
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
      });
    }
  };

  const handlePageChange = (page: number) => {
    setPagination({page});
  };

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);
  };

  const handleAddStaff = () => {
    if (!currentStore) {
      notifications.show({
        title: t('staff.noStoreSelected'),
        message: t('staff.selectStoreBeforeAdding'),
        color: 'orange',
        icon: <IconAlertTriangle size={16} />,
      });
      return;
    }

    navigate('/staff/add');
  };

  if (!currentStore && stores.length > 0) {
    return (
      <Container size="lg" mt="xl">
        <Stack gap="xl">
          <GoBack />
          <Title order={1} ta="center">
            {t('staff.title')}
          </Title>

          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="orange"
            variant="light"
          >
            <Stack gap="md">
              <Text>{t('staff.selectStoreToManage')}</Text>
              <StoreSelector />
            </Stack>
          </Alert>
        </Stack>
      </Container>
    );
  }

  if (!currentStore) {
    return (
      <Container size="lg" mt="xl">
        <Stack gap="xl">
          <GoBack />
          <Title order={1} ta="center">
            {t('staff.title')}
          </Title>

          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="orange"
            variant="light"
          >
            {t('staff.noStoresFound')}
          </Alert>
        </Stack>
      </Container>
    );
  }

  return (
    <>
      <Container size="xl" mt="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <GoBack />
            <Group gap="md">
              <StoreSelector />
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={handleAddStaff}
              >
                {t('staff.addStaff')}
              </Button>
            </Group>
          </Group>

          <Title order={1} ta="center">
            {t('staff.titleWithStore', {storeName: currentStore.name})}
          </Title>

          {/* Search and Filters */}
          <Group gap="md" align="flex-end">
            <TextInput
              placeholder={t('staff.searchPlaceholder')}
              value={searchValue}
              leftSection={<IconSearch size={16} />}
              style={{flex: 1}}
              onChange={(event) => {
                setSearchValue(event.currentTarget.value);
              }}
            />

            <Select
              label={t('common.status')}
              value={filters.status}
              data={[
                {value: 'all', label: t('staff.allStatus')},
                {value: 'active', label: t('common.active')},
                {value: 'inactive', label: t('common.inactive')},
              ]}
              w={120}
              onChange={(value) => {
                if (value) {
                  handleFiltersChange({
                    status: value as 'active' | 'inactive' | 'all',
                  });
                } else {
                  handleFiltersChange({status: 'all'});
                }
              }}
            />

            <Select
              label={t('common.role')}
              value={filters.role}
              data={[
                {value: 'all', label: t('staff.allRoles')},
                {value: 'admin', label: t('staff.admin')},
                {value: 'manager', label: t('staff.manager')},
                {value: 'member', label: t('staff.member')},
              ]}
              w={120}
              onChange={(value) => {
                if (value) {
                  handleFiltersChange({
                    role: value as 'admin' | 'manager' | 'member' | 'all',
                  });
                } else {
                  handleFiltersChange({role: 'all'});
                }
              }}
            />

            <Select
              label={t('staff.sortBy')}
              value={filters.sortBy}
              data={[
                {value: 'name', label: t('common.name')},
                {value: 'email', label: t('auth.email')},
                {value: 'role', label: t('common.role')},
                {value: 'createdAt', label: t('common.created')},
              ]}
              w={120}
              onChange={(value) => {
                if (value) {
                  handleFiltersChange({
                    sortBy: value as 'name' | 'email' | 'role' | 'createdAt',
                  });
                } else {
                  handleFiltersChange({sortBy: 'createdAt'});
                }
              }}
            />

            <ActionIcon
              variant="light"
              size="lg"
              title={t('staff.sortTooltip', {
                order:
                  filters.sortOrder === 'asc'
                    ? t('staff.descending')
                    : t('staff.ascending'),
              })}
              onClick={() => {
                handleFiltersChange({
                  sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
                });
              }}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </ActionIcon>

            <Button variant="light" onClick={resetFilters}>
              {t('staff.reset')}
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

            <StaffList
              staff={staff}
              onEdit={(staffMember) =>
                navigate(`/staff/edit/${staffMember.id}`)
              }
              onDelete={handleDeleteStaff}
              onToggleStatus={handleToggleStaffStatus}
            />
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Group justify="center">
              <Pagination
                total={pagination.totalPages}
                value={pagination.page}
                size="sm"
                onChange={handlePageChange}
              />
            </Group>
          )}

          {/* Summary */}
          <Group justify="center">
            <Text size="sm" c="dimmed">
              {t('staff.showingCount', {
                current: staff.length,
                total: pagination.total,
              })}
            </Text>
          </Group>
        </Stack>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal
        centered
        opened={deleteModalOpened}
        title={t('staff.deleteModalTitle')}
        onClose={closeDeleteModal}
      >
        <Stack gap="md">
          <Text>
            {t('staff.deleteConfirmation', {name: staffToDelete?.fullName})}{' '}
            {t('common.cannotBeUndone')}
          </Text>

          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="red"
            variant="light"
          >
            {t('staff.deleteWarning')}
          </Alert>

          <Flex gap="sm" justify="flex-end">
            <Button variant="light" onClick={closeDeleteModal}>
              {t('common.cancel')}
            </Button>
            <Button color="red" onClick={confirmDeleteStaff}>
              {t('staff.deleteStaff')}
            </Button>
          </Flex>
        </Stack>
      </Modal>
    </>
  );
}
