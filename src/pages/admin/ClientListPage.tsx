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
  Menu,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {notifications} from '@mantine/notifications';
import {
  IconPlus,
  IconUsers,
  IconMail,
  IconCalendar,
  IconBan,
  IconCircleCheck,
  IconAlertTriangle,
  IconCheck,
  IconEdit,
  IconTrash,
  IconDotsVertical,
} from '@tabler/icons-react';
import {useIsDarkMode} from '@/hooks/useIsDarkMode';
import {useTranslation} from '@/hooks/useTranslation';
import {
  useClients,
  useClientLoading,
  useClientError,
  useClientActions,
} from '@/stores/useClientStore';
import {GoBack} from '@/components/common/GoBack';
import {
  ClientStatusBadge,
  ClientActionModal,
} from '@/components/admin/ClientManagementComponents';
import type {Client} from '@/lib/api';
import {formatDate} from '@/utils/string';

type Action = 'suspend' | 'reactivate' | 'delete';

export function ClientListPage() {
  const navigate = useNavigate();
  const [modalOpened, {open: openModal, close: closeModal}] =
    useDisclosure(false);
  const [selectedClient, setSelectedClient] = useState<Client>();
  const [actionType, setActionType] = useState<Action>('suspend');
  const [deleteConfirmCode, setDeleteConfirmCode] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const {t} = useTranslation();
  const isDarkMode = useIsDarkMode();

  const clients = useClients();
  const isLoading = useClientLoading();
  const error = useClientError();
  const {
    loadClients,
    suspendClient,
    reactivateClient,
    hardDeleteClient,
    clearError,
  } = useClientActions();

  useEffect(() => {
    const load = async () => {
      await loadClients();
    };

    void load();
  }, [loadClients]);

  const handleSuspendClient = (client: Client) => {
    setSelectedClient(client);
    setActionType('suspend');
    openModal();
  };

  const handleReactivateClient = (client: Client) => {
    setSelectedClient(client);
    setActionType('reactivate');
    openModal();
  };

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setActionType('delete');
    setDeleteConfirmCode('');
    setDeleteReason('');
    openModal();
  };

  const confirmAction = async () => {
    if (!selectedClient) return;

    try {
      switch (actionType) {
        case 'suspend': {
          if (!suspendReason.trim()) {
            notifications.show({
              title: t('validation.error'),
              message: t('admin.clients.validation.suspendReasonRequired'),
              color: 'red',
              icon: <IconAlertTriangle size={16} />,
            });
            return;
          }

          await suspendClient(selectedClient.clientCode, suspendReason);
          notifications.show({
            title: t('admin.clients.clientSuspended'),
            message: t('admin.clients.clientSuspendedMessage', {
              name: selectedClient.clientName,
            }),
            color: isDarkMode ? 'yellow.7' : 'yellow.9',
            icon: <IconBan size={16} />,
          });

          break;
        }

        case 'reactivate': {
          await reactivateClient(selectedClient.clientCode);
          notifications.show({
            title: t('admin.clients.clientActivated'),
            message: t('admin.clients.clientActivatedMessage', {
              name: selectedClient.clientName,
            }),
            color: isDarkMode ? 'green.7' : 'green.9',
            icon: <IconCheck size={16} />,
          });

          break;
        }

        case 'delete': {
          if (deleteConfirmCode !== selectedClient.clientCode) {
            notifications.show({
              title: t('validation.error'),
              message: t('admin.clients.validation.confirmCodeMismatch'),
              color: 'red',
              icon: <IconAlertTriangle size={16} />,
            });
            return;
          }

          if (!deleteReason.trim()) {
            notifications.show({
              title: t('validation.error'),
              message: t('admin.clients.validation.deleteReasonRequired'),
              color: 'red',
              icon: <IconAlertTriangle size={16} />,
            });
            return;
          }

          await hardDeleteClient(
            selectedClient.clientCode,
            deleteConfirmCode,
            deleteReason,
          );
          notifications.show({
            title: t('admin.clients.clientDeleted'),
            message: t('admin.clients.clientDeletedMessage', {
              name: selectedClient.clientName,
            }),
            color: 'red',
            icon: <IconTrash size={16} />,
          });

          break;
        }
        // No default needed - switch is exhaustive
      }

      closeModal();
      setSelectedClient(undefined);
      await loadClients();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('errors.failedToUpdateClient');

      notifications.show({
        title: t('admin.clients.updateFailed'),
        message: errorMessage,
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
      });
    }
  };

  const renderClientCard = (client: Client) => {
    const isSuspended = client.status === 'suspended';

    return (
      <Card
        key={client.id}
        withBorder
        shadow="sm"
        padding="lg"
        radius="md"
        style={isSuspended ? {opacity: 0.7} : undefined}
      >
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4} style={{flex: 1}}>
              <Group gap="xs" wrap="nowrap">
                <Text truncate fw={700} size="lg">
                  {client.clientName}
                </Text>
                <ClientStatusBadge status={client.status} size="sm" />
              </Group>

              <Badge size="md" variant="light" color="blue">
                {client.clientCode}
              </Badge>

              <Group gap="xs" c="dimmed" mt="xs">
                <IconMail size={14} />
                <Text size="sm">{client.rootUser.email}</Text>
              </Group>

              <Text size="sm" c="dimmed">
                {client.rootUser.firstName} {client.rootUser.lastName}
              </Text>
            </Stack>

            <Group gap="xs">
              <ActionIcon
                color="blue"
                variant="light"
                size="sm"
                title={t('admin.clients.viewDetails')}
                onClick={() => navigate(`/admin/clients/${client.clientCode}`)}
              >
                <IconEdit size={14} />
              </ActionIcon>

              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <ActionIcon
                    variant="light"
                    size="sm"
                    title={t('admin.clients.moreActions')}
                  >
                    <IconDotsVertical size={14} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  {isSuspended ? (
                    <Menu.Item
                      leftSection={<IconCircleCheck size={14} />}
                      color="green"
                      onClick={() => {
                        handleReactivateClient(client);
                      }}
                    >
                      {t('admin.clients.activateClient')}
                    </Menu.Item>
                  ) : (
                    <Menu.Item
                      leftSection={<IconBan size={14} />}
                      color="yellow"
                      onClick={() => {
                        handleSuspendClient(client);
                      }}
                    >
                      {t('admin.clients.suspendClient')}
                    </Menu.Item>
                  )}
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconTrash size={14} />}
                    color="red"
                    onClick={() => {
                      handleDeleteClient(client);
                    }}
                  >
                    {t('admin.clients.deleteClient')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>

          <Group
            justify="space-between"
            pt="md"
            style={{borderTop: '1px solid var(--mantine-color-gray-3)'}}
          >
            <Group gap="xs" c="dimmed">
              <IconCalendar size={14} />
              <Text size="xs">
                {t('common.created')} {formatDate(client.createdAt)}
              </Text>
            </Group>
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
              onClick={() => navigate('/admin/clients/new')}
            >
              {t('admin.clients.createNewClient')}
            </Button>
          </Group>

          <Title order={1} ta="center">
            {t('admin.clients.title')}
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

            {clients.length === 0 && !isLoading ? (
              <Card shadow="sm" padding="xl" radius="md" ta="center">
                <Stack gap="md">
                  <IconUsers size={48} color="var(--mantine-color-gray-5)" />
                  <div>
                    <Title order={3} c="dimmed">
                      {t('admin.clients.noClientsFound')}
                    </Title>
                    <Text c="dimmed" mt="xs">
                      {t('admin.clients.createFirstClientDescription')}
                    </Text>
                  </div>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    mt="md"
                    onClick={() => navigate('/admin/clients/new')}
                  >
                    {t('admin.clients.createFirstClient')}
                  </Button>
                </Stack>
              </Card>
            ) : (
              <SimpleGrid cols={{base: 1, sm: 2, lg: 3}} spacing="lg">
                {clients.map((client) => renderClientCard(client))}
              </SimpleGrid>
            )}
          </div>
        </Stack>
      </Container>

      {/* Action Confirmation Modal */}
      {selectedClient ? (
        <ClientActionModal
          opened={modalOpened}
          actionType={actionType}
          clientName={selectedClient.clientName}
          clientCode={selectedClient.clientCode}
          suspendReason={suspendReason}
          deleteConfirmCode={deleteConfirmCode}
          deleteReason={deleteReason}
          onClose={closeModal}
          onSuspendReasonChange={setSuspendReason}
          onDeleteConfirmCodeChange={setDeleteConfirmCode}
          onDeleteReasonChange={setDeleteReason}
          onConfirm={confirmAction}
        />
      ) : null}
    </>
  );
}
