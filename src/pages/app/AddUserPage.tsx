import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import {
  TextInput,
  Button,
  Paper,
  Group,
  Anchor,
  Center,
  Box,
  rem,
  Stack,
  Alert,
  Transition,
  LoadingOverlay,
  Container,
  Title,
  PasswordInput,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {
  IconArrowLeft,
  IconAlertCircle,
  IconMail,
  IconUser,
  IconAt,
  IconUserPlus,
  IconLock,
} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {getFormValidators} from '@/utils/validation';
import {clientService} from '@/services/client';

type AddUserFormValues = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
};

export function AddUserPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [mounted, setMounted] = useState(false);
  const {t} = useTranslation();

  const form = useForm<AddUserFormValues>({
    initialValues: import.meta.env.DEV
      ? {
          email: 'test@test.com',
          username: 'test-user',
          firstName: 'Test',
          lastName: 'Test',
          password: 'Secret@123',
          confirmPassword: 'Secret@123',
        }
      : {
          email: '',
          username: '',
          firstName: '',
          lastName: '',
          password: '',
          confirmPassword: '',
        },
    validate: getFormValidators(t, [
      'firstName',
      'lastName',
      'email',
      'username',
      'password',
      'confirmPassword',
    ]),
  });

  // Focus email input on mount and trigger mount animation
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      const emailInput = document.querySelector<HTMLInputElement>(
        'input[name="email"]',
      );
      emailInput?.focus();
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (values: AddUserFormValues) => {
    try {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      await clientService.registerUserByRootUser({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
      });

      notifications.show({
        title: t('auth.userAdded'),
        message: `User ${values.email} added successfully`,
        color: 'green',
        icon: <IconUserPlus size={16} />,
      });

      // Reset form
      form.reset();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('auth.addUserFailed');

      form.setErrors({
        email: '',
        username: '',
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

  return (
    <Container size="sm" mt="xl">
      <Stack gap="xl">
        <Group>
          <Anchor
            component="button"
            type="button"
            size="sm"
            onClick={() => navigate('/more')}
          >
            <Center inline>
              <IconArrowLeft
                style={{width: rem(12), height: rem(12)}}
                stroke={1.5}
              />
              <Box ml={5}>{t('common.backToPreviousPage')}</Box>
            </Center>
          </Anchor>
        </Group>

        <Title order={1} ta="center">
          {t('auth.addUserTitle')}
        </Title>

        <Transition
          mounted={mounted}
          transition="slide-up"
          duration={400}
          timingFunction="ease"
        >
          {(styles) => (
            <Paper
              withBorder
              shadow="xl"
              p={{base: 'xl', sm: 30}}
              radius="md"
              style={{
                ...styles,
                position: 'relative',
              }}
            >
              <LoadingOverlay
                visible={isLoading}
                overlayProps={{blur: 2}}
                transitionProps={{duration: 300}}
              />
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                  <Group grow>
                    <TextInput
                      required
                      label={t('auth.firstName')}
                      placeholder={t('auth.firstNamePlaceholder')}
                      error={form.errors.firstName}
                      disabled={isLoading}
                      leftSection={<IconUser size={16} />}
                      {...form.getInputProps('firstName')}
                      onFocus={() => {
                        setShowAlert(false);
                      }}
                    />

                    <TextInput
                      required
                      label={t('auth.lastName')}
                      placeholder={t('auth.lastNamePlaceholder')}
                      error={form.errors.lastName}
                      disabled={isLoading}
                      leftSection={<IconUser size={16} />}
                      {...form.getInputProps('lastName')}
                      onFocus={() => {
                        setShowAlert(false);
                      }}
                    />
                  </Group>

                  <TextInput
                    required
                    autoComplete="email"
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
                    label={t('auth.username')}
                    placeholder="username"
                    error={form.errors.username}
                    disabled={isLoading}
                    leftSection={<IconAt size={16} />}
                    {...form.getInputProps('username')}
                    onFocus={() => {
                      setShowAlert(false);
                    }}
                  />

                  <PasswordInput
                    required
                    autoComplete="new-password"
                    label={t('auth.password')}
                    placeholder={t('auth.password').toLowerCase()}
                    error={form.errors.password}
                    disabled={isLoading}
                    leftSection={<IconLock size={16} />}
                    {...form.getInputProps('password')}
                    onFocus={() => {
                      setShowAlert(false);
                    }}
                  />

                  <PasswordInput
                    required
                    autoComplete="new-password"
                    label={t('auth.confirmPassword')}
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
                        Please check the form for errors
                      </Alert>
                    )}
                  </Transition>

                  <Button
                    fullWidth
                    loading={isLoading}
                    type="submit"
                    size="md"
                    disabled={!form.isValid() && form.isTouched()}
                    leftSection={<IconUserPlus size={16} />}
                    styles={{
                      root: {
                        transition: 'all 0.2s ease',
                        height: rem(42),
                      },
                    }}
                    mt="xs"
                  >
                    {t('auth.addUser')}
                  </Button>
                </Stack>
              </form>
            </Paper>
          )}
        </Transition>
      </Stack>
    </Container>
  );
}
