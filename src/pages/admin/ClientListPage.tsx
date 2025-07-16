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
  IconUsers,
  IconMail,
  IconCalendar,
  IconBan,
  IconCircleCheck,
  IconAlertTriangle,
  IconCheck,
  IconEdit,
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
import type {Client} from '@/lib/api';

type Action = 'suspend' | 'activate';

export function ClientListPage() {
  const navigate = useNavigate();
  const [modalOpened, {open: openModal, close: closeModal}] =
    useDisclosure(false);
  const [selectedClient, setSelectedClient] = useState<Client>();
  const [actionType, setActionType] = useState<Action>('suspend');
  const {t} = useTranslation();
  const isDarkMode = useIsDarkMode();

  const clients = useClients();
  const isLoading = useClientLoading();
  const error = useClientError();
  const {loadClients, suspendClient, activateClient, clearError} =
    useClientActions();

  useEffect(() => {
    const load = async () => {
      try {
        await loadClients();
      } catch (error) {
        console.error(error);
      }
    };

    void load();
  }, [loadClients]);

  const handleSuspendClient = (client: Client) => {
    setSelectedClient(client);
    setActionType('suspend');
    openModal();
  };

  const handleActivateClient = (client: Client) => {
    setSelectedClient(client);
    setActionType('activate');
    openModal();
  };

  const confirmAction = async () => {
    if (!selectedClient) return;

    try {
      if (actionType === 'suspend') {
        await suspendClient(selectedClient.id);
        notifications.show({
          title: t('admin.clients.clientSuspended'),
          message: t('admin.clients.clientSuspendedMessage', {
            name: selectedClient.clientName,
          }),
          color: isDarkMode ? 'yellow.7' : 'yellow.9',
          icon: <IconBan size={16} />,
        });
      } else {
        await activateClient(selectedClient.id);
        notifications.show({
          title: t('admin.clients.clientActivated'),
          message: t('admin.clients.clientActivatedMessage', {
            name: selectedClient.clientName,
          }),
          color: isDarkMode ? 'green.7' : 'green.9',
          icon: <IconCheck size={16} />,
        });
      }

      closeModal();
      setSelectedClient(undefined);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
                <Badge
                  size="sm"
                  color={isSuspended ? 'red' : 'green'}
                  variant="filled"
                >
                  {isSuspended
                    ? t('admin.clients.suspended')
                    : t('admin.clients.active')}
                </Badge>
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
                title={t('admin.clients.editClient')}
                onClick={() => navigate(`/admin/clients/${client.id}`)}
              >
                <IconEdit size={14} />
              </ActionIcon>

              {isSuspended ? (
                <ActionIcon
                  color="green"
                  variant="light"
                  size="sm"
                  title={t('admin.clients.activateClient')}
                  onClick={() => {
                    handleActivateClient(client);
                  }}
                >
                  <IconCircleCheck size={14} />
                </ActionIcon>
              ) : (
                <ActionIcon
                  color="red"
                  variant="light"
                  size="sm"
                  title={t('admin.clients.suspendClient')}
                  onClick={() => {
                    handleSuspendClient(client);
                  }}
                >
                  <IconBan size={14} />
                </ActionIcon>
              )}
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

      {/* Suspend/Activate Confirmation Modal */}
      <Modal
        centered
        opened={modalOpened}
        title={
          <Title order={3}>
            {actionType === 'suspend'
              ? t('admin.clients.confirmSuspendTitle')
              : t('admin.clients.confirmActivateTitle')}
          </Title>
        }
        onClose={closeModal}
      >
        <Stack gap="md">
          <Text>
            {actionType === 'suspend'
              ? t('admin.clients.confirmSuspendMessage', {
                  name: selectedClient?.clientName || '',
                })
              : t('admin.clients.confirmActivateMessage', {
                  name: selectedClient?.clientName || '',
                })}
          </Text>

          {actionType === 'suspend' && (
            <Alert
              icon={<IconAlertTriangle size={16} />}
              color="yellow"
              variant="light"
            >
              {t('admin.clients.suspendWarning')}
            </Alert>
          )}

          <Flex gap="sm" justify="flex-end">
            <Button variant="light" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button
              color={actionType === 'suspend' ? 'red' : 'green'}
              onClick={confirmAction}
            >
              {actionType === 'suspend'
                ? t('admin.clients.suspend')
                : t('admin.clients.activate')}
            </Button>
          </Flex>
        </Stack>
      </Modal>
    </>
  );
}
