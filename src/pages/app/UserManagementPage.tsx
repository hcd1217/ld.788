import {useState, useEffect, useCallback} from 'react';
import {Navigate, useNavigate} from 'react-router';
import {
  Button,
  Paper,
  Group,
  Anchor,
  Center,
  Box,
  rem,
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
  PasswordInput,
  LoadingOverlay,
  Pagination,
  Tooltip,
  Alert,
  Transition,
  Card,
  ScrollArea,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {useDisclosure} from '@mantine/hooks';
import {modals} from '@mantine/modals';
import {notifications} from '@mantine/notifications';
import {
  IconArrowLeft,
  IconUserPlus,
  IconEye,
  IconEdit,
  IconTrash,
  IconDots,
  IconSearch,
  IconRefresh,
  IconAlertCircle,
  IconMail,
  IconAt,
  IconLock,
  IconUser,
  IconFileSpreadsheet,
} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {
  getFormValidators,
  validateIdentifier,
  validateEmail,
} from '@/utils/validation';
import {FirstNameAndLastNameInForm} from '@/components/form/FirstNameAndLastNameInForm';
import {useAppStore} from '@/stores/useAppStore';
import {delay} from '@/utils/time';
import i18n from '@/lib/i18n';
import {getLocaleConfig} from '@/config/localeConfig';
import {userService, type User} from '@/services/user';

type EditUserFormValues = {
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  password?: string;
  confirmPassword?: string;
};

const USERS_PER_PAGE = 10;

const getDisplayName = (firstName: string, lastName: string) => {
  const localeConfig = getLocaleConfig(i18n.language);
  return localeConfig.nameOrder === 'family-first'
    ? `${lastName} ${firstName}`
    : `${firstName} ${lastName}`;
};

export function UserManagementPage() {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {user} = useAppStore();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [showAlert, setShowAlert] = useState(false);

  const [editOpened, {open: openEdit, close: closeEdit}] = useDisclosure(false);

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
          return getFormValidators(t, ['confirmPassword']).confirmPassword(
            value ?? '',
            {
              password: form.values.password,
            },
          );
        }

        return undefined;
      },
    },
  });

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);

      const users = await userService.getUsers({
        search: searchQuery || undefined,
        limit: USERS_PER_PAGE,
      });

      setUsers(users);
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
  }, [searchQuery, t]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleViewUser = (userId: string) => {
    navigate(`/user/${userId}`);
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
      labels: {confirm: t('common.delete'), cancel: t('common.cancel')},
      confirmProps: {color: 'red'},
      async onConfirm() {
        try {
          setIsLoading(true);

          // Simulate API call
          await delay(500);

          // Remove user from local state
          setUsers((prev) => prev.filter((u) => u.id !== user.id));

          notifications.show({
            title: t('common.success'),
            message: t('common.userDeleted'),
            color: 'green',
            icon: <IconTrash size={16} />,
          });
        } catch {
          notifications.show({
            title: t('common.error'),
            message: t('common.deleteFailed'),
            color: 'red',
            icon: <IconAlertCircle size={16} />,
          });
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

      notifications.show({
        title: t('common.success'),
        message: t('common.userUpdated'),
        color: 'green',
        icon: <IconUser size={16} />,
      });

      closeEdit();
      form.reset();
    } catch {
      setShowAlert(true);
      notifications.show({
        title: t('common.error'),
        message: t('common.updateFailed'),
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    // Since we're using API search, just use the users directly
    setFilteredUsers(users);
  }, [users]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE,
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  if (!user?.isRoot) {
    return <Navigate to="/home" />;
  }

  return (
    <Container size="xl" mt="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Anchor
            component="button"
            type="button"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <Center inline>
              <IconArrowLeft
                style={{width: rem(12), height: rem(12)}}
                stroke={1.5}
              />
              <Box ml={5}>{t('common.backToPreviousPage')}</Box>
            </Center>
          </Anchor>

          <Group gap="sm">
            <Button
              variant="light"
              size="sm"
              color="green"
              leftSection={<IconFileSpreadsheet size={16} />}
              visibleFrom="sm"
              onClick={() => navigate('/import-users')}
            >
              {t('common.importUsers')}
            </Button>
            <Button
              leftSection={<IconUserPlus size={16} />}
              onClick={() => navigate('/add-user')}
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
            <Group justify="space-between" align="flex-start">
              <Stack gap="md" style={{flex: 1}}>
                {/* Mobile: Stack filters vertically */}
                <Box hiddenFrom="sm">
                  <TextInput
                    placeholder={t('common.searchUsers')}
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(event) => {
                      handleSearch(event.currentTarget.value);
                    }}
                  />
                </Box>

                {/* Desktop: Horizontal layout */}
                <Box visibleFrom="sm">
                  <TextInput
                    placeholder={t('common.searchUsers')}
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    style={{minWidth: 250}}
                    onChange={(event) => {
                      handleSearch(event.currentTarget.value);
                    }}
                  />
                </Box>
              </Stack>

              <Tooltip label={t('common.refresh')}>
                <ActionIcon
                  variant="light"
                  size="lg"
                  loading={isLoading}
                  onClick={loadUsers}
                >
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

              {/* Desktop Table View */}
              <Box hiddenFrom="md">
                {/* Mobile Card View */}
                <Stack gap="sm">
                  {paginatedUsers.map((user) => (
                    <Card key={user.id} withBorder padding="md" radius="md">
                      <Stack gap="xs">
                        <Group justify="space-between" align="flex-start">
                          <Box>
                            <Text fw={500} size="sm">
                              {getDisplayName(
                                user.firstName || '',
                                user.lastName || '',
                              )}
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
                          <Menu shadow="md" width={200}>
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray">
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconEye size={14} />}
                                onClick={() => {
                                  handleViewUser(user.id);
                                }}
                              >
                                {t('common.viewDetails')}
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={() => {
                                  handleEditUser(user);
                                }}
                              >
                                {t('common.edit')}
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => {
                                  handleDeleteUser(user);
                                }}
                              >
                                {t('common.delete')}
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
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
                <ScrollArea>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('common.name')}</Table.Th>
                        <Table.Th>{t('auth.email')}</Table.Th>
                        <Table.Th>{t('auth.userName')}</Table.Th>
                        <Table.Th>{t('common.actions')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {paginatedUsers.map((user) => (
                        <Table.Tr key={user.id}>
                          <Table.Td>
                            <Text fw={500}>
                              {getDisplayName(
                                user.firstName || '',
                                user.lastName || '',
                              )}
                              {user.isRoot ? (
                                <Badge
                                  color="blue"
                                  variant="light"
                                  size="xs"
                                  ml="xs"
                                >
                                  Root
                                </Badge>
                              ) : null}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{user.email || '-'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{user.userName || '-'}</Text>
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
                                    leftSection={<IconEye size={14} />}
                                    onClick={() => {
                                      handleViewUser(user.id);
                                    }}
                                  >
                                    {t('common.viewDetails')}
                                  </Menu.Item>
                                  <Menu.Item
                                    leftSection={<IconEdit size={14} />}
                                    onClick={() => {
                                      handleEditUser(user);
                                    }}
                                  >
                                    {t('common.edit')}
                                  </Menu.Item>
                                  <Menu.Divider />
                                  <Menu.Item
                                    leftSection={<IconTrash size={14} />}
                                    color="red"
                                    onClick={() => {
                                      handleDeleteUser(user);
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

              {filteredUsers.length === 0 && !isLoading && (
                <Center py="xl">
                  <Text c="dimmed">{t('common.noUsersFound')}</Text>
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

      {/* Edit User Modal */}
      <Modal
        opened={editOpened}
        title={t('common.editUser')}
        size="md"
        onClose={closeEdit}
      >
        <Box style={{position: 'relative'}}>
          <LoadingOverlay
            visible={isLoading}
            overlayProps={{blur: 2}}
            transitionProps={{duration: 300}}
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
                leftSection={<IconMail size={16} />}
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
                leftSection={<IconAt size={16} />}
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
                leftSection={<IconLock size={16} />}
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
                leftSection={<IconLock size={16} />}
                {...form.getInputProps('confirmPassword')}
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
                  onClick={closeEdit}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" loading={isLoading}>
                  {t('common.save')}
                </Button>
              </Group>
            </Stack>
          </form>
        </Box>
      </Modal>
    </Container>
  );
}
