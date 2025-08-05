import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router';
import {
  Button,
  Paper,
  Group,
  Center,
  Box,
  Stack,
  Container,
  Title,
  Table,
  ActionIcon,
  Text,
  Badge,
  Menu,
  Modal,
  TextInput,
  NumberInput,
  Textarea,
  LoadingOverlay,
  Pagination,
  Tooltip,
  Alert,
  Transition,
  Card,
  ScrollArea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconDots,
  IconSearch,
  IconRefresh,
  IconAlertCircle,
  IconShield,
  IconTag,
  IconUsers,
} from '@tabler/icons-react';
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/stores/useAppStore';
import { clientService } from '@/services/client';
import { GoBack } from '@/components/common';

type Role = {
  id: string;
  name: string;
  displayName: string;
  description: string;
  level: number;
  isSystem: boolean;
};

type RoleFormValues = {
  name: string;
  displayName: string;
  description: string;
  level: number;
};

const ROLES_PER_PAGE = 10;

export function RoleManagementPage() {
  const { t } = useTranslation();
  const { user } = useAppStore();

  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
  const [showAlert, setShowAlert] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);

  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);

  const form = useForm<RoleFormValues>({
    initialValues: {
      name: '',
      displayName: '',
      description: '',
      level: 1,
    },
    validate: {
      name(value: string) {
        if (!value || value.trim().length < 2) {
          return t('validation.fieldRequired');
        }

        return undefined;
      },
      displayName(value: string) {
        if (!value || value.trim().length < 2) {
          return t('validation.fieldRequired');
        }

        return undefined;
      },
      description(value: string) {
        if (!value || value.trim().length < 2) {
          return t('validation.fieldRequired');
        }

        return undefined;
      },
      level(value: number) {
        if (value < 1 || value > 100) {
          return t('validation.invalidLevel');
        }

        return undefined;
      },
    },
  });

  const loadRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const rolesData = await clientService.getAllRoles();
      setRoles(rolesData);
    } catch {
      showErrorNotification(t('common.error'), t('common.loadingFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleAddRole = () => {
    setIsAddMode(true);
    setSelectedRole(undefined);
    form.reset();
    openForm();
  };

  const handleEditRole = (role: Role) => {
    setIsAddMode(false);
    setSelectedRole(role);
    form.setValues({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      level: role.level,
    });
    openForm();
  };

  const handleDeleteRole = (role: Role) => {
    if (role.isSystem) {
      showErrorNotification(t('common.error'), t('common.cannotDeleteSystemRole'));
      return;
    }

    modals.openConfirmModal({
      title: t('common.confirmDelete'),
      children: (
        <Text size="sm">
          {t('common.confirmDeleteMessage', {
            name: role.displayName,
          })}
        </Text>
      ),
      labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
      confirmProps: { color: 'red' },
      async onConfirm() {
        try {
          setIsLoading(true);
          await clientService.deleteRole(role.id);
          setRoles((prev) => prev.filter((r) => r.id !== role.id));
          showSuccessNotification(t('common.success'), t('common.roleDeleted'));
        } catch {
          showErrorNotification(t('common.error'), t('common.deleteFailed'));
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleSaveRole = async (values: RoleFormValues) => {
    try {
      setIsLoading(true);

      if (isAddMode) {
        const response = await clientService.addRole(values);
        const newRole: Role = {
          id: response.id,
          name: values.name,
          displayName: values.displayName,
          description: values.description,
          level: values.level,
          isSystem: false,
        };
        setRoles((prev) => [...prev, newRole]);
        showSuccessNotification(t('common.success'), t('common.roleAdded'));
      } else if (selectedRole) {
        await clientService.updateRole(selectedRole.id, values);
        setRoles((prev) =>
          prev.map((r) =>
            r.id === selectedRole.id
              ? {
                  ...r,
                  name: values.name,
                  displayName: values.displayName,
                  description: values.description,
                  level: values.level,
                }
              : r,
          ),
        );
        showSuccessNotification(t('common.success'), t('common.roleUpdated'));
      }

      closeForm();
      form.reset();
    } catch {
      setShowAlert(true);
      showErrorNotification(
        t('common.error'),
        isAddMode ? t('common.addFailed') : t('common.updateFailed'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = roles.filter(
        (role) =>
          role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          role.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          role.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles(roles);
    }
  }, [roles, searchQuery]);

  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * ROLES_PER_PAGE,
    currentPage * ROLES_PER_PAGE,
  );

  const totalPages = Math.ceil(filteredRoles.length / ROLES_PER_PAGE);

  if (!user?.isRoot) {
    return <Navigate to="/home" />;
  }

  return (
    <Container fluid px="xl" mt="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <GoBack />

          <Button leftSection={<IconPlus size={16} />} onClick={handleAddRole}>
            {t('common.addRole')}
          </Button>
        </Group>

        <Title order={1} ta="center">
          {t('common.pages.roleManagement')}
        </Title>

        <Paper withBorder shadow="md" p="md" radius="md">
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <Stack gap="md" style={{ flex: 1 }}>
                <Box hiddenFrom="sm">
                  <TextInput
                    placeholder={t('common.searchRoles')}
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(event) => {
                      handleSearch(event.currentTarget.value);
                    }}
                  />
                </Box>

                <Box visibleFrom="sm">
                  <TextInput
                    placeholder={t('common.searchRoles')}
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    style={{ minWidth: 250 }}
                    onChange={(event) => {
                      handleSearch(event.currentTarget.value);
                    }}
                  />
                </Box>
              </Stack>

              <Tooltip label={t('common.refresh')}>
                <ActionIcon variant="light" size="lg" loading={isLoading} onClick={loadRoles}>
                  <IconRefresh size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>

            <Box style={{ position: 'relative' }}>
              <LoadingOverlay
                visible={isLoading}
                overlayProps={{ blur: 2 }}
                transitionProps={{ duration: 300 }}
              />

              <Box hiddenFrom="md">
                <Stack gap="sm">
                  {paginatedRoles.map((role) => (
                    <Card key={role.id} withBorder padding="md" radius="md">
                      <Stack gap="xs">
                        <Group justify="space-between" align="flex-start">
                          <Box>
                            <Text fw={500} size="sm">
                              {role.displayName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {role.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {role.description}
                            </Text>
                          </Box>
                          <Menu shadow="md" width={200}>
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray">
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                disabled={role.isSystem}
                                onClick={() => {
                                  handleEditRole(role);
                                }}
                              >
                                {t('common.edit')}
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                disabled={role.isSystem}
                                onClick={() => {
                                  handleDeleteRole(role);
                                }}
                              >
                                {t('common.delete')}
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>

                        <Group gap="xs">
                          <Badge
                            color="blue"
                            variant="light"
                            size="sm"
                            leftSection={<IconTag size={12} />}
                          >
                            Level {role.level}
                          </Badge>
                          {role.isSystem ? (
                            <Badge
                              color="orange"
                              variant="light"
                              size="sm"
                              leftSection={<IconShield size={12} />}
                            >
                              System
                            </Badge>
                          ) : null}
                        </Group>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Box>

              <Box visibleFrom="md">
                <ScrollArea>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('common.displayName')}</Table.Th>
                        <Table.Th>{t('common.name')}</Table.Th>
                        <Table.Th>{t('common.description')}</Table.Th>
                        <Table.Th>{t('common.level')}</Table.Th>
                        <Table.Th>{t('common.type')}</Table.Th>
                        <Table.Th>{t('common.actions')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {paginatedRoles.map((role) => (
                        <Table.Tr key={role.id}>
                          <Table.Td>
                            <Text fw={500}>{role.displayName}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{role.name}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{role.description}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge color="blue" variant="light" size="sm">
                              {role.level}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            {role.isSystem ? (
                              <Badge
                                color="orange"
                                variant="light"
                                size="sm"
                                leftSection={<IconShield size={12} />}
                              >
                                System
                              </Badge>
                            ) : (
                              <Badge
                                color="green"
                                variant="light"
                                size="sm"
                                leftSection={<IconUsers size={12} />}
                              >
                                Custom
                              </Badge>
                            )}
                          </Table.Td>
                          <Table.Td>
                            <Group gap={0} justify="flex-end">
                              <Menu shadow="md" width={200}>
                                <Menu.Target>
                                  <ActionIcon variant="subtle" color="gray">
                                    <IconDots size={16} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item
                                    leftSection={<IconEdit size={14} />}
                                    disabled={role.isSystem}
                                    onClick={() => {
                                      handleEditRole(role);
                                    }}
                                  >
                                    {t('common.edit')}
                                  </Menu.Item>
                                  <Menu.Divider />
                                  <Menu.Item
                                    leftSection={<IconTrash size={14} />}
                                    color="red"
                                    disabled={role.isSystem}
                                    onClick={() => {
                                      handleDeleteRole(role);
                                    }}
                                  >
                                    {t('common.delete')}
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Box>

              {filteredRoles.length === 0 && !isLoading && (
                <Center py="xl">
                  <Text c="dimmed">{t('common.noRolesFound')}</Text>
                </Center>
              )}
            </Box>

            {totalPages > 1 && (
              <Center>
                <Pagination
                  value={currentPage}
                  total={totalPages}
                  size="sm"
                  onChange={setCurrentPage}
                />
              </Center>
            )}
          </Stack>
        </Paper>
      </Stack>

      <Modal
        opened={formOpened}
        title={isAddMode ? t('common.addRole') : t('common.editRole')}
        size="md"
        onClose={closeForm}
      >
        <Box style={{ position: 'relative' }}>
          <LoadingOverlay
            visible={isLoading}
            overlayProps={{ blur: 2 }}
            transitionProps={{ duration: 300 }}
          />

          <form onSubmit={form.onSubmit(handleSaveRole)}>
            <Stack gap="md">
              <TextInput
                required
                label={t('common.name')}
                placeholder="role_name"
                error={form.errors.name}
                disabled={isLoading}
                leftSection={<IconTag size={16} />}
                {...form.getInputProps('name')}
                onFocus={() => {
                  setShowAlert(false);
                }}
              />

              <TextInput
                required
                label={t('common.displayName')}
                placeholder="Role Display Name"
                error={form.errors.displayName}
                disabled={isLoading}
                leftSection={<IconUsers size={16} />}
                {...form.getInputProps('displayName')}
                onFocus={() => {
                  setShowAlert(false);
                }}
              />

              <Textarea
                required
                label={t('common.description')}
                placeholder="Role description"
                error={form.errors.description}
                disabled={isLoading}
                minRows={3}
                {...form.getInputProps('description')}
                onFocus={() => {
                  setShowAlert(false);
                }}
              />

              <NumberInput
                required
                label={t('common.level')}
                placeholder="1"
                error={form.errors.level}
                disabled={isLoading}
                min={1}
                max={100}
                leftSection={<IconShield size={16} />}
                {...form.getInputProps('level')}
                onFocus={() => {
                  setShowAlert(false);
                }}
              />

              <Transition
                mounted={Boolean(showAlert && Object.keys(form.errors).length > 0)}
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
                    }}
                  >
                    {t('common.checkFormErrors')}
                  </Alert>
                )}
              </Transition>

              <Group justify="flex-end" mt="md">
                <Button variant="outline" disabled={isLoading} onClick={closeForm}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" loading={isLoading}>
                  {isAddMode ? t('common.add') : t('common.save')}
                </Button>
              </Group>
            </Stack>
          </form>
        </Box>
      </Modal>
    </Container>
  );
}
