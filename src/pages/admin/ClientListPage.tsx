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
  SimpleGrid,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {notifications} from '@mantine/notifications';
import {
  IconPlus,
  IconUsers,
  IconAlertTriangle,
  IconCheck,
  IconBan,
  IconTrash,
} from '@tabler/icons-react';
import {useIsDarkMode} from '@/hooks/useIsDarkMode';
import {useTranslation} from '@/hooks/useTranslation';
import {
  useClients,
  useClientError,
  useClientActions,
} from '@/stores/useClientStore';
import {ErrorAlert, GoBack} from '@/components/common';
import {
  ClientCard,
  ClientActionModal,
} from '@/components/admin/ClientManagementComponents';
import type {Client} from '@/lib/api';
import {ROUTERS, getAdminClientDetailRoute} from '@/config/routeConfig';

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
  };

  return (
    <>
      <Container fluid px="xl" mt="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <GoBack />
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate(ROUTERS.ADMIN_CLIENTS_NEW)}
            >
              {t('admin.clients.createNewClient')}
            </Button>
          </Group>

          <Title order={1} ta="center">
            {t('admin.clients.title')}
          </Title>

          <ErrorAlert error={error} clearError={clearError} />

          {clients.length === 0 ? (
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
                  onClick={() => navigate(ROUTERS.ADMIN_CLIENTS_NEW)}
                >
                  {t('admin.clients.createFirstClient')}
                </Button>
              </Stack>
            </Card>
          ) : (
            <SimpleGrid cols={{base: 1, sm: 2, lg: 3}} spacing="lg">
              {clients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onSuspend={handleSuspendClient}
                  onReactivate={handleReactivateClient}
                  onDelete={handleDeleteClient}
                  onViewDetails={(clientCode) =>
                    navigate(getAdminClientDetailRoute(clientCode))
                  }
                />
              ))}
            </SimpleGrid>
          )}
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
