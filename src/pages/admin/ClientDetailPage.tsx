import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import {
  Container,
  Title,
  Stack,
  Card,
  Group,
  Box,
  Alert,
  LoadingOverlay,
  ActionIcon,
  Menu,
  Divider,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {notifications} from '@mantine/notifications';
import {
  IconAlertCircle,
  IconBan,
  IconCircleCheck,
  IconTrash,
  IconCheck,
  IconDotsVertical,
  IconAlertTriangle,
} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {useIsDarkMode} from '@/hooks/useIsDarkMode';
import {useClientActions} from '@/stores/useClientStore';
import {clientManagementService} from '@/services/clientManagement';
import {GoBack} from '@/components/common/GoBack';
import {
  ClientBasicInfo,
  RootUserInfo,
  ClientActionModal,
} from '@/components/admin/ClientManagementComponents';
import type {Client} from '@/lib/api';

export function ClientDetailPage() {
  const {clientCode} = useParams<{clientCode: string}>();
  const navigate = useNavigate();
  const {t} = useTranslation();
  const isDarkMode = useIsDarkMode();
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [deleteConfirmCode, setDeleteConfirmCode] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [actionType, setActionType] = useState<
    'suspend' | 'reactivate' | 'delete' | undefined
  >();

  const [modalOpened, {open: openModal, close: closeModal}] =
    useDisclosure(false);
  const {suspendClient, reactivateClient, hardDeleteClient} =
    useClientActions();

  const handleSuspend = () => {
    setActionType('suspend');
    setSuspendReason('');
    openModal();
  };

  const handleReactivate = () => {
    setActionType('reactivate');
    openModal();
  };

  const handleDelete = () => {
    setActionType('delete');
    setDeleteConfirmCode('');
    setDeleteReason('');
    openModal();
  };

  useEffect(() => {
    const loadClient = async () => {
      if (!clientCode) {
        navigate('/admin/clients');
        return;
      }

      setIsLoading(true);
      setError(undefined);

      try {
        const clientData =
          await clientManagementService.getClientByClientCode(clientCode);
        setClient(clientData);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t('errors.failedToLoadClient');
        setError(errorMessage);
        console.error('Failed to load client:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadClient();
  }, [clientCode, navigate, t]);

  const confirmAction = async () => {
    if (!client || !clientCode || !actionType) return;

    try {
      switch (actionType) {
        case 'suspend': {
          if (!suspendReason.trim()) {
            notifications.show({
              title: t('validation.error'),
              message: t('admin.clients.validation.suspendReasonRequired'),
              color: 'red',
              icon: <IconAlertCircle size={16} />,
            });
            return;
          }

          await suspendClient(clientCode, suspendReason);
          await loadClient();

          notifications.show({
            title: t('admin.clients.clientSuspended'),
            message: t('admin.clients.clientSuspendedMessage', {
              name: client.clientName,
            }),
            color: isDarkMode ? 'yellow.7' : 'yellow.9',
            icon: <IconBan size={16} />,
          });

          break;
        }

        case 'reactivate': {
          await reactivateClient(clientCode);
          await loadClient();

          notifications.show({
            title: t('admin.clients.clientActivated'),
            message: t('admin.clients.clientActivatedMessage', {
              name: client.clientName,
            }),
            color: isDarkMode ? 'green.7' : 'green.9',
            icon: <IconCheck size={16} />,
          });

          break;
        }

        case 'delete': {
          if (deleteConfirmCode !== clientCode) {
            notifications.show({
              title: t('validation.error'),
              message: t('admin.clients.validation.confirmCodeMismatch'),
              color: 'red',
              icon: <IconAlertCircle size={16} />,
            });
            return;
          }

          if (!deleteReason.trim()) {
            notifications.show({
              title: t('validation.error'),
              message: t('admin.clients.validation.deleteReasonRequired'),
              color: 'red',
              icon: <IconAlertCircle size={16} />,
            });
            return;
          }

          await hardDeleteClient(clientCode, deleteConfirmCode, deleteReason);

          notifications.show({
            title: t('admin.clients.clientDeleted'),
            message: t('admin.clients.clientDeletedMessage', {
              name: client.clientName,
            }),
            color: 'red',
            icon: <IconTrash size={16} />,
          });

          navigate('/admin/clients');

          break;
        }

        // No default needed - actionType is checked above
      }

      closeModal();
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

  const loadClient = async () => {
    if (!clientCode) return;

    try {
      const clientData =
        await clientManagementService.getClientByClientCode(clientCode);
      setClient(clientData);
    } catch (error) {
      console.error('Failed to reload client:', error);
    }
  };

  if (error && !isLoading) {
    return (
      <Container fluid mt="xl">
        <Stack gap="xl">
          <Container fluid px="md">
            <GoBack />
          </Container>

          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              padding: '0 16px',
            }}
          >
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              style={{maxWidth: '600px', width: '100%'}}
            >
              {error}
            </Alert>
          </Box>
        </Stack>
      </Container>
    );
  }

  return (
    <Container fluid mt="xl">
      <Stack gap="xl">
        <Container fluid px="md">
          <Group justify="space-between">
            <GoBack />
            {client ? (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <ActionIcon variant="light" size="lg">
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  {client.status === 'active' ? (
                    <Menu.Item
                      leftSection={<IconBan size={14} />}
                      color="yellow"
                      onClick={handleSuspend}
                    >
                      {t('admin.clients.suspendClient')}
                    </Menu.Item>
                  ) : (
                    <Menu.Item
                      leftSection={<IconCircleCheck size={14} />}
                      color="green"
                      onClick={handleReactivate}
                    >
                      {t('admin.clients.activateClient')}
                    </Menu.Item>
                  )}
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconTrash size={14} />}
                    color="red"
                    onClick={handleDelete}
                  >
                    {t('admin.clients.deleteClient')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : null}
          </Group>
        </Container>

        <Title order={1} ta="center">
          {t('admin.clients.clientDetails')}
        </Title>

        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            padding: '0 16px',
          }}
        >
          <Box style={{maxWidth: '600px', width: '100%', position: 'relative'}}>
            <LoadingOverlay
              visible={isLoading}
              overlayProps={{blur: 2}}
              transitionProps={{duration: 300}}
            />

            {client ? (
              <Card shadow="sm" padding="xl" radius="md">
                <Stack gap="lg">
                  <ClientBasicInfo client={client} />
                  <Divider />
                  <RootUserInfo rootUser={client.rootUser} />
                </Stack>
              </Card>
            ) : null}
          </Box>
        </Box>
      </Stack>

      {/* Action Confirmation Modal */}
      {actionType && client ? (
        <ClientActionModal
          opened={modalOpened}
          actionType={actionType}
          clientName={client.clientName}
          clientCode={client.clientCode}
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
    </Container>
  );
}
