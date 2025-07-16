import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import {
  Container,
  Title,
  Stack,
  Card,
  Group,
  Button,
  TextInput,
  Box,
  Alert,
  LoadingOverlay,
  Badge,
  Text,
  Divider,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {
  IconAlertCircle,
  IconCheck,
  IconBuilding,
  IconMail,
  IconUser,
  IconEdit,
  IconDeviceFloppy,
  IconX,
  IconCalendar,
} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {useIsDarkMode} from '@/hooks/useIsDarkMode';
import {useClientActions} from '@/stores/useClientStore';
import {clientManagementService} from '@/services/clientManagement';
import {GoBack} from '@/components/common/GoBack';
import type {Client, UpdateClientRequest} from '@/lib/api';

export function ClientDetailPage() {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const {t} = useTranslation();
  const isDarkMode = useIsDarkMode();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const {updateClient} = useClientActions();

  const form = useForm<UpdateClientRequest>({
    initialValues: {
      clientName: '',
      rootUser: {
        email: '',
        firstName: '',
        lastName: '',
      },
    },
    validate: {
      clientName(value) {
        if (value && (value.length < 3 || value.length > 100)) {
          return t('admin.clients.validation.clientNameLength');
        }

        return null;
      },
      rootUser: {
        email(value) {
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return t('validation.invalidEmail');
          }

          return null;
        },
        firstName(value) {
          if (value && (value.length < 2 || value.length > 50)) {
            return t('admin.clients.validation.nameLength');
          }

          return null;
        },
        lastName(value) {
          if (value && (value.length < 2 || value.length > 50)) {
            return t('admin.clients.validation.nameLength');
          }

          return null;
        },
      },
    },
  });

  useEffect(() => {
    const loadClient = async () => {
      if (!id) {
        navigate('/admin/clients');
        return;
      }

      setIsLoading(true);
      setError(undefined);

      try {
        const clientData = await clientManagementService.getClientById(id);
        setClient(clientData);

        // Set form values
        form.setValues({
          clientName: clientData.clientName,
          rootUser: {
            email: clientData.rootUser.email,
            firstName: clientData.rootUser.firstName,
            lastName: clientData.rootUser.lastName,
          },
        });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate, t]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (client) {
      form.setValues({
        clientName: client.clientName,
        rootUser: {
          email: client.rootUser.email,
          firstName: client.rootUser.firstName,
          lastName: client.rootUser.lastName,
        },
      });
    }

    setIsEditing(false);
  };

  const handleSubmit = async (values: UpdateClientRequest) => {
    if (!client || !id) return;

    setIsSaving(true);

    try {
      const updated = await updateClient(id, values);
      setClient(updated);
      setIsEditing(false);

      notifications.show({
        title: t('admin.clients.clientUpdated'),
        message: t('admin.clients.clientUpdatedMessage', {
          name: updated.clientName,
        }),
        color: isDarkMode ? 'green.7' : 'green.9',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('errors.failedToUpdateClient');
      notifications.show({
        title: t('admin.clients.updateFailed'),
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
        <Container fluid>
          <Group w="80vw" justify="space-between">
            <GoBack />
            {client && !isEditing ? (
              <Button
                leftSection={<IconEdit size={16} />}
                disabled={isLoading}
                onClick={handleEdit}
              >
                {t('admin.clients.editClient')}
              </Button>
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
                <form onSubmit={form.onSubmit(handleSubmit)}>
                  <Stack gap="lg">
                    <Group justify="space-between" align="center">
                      <Title order={3}>
                        {t('admin.clients.clientInformation')}
                      </Title>
                      <Badge
                        size="lg"
                        color={client.status === 'active' ? 'green' : 'red'}
                        variant="filled"
                      >
                        {client.status === 'active'
                          ? t('admin.clients.active')
                          : t('admin.clients.suspended')}
                      </Badge>
                    </Group>

                    <Box>
                      <Text size="sm" c="dimmed" mb={4}>
                        {t('admin.clients.clientCode')}
                      </Text>
                      <Badge size="lg" variant="light" color="blue">
                        {client.clientCode}
                      </Badge>
                    </Box>

                    <TextInput
                      label={t('admin.clients.clientName')}
                      placeholder={t('admin.clients.clientNamePlaceholder')}
                      leftSection={<IconBuilding size={16} />}
                      {...form.getInputProps('clientName')}
                      disabled={!isEditing || isSaving}
                      readOnly={!isEditing}
                    />

                    <Group gap="xs" c="dimmed">
                      <IconCalendar size={14} />
                      <Text size="sm">
                        {t('common.created')} {formatDate(client.createdAt)}
                      </Text>
                    </Group>

                    <Divider />

                    <Title order={3}>
                      {t('admin.clients.rootUserInformation')}
                    </Title>

                    <Group grow>
                      <TextInput
                        label={t('admin.clients.firstName')}
                        placeholder={t('admin.clients.firstNamePlaceholder')}
                        leftSection={<IconUser size={16} />}
                        {...form.getInputProps('rootUser.firstName')}
                        disabled={!isEditing || isSaving}
                        readOnly={!isEditing}
                      />

                      <TextInput
                        label={t('admin.clients.lastName')}
                        placeholder={t('admin.clients.lastNamePlaceholder')}
                        leftSection={<IconUser size={16} />}
                        {...form.getInputProps('rootUser.lastName')}
                        disabled={!isEditing || isSaving}
                        readOnly={!isEditing}
                      />
                    </Group>

                    <TextInput
                      label={t('admin.clients.email')}
                      placeholder={t('admin.clients.emailPlaceholder')}
                      leftSection={<IconMail size={16} />}
                      {...form.getInputProps('rootUser.email')}
                      disabled={!isEditing || isSaving}
                      readOnly={!isEditing}
                    />

                    {isEditing ? (
                      <>
                        <Alert
                          icon={<IconAlertCircle size={16} />}
                          variant="light"
                          color="blue"
                        >
                          <Text size="sm">
                            {t('admin.clients.editClientNotice')}
                          </Text>
                        </Alert>

                        <Group justify="flex-end" mt="xl">
                          <Button
                            variant="light"
                            leftSection={<IconX size={16} />}
                            disabled={isSaving}
                            onClick={handleCancel}
                          >
                            {t('common.cancel')}
                          </Button>
                          <Button
                            type="submit"
                            leftSection={<IconDeviceFloppy size={16} />}
                            loading={isSaving}
                            disabled={isSaving}
                          >
                            {t('common.save')}
                          </Button>
                        </Group>
                      </>
                    ) : null}
                  </Stack>
                </form>
              </Card>
            ) : null}
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
