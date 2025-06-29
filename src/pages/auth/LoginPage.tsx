import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import {
  TextInput,
  PasswordInput,
  Checkbox,
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
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {
  IconArrowLeft,
  IconAlertCircle,
  IconMail,
  IconLock,
  IconBuilding,
} from '@tabler/icons-react';
import {useAppStore} from '@/stores/useAppStore';
import {useTranslation} from '@/hooks/useTranslation';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {getFormValidators} from '@/utils/validation';

type LoginFormValues = {
  identifier: string;
  password: string;
  clientCode: string;
  rememberMe: boolean;
};

export function LoginPage() {
  const navigate = useNavigate();
  const {login, isLoading} = useAppStore();
  const [showAlert, setShowAlert] = useState(false);
  const [mounted, setMounted] = useState(false);
  const {t} = useTranslation();
  const {clientCode} = useAppStore();
  const params = useParams();

  const form = useForm<LoginFormValues>({
    initialValues: {
      identifier: localStorage.getItem('rememberedIdentifier') ?? '',
      password: '',
      clientCode: params.clientCode ?? clientCode,
      rememberMe: Boolean(localStorage.getItem('rememberedIdentifier')),
    },
    validate: getFormValidators(t, ['identifier', 'password', 'clientCode']),
  });

  // Focus identifier input on mount and trigger mount animation
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      const emailInput = document.querySelector<HTMLInputElement>(
        'input[name="identifier"]',
      );
      emailInput?.focus();
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      // Handle remember me
      if (values.rememberMe) {
        localStorage.setItem('rememberedIdentifier', values.identifier);
      } else {
        localStorage.removeItem('rememberedIdentifier');
      }

      await login({
        identifier: values.identifier,
        password: values.password,
        clientCode: values.clientCode,
      });
      notifications.show({
        title: t('notifications.loginSuccess'),
        message: t('notifications.loginSuccessMessage'),
        color: 'green',
      });
      navigate('/dashboard');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('notifications.invalidCredentials');

      form.setErrors({
        identifier: '',
        password: '',
        clientCode: '',
      });

      setShowAlert(true);

      notifications.show({
        title: t('notifications.loginFailed'),
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    }
  };

  return (
    <GuestLayout title={t('auth.loginTitle')}>
      <Stack gap="xl">
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
                  <TextInput
                    required
                    label={t('auth.clientCode')}
                    placeholder="YOUR_COMPANY"
                    error={form.errors.clientCode}
                    disabled={isLoading}
                    leftSection={<IconBuilding size={16} />}
                    {...form.getInputProps('clientCode')}
                    onFocus={() => {
                      setShowAlert(false);
                    }}
                  />

                  <TextInput
                    required
                    autoComplete="identifier"
                    label={t('auth.identifier')}
                    placeholder={t('auth.identifier')}
                    error={form.errors.identifier}
                    disabled={isLoading}
                    leftSection={<IconMail size={16} />}
                    {...form.getInputProps('identifier')}
                    onFocus={() => {
                      setShowAlert(false);
                    }}
                  />

                  <PasswordInput
                    required
                    autoComplete="current-password"
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

                  <Transition
                    mounted={
                      showAlert
                        ? Boolean(
                            form.errors.identifier && form.errors.password,
                          )
                        : false
                    }
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
                        {t('notifications.invalidCredentials')}
                      </Alert>
                    )}
                  </Transition>

                  <Group justify="space-between">
                    <Checkbox
                      label={t('auth.rememberMe')}
                      disabled={isLoading}
                      {...form.getInputProps('rememberMe', {
                        type: 'checkbox',
                      })}
                    />
                    <Anchor
                      component="button"
                      type="button"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => navigate('/forgot-password')}
                    >
                      {t('auth.forgotPassword')}
                    </Anchor>
                  </Group>

                  <Button
                    fullWidth
                    loading={isLoading}
                    type="submit"
                    size="md"
                    disabled={!form.isValid() && form.isTouched()}
                    styles={{
                      root: {
                        transition: 'all 0.2s ease',
                        height: rem(42),
                      },
                    }}
                    mt="xs"
                  >
                    {t('auth.signIn')}
                  </Button>
                </Stack>
              </form>

              <Center mt="md">
                <Anchor
                  c="dimmed"
                  component="button"
                  size="xs"
                  type="button"
                  disabled={isLoading}
                  onClick={() => navigate('/')}
                >
                  <Center inline>
                    <IconArrowLeft
                      style={{width: rem(12), height: rem(12)}}
                      stroke={1.5}
                    />
                    <Box ml={5}>{t('auth.backToHome')}</Box>
                  </Center>
                </Anchor>
              </Center>
            </Paper>
          )}
        </Transition>
      </Stack>
    </GuestLayout>
  );
}
