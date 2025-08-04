import React from 'react';
import { useNavigate } from 'react-router';
import {
  Container,
  Title,
  Stack,
  Card,
  Group,
  Button,
  TextInput,
  PasswordInput,
  Box,
  Alert,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconBuilding, IconMail, IconUser, IconLock } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useClientActions } from '@/stores/useClientStore';
import { GoBack } from '@/components/common';
import { showSuccessNotification } from '@/utils/notifications';
import { getFormValidators } from '@/utils/validation';
import type { RegisterClientRequest } from '@/lib/api';
import { isDevelopment } from '@/utils/env';
import { ROUTERS } from '@/config/routeConfig';

function fakeClient() {
  const clientCode = Math.random().toString(36).slice(2, 8);
  const clientName = `${clientCode.toLocaleUpperCase()} Inc.`;
  return {
    clientCode: clientCode.toLocaleUpperCase(),
    clientName,
    rootUserEmail: `admin@${clientCode}.com`,
    rootUserPassword: 's5cureP@s5w0rd123!!!',
    rootUserFirstName: `U${clientCode}`,
    rootUserLastName: 'Admin',
  };
}

export function ClientCreatePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { createClient } = useClientActions();

  const form = useForm<RegisterClientRequest>({
    initialValues: isDevelopment
      ? fakeClient()
      : {
          clientCode: '',
          clientName: '',
          rootUserEmail: '',
          rootUserPassword: '',
          rootUserFirstName: '',
          rootUserLastName: '',
        },
    validate: {
      ...getFormValidators(t, ['clientCode', 'clientName']),
      // Override with custom client-specific validators
      clientCode(value: string) {
        if (!value.trim()) {
          return t('validation.fieldRequired');
        }

        if (!/^[A-Z\d]{2,10}$/.test(value)) {
          return t('admin.clients.validation.clientCodeFormat');
        }

        return null;
      },
      clientName(value: string) {
        if (!value.trim()) {
          return t('validation.fieldRequired');
        }

        if (value.length < 3 || value.length > 100) {
          return t('admin.clients.validation.clientNameLength');
        }

        return null;
      },
      rootUserEmail(value: string) {
        const baseValidation = getFormValidators(t, ['email']).email(value);
        return baseValidation;
      },
      rootUserPassword(value: string) {
        if (!value) {
          return t('validation.fieldRequired');
        }

        if (value.length < 12) {
          return t('admin.clients.validation.passwordLength');
        }

        return null;
      },
      rootUserFirstName(value: string) {
        const baseValidation = getFormValidators(t, ['firstName']).firstName(value);
        if (baseValidation) return baseValidation;
        if (value.length > 50) {
          return t('admin.clients.validation.nameLength');
        }

        return null;
      },
      rootUserLastName(value: string) {
        const baseValidation = getFormValidators(t, ['lastName']).lastName(value);
        if (baseValidation) return baseValidation;
        if (value.length > 50) {
          return t('admin.clients.validation.nameLength');
        }

        return null;
      },
    },
  });

  const handleSubmit = async (values: RegisterClientRequest) => {
    await createClient(values);

    showSuccessNotification(
      t('admin.clients.clientCreated'),
      t('admin.clients.clientCreatedMessage', {
        name: values.clientName,
      }),
    );

    navigate(ROUTERS.ADMIN_CLIENTS);
  };

  const handleClientCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Force uppercase for client code
    const upperValue = event.currentTarget.value.toUpperCase();
    form.setFieldValue('clientCode', upperValue);
  };

  return (
    <Container fluid mt="xl">
      <Stack gap="xl">
        <Container fluid px="md">
          <Group justify="space-between">
            <GoBack />
          </Group>
        </Container>

        <Title order={1} ta="center">
          {t('admin.clients.createNewClient')}
        </Title>

        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            padding: '0 16px',
          }}
        >
          <Box style={{ maxWidth: '600px', width: '100%' }}>
            <Card shadow="sm" padding="xl" radius="md">
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="lg">
                  <Title order={3} mb="md">
                    {t('admin.clients.clientInformation')}
                  </Title>

                  <TextInput
                    required
                    label={t('admin.clients.clientCode')}
                    placeholder={t('admin.clients.clientCodePlaceholder')}
                    description={t('admin.clients.clientCodeDescription')}
                    leftSection={<IconBuilding size={16} />}
                    {...form.getInputProps('clientCode')}
                    onChange={handleClientCodeChange}
                  />

                  <TextInput
                    required
                    label={t('admin.clients.clientName')}
                    placeholder={t('admin.clients.clientNamePlaceholder')}
                    leftSection={<IconBuilding size={16} />}
                    {...form.getInputProps('clientName')}
                  />

                  <Title order={3} mt="md" mb="sm">
                    {t('admin.clients.rootUserInformation')}
                  </Title>

                  <Group grow>
                    <TextInput
                      required
                      label={t('admin.clients.firstName')}
                      placeholder={t('admin.clients.firstNamePlaceholder')}
                      leftSection={<IconUser size={16} />}
                      {...form.getInputProps('rootUserFirstName')}
                    />

                    <TextInput
                      required
                      label={t('admin.clients.lastName')}
                      placeholder={t('admin.clients.lastNamePlaceholder')}
                      leftSection={<IconUser size={16} />}
                      {...form.getInputProps('rootUserLastName')}
                    />
                  </Group>

                  <TextInput
                    required
                    label={t('admin.clients.email')}
                    placeholder={t('admin.clients.emailPlaceholder')}
                    leftSection={<IconMail size={16} />}
                    {...form.getInputProps('rootUserEmail')}
                  />

                  <PasswordInput
                    required
                    label={t('admin.clients.password')}
                    placeholder={t('admin.clients.passwordPlaceholder')}
                    description={t('admin.clients.passwordDescription')}
                    leftSection={<IconLock size={16} />}
                    {...form.getInputProps('rootUserPassword')}
                  />

                  <Alert icon={<IconAlertCircle size={16} />} variant="light" color="blue">
                    <Text size="sm">{t('admin.clients.createClientNotice')}</Text>
                  </Alert>

                  <Group justify="flex-end" mt="xl">
                    <Button variant="light" onClick={() => navigate(ROUTERS.ADMIN_CLIENTS)}>
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit">{t('admin.clients.createClient')}</Button>
                  </Group>
                </Stack>
              </form>
            </Card>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
