import {useState} from 'react';
import {Navigate, useNavigate} from 'react-router';
import {
  Button,
  Group,
  Stack,
  Alert,
  Transition,
  LoadingOverlay,
  Container,
  Title,
  TextInput,
  PasswordInput,
  Box,
  Card,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {
  IconAlertCircle,
  IconUserPlus,
  IconFileSpreadsheet,
} from '@tabler/icons-react';
import useIsDarkMode from '@/hooks/useIsDarkMode';
import useTranslation from '@/hooks/useTranslation';
import {
  getFormValidators,
  validateIdentifier,
  validateEmail,
} from '@/utils/validation';
import {clientService} from '@/services/client';
import {FirstNameAndLastNameInForm} from '@/components/form/FirstNameAndLastNameInForm';
import {useAppStore} from '@/stores/useAppStore';
import {GoBack} from '@/components/common';
import {isDevelopment} from '@/utils/env';

type AddUserFormValues = {
  email?: string;
  userName?: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
};

export function AddUserPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const {t} = useTranslation();
  const {user} = useAppStore();
  const isDarkMode = useIsDarkMode();

  const form = useForm<AddUserFormValues>({
    initialValues: isDevelopment
      ? {
          email: 'test@test.com',
          userName: 'test-user',
          firstName: 'Test',
          lastName: 'Test',
          password: 'Secret@123',
          confirmPassword: 'Secret@123',
        }
      : {
          email: '',
          userName: '',
          firstName: '',
          lastName: '',
          password: '',
          confirmPassword: '',
        },
    validate: {
      ...getFormValidators(t, [
        'firstName',
        'lastName',
        'password',
        'confirmPassword',
      ]),
      email(value?: string) {
        if (!value) {
          return undefined;
        }

        return validateEmail(value, t);
      },
      userName(value?: string) {
        if (!value) {
          if (form.values.email) {
            return undefined;
          }

          return t('validation.emailOrUserNameRequired');
        }

        return validateIdentifier(value, t);
      },
    },
  });

  const handleSubmit = async (values: AddUserFormValues) => {
    try {
      setIsLoading(true);

      await clientService.registerUserByRootUser({
        email: values.email,
        userName: values.userName,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });

      notifications.show({
        title: t('auth.userAdded'),
        message: `User ${values.email} added successfully`,
        color: isDarkMode ? 'green.7' : 'green.9',
        icon: <IconUserPlus size={16} />,
      });

      // Reset form
      form.reset();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('auth.addUserFailed');

      form.setErrors({
        email: '',
        userName: '',
        role: '',
        firstName: '',
        lastName: '',
      });

      setShowAlert(true);

      notifications.show({
        title: t('auth.addUserFailed'),
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.isRoot) {
    return <Navigate to="/home" />;
  }

  return (
    <Container fluid mt="xl">
      <Stack gap="xl">
        <Container size="xl" px="md">
          <Group justify="space-between">
            <GoBack />

            {/* Import Users Button - Hidden on mobile */}
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
          </Group>
        </Container>

        <Title order={1} ta="center">
          {t('auth.addUserTitle')}
        </Title>

        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            padding: '0 16px',
          }}
        >
          <Box style={{maxWidth: '600px', width: '100%'}}>
            <Transition
              mounted
              transition="slide-up"
              duration={400}
              timingFunction="ease"
            >
              {() => (
                <Card shadow="sm" padding="xl" radius="md">
                  <LoadingOverlay
                    visible={isLoading}
                    overlayProps={{blur: 2}}
                    transitionProps={{duration: 300}}
                  />
                  <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="lg">
                      <FirstNameAndLastNameInForm
                        form={form}
                        isLoading={isLoading}
                        setShowAlert={setShowAlert}
                      />

                      <TextInput
                        type="email"
                        autoComplete="email"
                        placeholder={t('auth.email')}
                        error={form.errors.email}
                        disabled={isLoading}
                        {...form.getInputProps('email')}
                        onFocus={() => {
                          setShowAlert(false);
                        }}
                      />

                      <TextInput
                        placeholder={t('auth.userName')}
                        error={form.errors.userName}
                        disabled={isLoading}
                        {...form.getInputProps('userName')}
                        onFocus={() => {
                          setShowAlert(false);
                        }}
                      />

                      <PasswordInput
                        required
                        autoComplete="new-password"
                        placeholder={t('auth.password')}
                        error={form.errors.password}
                        disabled={isLoading}
                        {...form.getInputProps('password')}
                        onFocus={() => {
                          setShowAlert(false);
                        }}
                      />

                      <PasswordInput
                        required
                        autoComplete="new-password"
                        placeholder={t('auth.confirmPassword')}
                        error={form.errors.confirmPassword}
                        disabled={isLoading}
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
                            Please check the form for errors
                          </Alert>
                        )}
                      </Transition>

                      <Button type="submit">{t('auth.addUser')}</Button>
                    </Stack>
                  </form>
                </Card>
              )}
            </Transition>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
