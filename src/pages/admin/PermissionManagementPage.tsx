import {useEffect, useState, useMemo} from 'react';
import {
  Container,
  Title,
  Stack,
  Card,
  Group,
  Button,
  Text,
  TextInput,
  Pagination,
  Center,
  Paper,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {notifications} from '@mantine/notifications';
import {
  IconPlus,
  IconCheck,
  IconTrash,
  IconSearch,
  IconShieldCheck,
} from '@tabler/icons-react';
import {useIsDarkMode} from '@/hooks/useIsDarkMode';
import {useTranslation} from '@/hooks/useTranslation';
import {
  usePermissions,
  usePermissionError,
  usePermissionActions,
} from '@/stores/usePermissionStore';
import {ErrorAlert, GoBack} from '@/components/common';
import {
  PermissionTable,
  CreatePermissionModal,
  EditPermissionModal,
  DeletePermissionModal,
} from '@/components/admin/PermissionManagementComponents';
import type {AdminPermission} from '@/lib/api';

export function PermissionManagementPage() {
  const [createModalOpened, {open: openCreateModal, close: closeCreateModal}] =
    useDisclosure(false);
  const [editModalOpened, {open: openEditModal, close: closeEditModal}] =
    useDisclosure(false);
  const [deleteModalOpened, {open: openDeleteModal, close: closeDeleteModal}] =
    useDisclosure(false);
  const [selectedPermission, setSelectedPermission] = useState<
    AdminPermission | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const {t} = useTranslation();
  const isDarkMode = useIsDarkMode();

  const allPermissions = usePermissions();
  const error = usePermissionError();
  const {
    loadPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    clearError,
  } = usePermissionActions();

  const pageSize = 20;

  // Load all permissions once with large limit
  useEffect(() => {
    const load = async () => {
      await loadPermissions({
        search: '', // No server-side search
        offset: 0,
        limit: 1000, // Get all permissions
      });
    };

    void load();
  }, [loadPermissions]);

  // Client-side filtering
  const filteredPermissions = useMemo(() => {
    if (!searchQuery.trim()) {
      return allPermissions;
    }

    const query = searchQuery.toLowerCase();
    return allPermissions.filter((permission) => {
      return (
        permission.resource.toLowerCase().includes(query) ||
        permission.action.toLowerCase().includes(query) ||
        permission.scope.toLowerCase().includes(query) ||
        permission.description.toLowerCase().includes(query)
      );
    });
  }, [allPermissions, searchQuery]);

  // Client-side pagination
  const paginatedPermissions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredPermissions.slice(startIndex, endIndex);
  }, [filteredPermissions, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPermissions.length / pageSize);

  const handleCreatePermission = async (data: {
    resource: string;
    action: string;
    scope: string;
    description: string;
  }) => {
    await createPermission(data);
    notifications.show({
      title: t('admin.permissions.permissionCreated'),
      message: t('admin.permissions.permissionCreatedMessage'),
      color: isDarkMode ? 'green.7' : 'green.9',
      icon: <IconCheck size={16} />,
    });
  };

  const handleEditPermission = (permission: AdminPermission) => {
    setSelectedPermission(permission);
    openEditModal();
  };

  const handleUpdatePermission = async (id: string, description: string) => {
    await updatePermission(id, {description});
    notifications.show({
      title: t('admin.permissions.permissionUpdated'),
      message: t('admin.permissions.permissionUpdatedMessage'),
      color: isDarkMode ? 'blue.7' : 'blue.9',
      icon: <IconCheck size={16} />,
    });
  };

  const handleDeletePermission = (permission: AdminPermission) => {
    setSelectedPermission(permission);
    openDeleteModal();
  };

  const handleConfirmDelete = async (id: string) => {
    await deletePermission(id);
    notifications.show({
      title: t('admin.permissions.permissionDeleted'),
      message: t('admin.permissions.permissionDeletedMessage'),
      color: 'red',
      icon: <IconTrash size={16} />,
    });
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <>
      <Container fluid px="xl" mt="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <GoBack />
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={openCreateModal}
            >
              {t('admin.permissions.createNewPermission')}
            </Button>
          </Group>

          <Title order={1} ta="center">
            {t('admin.permissions.title')}
          </Title>

          <ErrorAlert error={error} clearError={clearError} />

          <Card shadow="sm" padding="md" radius="md">
            <Stack gap="md">
              {/* Search Bar */}
              <TextInput
                placeholder={t('admin.permissions.searchPlaceholder')}
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => {
                  handleSearch(e.target.value);
                }}
              />

              {/* Permissions Table */}
              {allPermissions.length === 0 ? (
                <Paper p="xl" ta="center">
                  <Stack gap="md">
                    <IconShieldCheck
                      size={48}
                      color="var(--mantine-color-gray-5)"
                    />
                    <div>
                      <Title order={3} c="dimmed">
                        {searchQuery
                          ? t('admin.permissions.noPermissionsFoundSearch')
                          : t('admin.permissions.noPermissionsFound')}
                      </Title>
                      <Text c="dimmed" mt="xs">
                        {searchQuery
                          ? t('admin.permissions.tryDifferentSearch')
                          : t(
                              'admin.permissions.createFirstPermissionDescription',
                            )}
                      </Text>
                    </div>
                    {searchQuery ? null : (
                      <Button
                        leftSection={<IconPlus size={16} />}
                        mt="md"
                        onClick={openCreateModal}
                      >
                        {t('admin.permissions.createFirstPermission')}
                      </Button>
                    )}
                  </Stack>
                </Paper>
              ) : (
                <PermissionTable
                  permissions={paginatedPermissions}
                  onEdit={handleEditPermission}
                  onDelete={handleDeletePermission}
                />
              )}

              {/* Pagination */}
              {totalPages > 1 ? (
                <Center mt="md">
                  <Pagination
                    total={totalPages}
                    value={currentPage}
                    size="sm"
                    onChange={setCurrentPage}
                  />
                </Center>
              ) : null}
            </Stack>
          </Card>
        </Stack>
      </Container>

      {/* Create Permission Modal */}
      <CreatePermissionModal
        opened={createModalOpened}
        onClose={closeCreateModal}
        onConfirm={handleCreatePermission}
      />

      {/* Edit Permission Modal */}
      <EditPermissionModal
        opened={editModalOpened}
        permission={selectedPermission}
        onClose={closeEditModal}
        onConfirm={handleUpdatePermission}
      />

      {/* Delete Permission Modal */}
      <DeletePermissionModal
        opened={deleteModalOpened}
        permission={selectedPermission}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
