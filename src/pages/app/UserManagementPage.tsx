import { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router';
import {
  Button,
  Paper,
  Group,
  Center,
  Box,
  Stack,
  Container,
  Title,
  ActionIcon,
  Text,
  Badge,
  Modal,
  LoadingOverlay,
  Alert,
  Transition,
  Card,
  TextInput,
  PasswordInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  IconUserPlus,
  IconEye,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconFileSpreadsheet,
} from '@tabler/icons-react';
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';
import { useTranslation } from '@/hooks/useTranslation';
import { getFormValidators, validateIdentifier, validateEmail } from '@/utils/validation';
import { FirstNameAndLastNameInForm } from '@/components/form/FirstNameAndLastNameInForm';
import { useAppStore } from '@/stores/useAppStore';
import { delay } from '@/utils/time';
import i18n from '@/lib/i18n';
import { getLocaleConfig } from '@/config/localeConfig';
import { userService, type User } from '@/services/user/user';
import { DataTable, GoBack } from '@/components/common';
import { ROUTERS, getUserDetailRoute } from '@/config/routeConfig';

type EditUserFormValues = {
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  password?: string;
  confirmPassword?: string;
};

const getDisplayName = (firstName: string, lastName: string) => {
  const localeConfig = getLocaleConfig(i18n.language);
  return localeConfig.nameOrder === 'family-first'
    ? `${lastName} ${firstName}`
    : `${firstName} ${lastName}`;
};

export function UserManagementPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAppStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [showAlert, setShowAlert] = useState(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  const form = useForm<EditUserFormValues>({
    initialValues: {
      email: '',
      userName: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      ...getFormValidators(t, ['firstName', 'lastName']),
      email: (value: string) => validateEmail(value, t),
      userName: (value: string) => validateIdentifier(value, t),
      password(value?: string) {
        if (value && value.length > 0) {
          return getFormValidators(t, ['password']).password(value);
        }

        return undefined;
      },
      confirmPassword(value?: string): string | undefined {
        if (form.values.password && form.values.password.length > 0) {
          return getFormValidators(t, ['confirmPassword']).confirmPassword(value ?? '', {
            password: form.values.password,
          });
        }

        return undefined;
      },
    },
  });

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);

      const users = await userService.getUsers();

      setUsers(users);
    } catch {
      showErrorNotification(t('common.error'), t('common.loadingFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleViewUser = (userId: string) => {
    navigate(getUserDetailRoute(userId));
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    form.setValues({
      email: user.email || '',
      userName: user.userName || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      password: '',
      confirmPassword: '',
    });
    openEdit();
  };

  const handleDeleteUser = (user: User) => {
    modals.openConfirmModal({
      title: t('common.confirmDelete'),
      children: (
        <Text size="sm">
          {t('common.confirmDeleteMessage', {
            name: getDisplayName(user.firstName || '', user.lastName || ''),
          })}
        </Text>
      ),
      labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
      confirmProps: { color: 'red' },
      async onConfirm() {
        try {
          setIsLoading(true);

          // Simulate API call
          await delay(500);

          // Remove user from local state
          setUsers((prev) => prev.filter((u) => u.id !== user.id));

          showSuccessNotification(t('common.success'), t('common.userDeleted'));
        } catch {
          showErrorNotification(t('common.error'), t('common.deleteFailed'));
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleSaveUser = async (values: EditUserFormValues) => {
    try {
      setIsLoading(true);

      // Simulate API call
      await delay(500);

      // Update user in local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser?.id
            ? {
                ...u,
                email: values.email,
                userName: values.userName,
                firstName: values.firstName,
                lastName: values.lastName,
              }
            : u,
        ),
      );

      showSuccessNotification(t('common.success'), t('common.userUpdated'));
      closeEdit();
      form.reset();
    } catch {
      setShowAlert(true);
      showErrorNotification(t('common.error'), t('common.updateFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  if (!user?.isRoot) {
    return <Navigate to={ROUTERS.HOME} />;
  }

  return (
    <Container fluid px="xl" mt="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <GoBack />

          <Group gap="sm">
            <Button
              variant="light"
              size="sm"
              color="green"
              leftSection={<IconFileSpreadsheet size={16} />}
              visibleFrom="sm"
              onClick={() => navigate(ROUTERS.IMPORT_USERS)}
            >
              {t('common.importUsers')}
            </Button>
            <Button
              leftSection={<IconUserPlus size={16} />}
              onClick={() => navigate(ROUTERS.ADD_USER)}
            >
              {t('auth.addUser')}
            </Button>
          </Group>
        </Group>

        <Title order={1} ta="center">
          {t('common.userManagement')}
        </Title>

        <Paper withBorder shadow="md" p="md" radius="md">
          <Stack gap="md">
            <Box style={{ position: 'relative' }}>
              <LoadingOverlay
                visible={isLoading ? !editOpened : false}
                overlayProps={{ blur: 2 }}
                transitionProps={{ duration: 300 }}
              />

              {/* Desktop Table View */}
              <Box hiddenFrom="md">
                {/* Mobile Card View */}
                <Stack gap="sm">
                  {users.map((user) => (
                    <Card key={user.id} withBorder padding="md" radius="md">
                      <Stack gap="xs">
                        <Group justify="space-between" align="flex-start">
                          <Box>
                            <Text fw={500} size="sm">
                              {getDisplayName(user.firstName || '', user.lastName || '')}
                            </Text>
                            {user.email ? (
                              <Text size="xs" c="dimmed">
                                {user.email}
                              </Text>
                            ) : null}
                            {user.userName ? (
                              <Text size="xs" c="dimmed">
                                @{user.userName}
                              </Text>
                            ) : null}
                          </Box>
                          <Group gap={4}>
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              size="sm"
                              onClick={() => {
                                handleViewUser(user.id);
                              }}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="sm"
                              onClick={() => {
                                handleEditUser(user);
                              }}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="sm"
                              onClick={() => {
                                handleDeleteUser(user);
                              }}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Group>

                        {user.isRoot ? (
                          <Badge color="blue" variant="light" size="sm">
                            Root User
                          </Badge>
                        ) : null}
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Box>

              <Box visibleFrom="md">
                {/* Desktop Table View */}
                <DataTable
                  data={users}
                  isLoading={false}
                  emptyMessage={t('common.noUsersFound')}
                  renderActions={(user: User) => (
                    <Group gap={4} justify="flex-end">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        size="sm"
                        onClick={() => {
                          handleViewUser(user.id);
                        }}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        onClick={() => {
                          handleEditUser(user);
                        }}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => {
                          handleDeleteUser(user);
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  )}
                  columns={[
                    {
                      key: 'name',
                      header: t('common.name'),
                      render: (user: User) => (
                        <Text fw={500}>
                          {getDisplayName(user.firstName || '', user.lastName || '')}
                          {user.isRoot ? (
                            <Badge color="blue" variant="light" size="xs" ml="xs">
                              Root
                            </Badge>
                          ) : null}
                        </Text>
                      ),
                    },
                    {
                      key: 'email',
                      header: t('auth.email'),
                      render: (user: User) => <Text size="sm">{user.email || '-'}</Text>,
                    },
                    {
                      key: 'userName',
                      header: t('auth.userName'),
                      render: (user: User) => <Text size="sm">{user.userName || '-'}</Text>,
                    },
                  ]}
                />
              </Box>

              {users.length === 0 && !isLoading && (
                <Center py="xl">
                  <Text c="dimmed">{t('common.noUsersFound')}</Text>
                </Center>
              )}
            </Box>
          </Stack>
        </Paper>
      </Stack>

      {/* Edit User Modal */}
      <Modal
        opened={editOpened}
        title={<Title order={3}>{t('common.editUser')}</Title>}
        size="md"
        onClose={closeEdit}
      >
        <Box style={{ position: 'relative' }}>
          <LoadingOverlay
            visible={isLoading}
            overlayProps={{ blur: 2 }}
            transitionProps={{ duration: 300 }}
          />

          <form onSubmit={form.onSubmit(handleSaveUser)}>
            <Stack gap="md">
              <FirstNameAndLastNameInForm
                form={form}
                isLoading={isLoading}
                setShowAlert={setShowAlert}
              />

              <TextInput
                required
                label={t('auth.email')}
                placeholder="user@example.com"
                error={form.errors.email}
                disabled={isLoading}
                {...form.getInputProps('email')}
                onFocus={() => {
                  setShowAlert(false);
                }}
              />

              <TextInput
                required
                label={t('auth.userName')}
                placeholder="userName"
                error={form.errors.userName}
                disabled={isLoading}
                {...form.getInputProps('userName')}
                onFocus={() => {
                  setShowAlert(false);
                }}
              />

              <PasswordInput
                label={t('auth.newPassword')}
                placeholder={t('auth.leaveEmptyToKeepCurrent')}
                error={form.errors.password}
                disabled={isLoading}
                {...form.getInputProps('password')}
                onFocus={() => {
                  setShowAlert(false);
                }}
              />

              <PasswordInput
                label={t('auth.confirmNewPassword')}
                placeholder={t('auth.confirmYourPassword')}
                error={form.errors.confirmPassword}
                disabled={isLoading}
                {...form.getInputProps('confirmPassword')}
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
                <Button variant="outline" disabled={isLoading} onClick={closeEdit}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit">{t('common.save')}</Button>
              </Group>
            </Stack>
          </form>
        </Box>
      </Modal>
    </Container>
  );
}
