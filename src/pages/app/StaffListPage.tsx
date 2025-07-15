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
        title: 'Staff Deleted',
        message: `${staffToDelete.fullName} has been deleted successfully`,
        color: isDarkMode ? 'green.7' : 'green.9',
        icon: <IconCheck size={16} />,
      });

      closeDeleteModal();
      setStaffToDelete(undefined);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete staff member';

      notifications.show({
        title: 'Delete Failed',
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
          title: 'Staff Deactivated',
          message: `${staffMember.fullName} has been deactivated`,
          color: 'orange',
          icon: <IconUserMinus size={16} />,
        });
      } else {
        await activateStaff(staffMember.id);
        notifications.show({
          title: 'Staff Activated',
          message: `${staffMember.fullName} has been activated`,
          color: isDarkMode ? 'green.7' : 'green.9',
          icon: <IconUserCheck size={16} />,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update staff status';

      notifications.show({
        title: 'Update Failed',
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
        title: 'No Store Selected',
        message: 'Please select a store before adding staff members',
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
            Staff Management
          </Title>

          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="orange"
            variant="light"
          >
            <Stack gap="md">
              <Text>Please select a store to manage staff members.</Text>
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
            Staff Management
          </Title>

          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="orange"
            variant="light"
          >
            No stores found. Please create a store first to manage staff
            members.
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
                Add Staff
              </Button>
            </Group>
          </Group>

          <Title order={1} ta="center">
            Staff Management - {currentStore.name}
          </Title>

          {/* Search and Filters */}
          <Group gap="md" align="flex-end">
            <TextInput
              placeholder="Search by name, email, or phone..."
              value={searchValue}
              leftSection={<IconSearch size={16} />}
              style={{flex: 1}}
              onChange={(event) => {
                setSearchValue(event.currentTarget.value);
              }}
            />

            <Select
              label="Status"
              value={filters.status}
              data={[
                {value: 'all', label: 'All Status'},
                {value: 'active', label: 'Active'},
                {value: 'inactive', label: 'Inactive'},
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
              label="Role"
              value={filters.role}
              data={[
                {value: 'all', label: 'All Roles'},
                {value: 'admin', label: 'Admin'},
                {value: 'manager', label: 'Manager'},
                {value: 'member', label: 'Member'},
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
              label="Sort By"
              value={filters.sortBy}
              data={[
                {value: 'name', label: 'Name'},
                {value: 'email', label: 'Email'},
                {value: 'role', label: 'Role'},
                {value: 'createdAt', label: 'Created'},
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
              title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              onClick={() => {
                handleFiltersChange({
                  sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
                });
              }}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </ActionIcon>

            <Button variant="light" onClick={resetFilters}>
              Reset
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
              Showing {staff.length} of {pagination.total} staff members
            </Text>
          </Group>
        </Stack>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal
        centered
        opened={deleteModalOpened}
        title="Delete Staff Member"
        onClose={closeDeleteModal}
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete {staffToDelete?.fullName}? This
            action cannot be undone.
          </Text>

          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="red"
            variant="light"
          >
            Warning: This will permanently remove all staff data and clock-in
            history.
          </Alert>

          <Flex gap="sm" justify="flex-end">
            <Button variant="light" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDeleteStaff}>
              Delete Staff
            </Button>
          </Flex>
        </Stack>
      </Modal>
    </>
  );
}
