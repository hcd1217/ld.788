import {useState, useEffect, useCallback} from 'react';
import {Navigate} from 'react-router';
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
  Menu,
  Modal,
  Select,
  Textarea,
  LoadingOverlay,
  Tooltip,
  Alert,
  Transition,
  ScrollArea,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {useDisclosure} from '@mantine/hooks';
import {modals} from '@mantine/modals';
import {notifications} from '@mantine/notifications';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconDots,
  IconRefresh,
  IconAlertCircle,
  IconLock,
} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {useAppStore} from '@/stores/useAppStore';
import {clientService} from '@/services/client';
import type {Permission} from '@/lib/api';
import {GoBack} from '@/components/common';

type PermissionFormValues = {
  resource: string;
  action: string;
  scope: string;
  description: string;
};

const RESOURCE_OPTIONS = [
  {value: '*', label: 'All Resources (*)'},
  {value: 'user', label: 'User'},
  {value: 'report', label: 'Report'},
  {value: 'analytics', label: 'Analytics'},
];

const ACTION_OPTIONS = [
  {value: 'read', label: 'Read'},
  {value: 'create', label: 'Create'},
  {value: 'update', label: 'Update'},
  {value: 'delete', label: 'Delete'},
  {value: '*', label: 'All Actions (*)'},
];

const SCOPE_OPTIONS = [
  {value: 'all', label: 'All'},
  {value: 'own', label: 'Own'},
  {value: 'department', label: 'Department'},
  {value: '*', label: 'All Scopes (*)'},
];

export function PermissionManagementPage() {
  const {t} = useTranslation();
  const {user} = useAppStore();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<
    Permission | undefined
  >(undefined);
  const [showAlert, setShowAlert] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);

  const [formOpened, {open: openForm, close: closeForm}] = useDisclosure(false);

  const form = useForm<PermissionFormValues>({
    initialValues: {
      resource: '',
      action: '',
      scope: '',
      description: '',
    },
    validate: {
      resource: (value) => (value ? null : t('validation.fieldRequired')),
      action: (value) => (value ? null : t('validation.fieldRequired')),
      scope: (value) => (value ? null : t('validation.fieldRequired')),
      description: (value) =>
        !value || value.length < 10
          ? t('validation.descriptionMinLength')
          : null,
    },
  });

  const loadPermissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const permissionsData = await clientService.getAllPermissions();
      setPermissions(permissionsData);
    } catch {
      notifications.show({
        title: t('common.error'),
        message: t('common.loadingFailed'),
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleAddPermission = () => {
    setIsAddMode(true);
    setSelectedPermission(undefined);
    form.reset();
    openForm();
  };

  const handleEditPermission = (permission: Permission) => {
    setIsAddMode(false);
    setSelectedPermission(permission);
    form.setValues({
      resource: permission.resource,
      action: permission.action,
      scope: permission.scope,
      description: permission.description,
    });
    openForm();
  };

  const handleRevokePermission = (permission: Permission) => {
    modals.openConfirmModal({
      title: t('permission.revoke'),
      children: (
        <Text size="sm">
          {t('common.confirmDeleteMessage', {
            name: `${permission.resource}:${permission.action}:${permission.scope}`,
          })}
        </Text>
      ),
      labels: {confirm: t('permission.revoke'), cancel: t('common.cancel')},
      confirmProps: {color: 'red'},
      async onConfirm() {
        try {
          setIsLoading(true);
          await clientService.revokePermission(permission.id);
          setPermissions((prev) => prev.filter((p) => p.id !== permission.id));
          notifications.show({
            title: t('common.success'),
            message: t('permission.revokeSuccess'),
            color: 'green',
            icon: <IconTrash size={16} />,
          });
        } catch {
          notifications.show({
            title: t('common.error'),
            message: t('permission.revokeFailed'),
            color: 'red',
            icon: <IconAlertCircle size={16} />,
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleSavePermission = async (values: PermissionFormValues) => {
    try {
      setIsLoading(true);

      if (isAddMode) {
        const response = await clientService.addPermission(values);
        const newPermission: Permission = {
          id: response.id,
          resource: values.resource,
          action: values.action,
          scope: values.scope,
          description: values.description,
        };
        setPermissions((prev) => [...prev, newPermission]);
        notifications.show({
          title: t('common.success'),
          message: t('permission.addSuccess'),
          color: 'green',
          icon: <IconPlus size={16} />,
        });
      } else if (selectedPermission) {
        await clientService.updatePermission(selectedPermission.id, values);
        setPermissions((prev) =>
          prev.map((p) =>
            p.id === selectedPermission.id
              ? {
                  ...p,
                  resource: values.resource,
                  action: values.action,
                  scope: values.scope,
                  description: values.description,
                }
              : p,
          ),
        );
        notifications.show({
          title: t('common.success'),
          message: t('permission.updateSuccess'),
          color: 'green',
          icon: <IconEdit size={16} />,
        });
      }

      closeForm();
      form.reset();
    } catch {
      setShowAlert(true);
      notifications.show({
        title: t('common.error'),
        message: isAddMode
          ? t('permission.addFailed')
          : t('permission.updateFailed'),
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  if (!user?.isRoot) {
    return <Navigate to="/home" />;
  }

  return (
    <Container fluid px="xl" mt="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <GoBack />

          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleAddPermission}
          >
            {t('permission.add')}
          </Button>
        </Group>

        <Title order={1} ta="center">
          {t('permission.management')}
        </Title>

        <Paper withBorder shadow="md" p="md" radius="md">
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <Box style={{flex: 1}} />

              <Tooltip label={t('common.refresh')}>
                <ActionIcon variant="light" size="lg" onClick={loadPermissions}>
                  <IconRefresh size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>

            <Box style={{position: 'relative'}}>
              <LoadingOverlay
                visible={isLoading}
                overlayProps={{blur: 2}}
                transitionProps={{duration: 300}}
              />

              <Box visibleFrom="md">
                <ScrollArea>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('permission.resource')}</Table.Th>
                        <Table.Th>{t('permission.action')}</Table.Th>
                        <Table.Th>{t('permission.scope')}</Table.Th>
                        <Table.Th>{t('permission.description')}</Table.Th>
                        <Table.Th>{t('common.actions')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {permissions.map((permission) => (
                        <Table.Tr key={permission.id}>
                          <Table.Td>
                            <Text fw={500}>{permission.resource}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{permission.action}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{permission.scope}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{permission.description}</Text>
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
                                    onClick={() => {
                                      handleEditPermission(permission);
                                    }}
                                  >
                                    {t('common.edit')}
                                  </Menu.Item>
                                  <Menu.Divider />
                                  <Menu.Item
                                    leftSection={<IconTrash size={14} />}
                                    color="red"
                                    onClick={() => {
                                      handleRevokePermission(permission);
                                    }}
                                  >
                                    {t('permission.revoke')}
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

              {permissions.length === 0 && !isLoading && (
                <Center py="xl">
                  <Text c="dimmed">{t('permission.noPermissionsFound')}</Text>
                </Center>
              )}
            </Box>
          </Stack>
        </Paper>
      </Stack>

      <Modal
        opened={formOpened}
        title={
          <Title order={3}>
            {isAddMode ? t('permission.add') : t('permission.edit')}
          </Title>
        }
        size="md"
        onClose={closeForm}
      >
        <Box style={{position: 'relative'}}>
          <LoadingOverlay
            visible={isLoading}
            overlayProps={{blur: 2}}
            transitionProps={{duration: 300}}
          />

          <form onSubmit={form.onSubmit(handleSavePermission)}>
            <Stack gap="md">
              <Select
                required
                label={t('permission.resource')}
                placeholder="Select resource"
                data={RESOURCE_OPTIONS}
                error={form.errors.resource}
                disabled={isLoading}
                leftSection={<IconLock size={16} />}
                {...form.getInputProps('resource')}
                onFocus={() => {
                  setShowAlert(false);
                }}
              />

              <Select
                required
                label={t('permission.action')}
                placeholder="Select action"
                data={ACTION_OPTIONS}
                error={form.errors.action}
                disabled={isLoading}
                leftSection={<IconLock size={16} />}
                {...form.getInputProps('action')}
                onFocus={() => {
                  setShowAlert(false);
                }}
              />

              <Select
                required
                label={t('permission.scope')}
                placeholder="Select scope"
                data={SCOPE_OPTIONS}
                error={form.errors.scope}
                disabled={isLoading}
                leftSection={<IconLock size={16} />}
                {...form.getInputProps('scope')}
                onFocus={() => {
                  setShowAlert(false);
                }}
              />

              <Textarea
                required
                label={t('permission.description')}
                placeholder="Permission description"
                error={form.errors.description}
                disabled={isLoading}
                minRows={3}
                {...form.getInputProps('description')}
                onFocus={() => {
                  setShowAlert(false);
                }}
              />

              <Transition
                mounted={Boolean(
                  showAlert && Object.keys(form.errors).length > 0,
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
                    }}
                  >
                    {t('common.checkFormErrors')}
                  </Alert>
                )}
              </Transition>

              <Group justify="flex-end" mt="md">
                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={closeForm}
                >
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
