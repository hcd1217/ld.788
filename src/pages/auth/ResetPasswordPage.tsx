import {useState, useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router';
import {
  PasswordInput,
  Button,
  Paper,
  Anchor,
  Center,
  Box,
  rem,
  Stack,
  Text,
  Title,
  Transition,
  LoadingOverlay,
  Alert,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {
  IconArrowLeft,
  IconLock,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {authService} from '@/services/auth';
import {getFormValidators} from '@/utils/validation';

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';

  useEffect(() => {
    // Validate that we have both email and token
    if (!email || !token) {
      setIsValidToken(false);
      notifications.show({
        title: t('auth.invalidResetLink'),
        message: t('auth.invalidResetLinkDescription'),
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    }
  }, [email, token, t]);

  const form = useForm<ResetPasswordFormValues>({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: getFormValidators(t, ['password', 'confirmPassword']),
  });

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    if (!email || !token) {
      return;
    }

    try {
      setIsLoading(true);

      await authService.resetPassword({
        email,
        token,
        password: values.password,
      });

      setIsSubmitted(true);

      notifications.show({
        title: t('auth.passwordResetSuccess'),
        message: t('auth.passwordResetSuccessDescription'),
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      notifications.show({
        title: t('auth.passwordResetFailed'),
        message: t('auth.passwordResetFailedDescription'),
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <GuestLayout hasRegisterLink={false} title={t('auth.resetPasswordTitle')}>
        <Paper withBorder shadow="xl" p={{base: 'xl', sm: 30}} radius="md">
          <Stack gap="md" align="center" ta="center">
            <IconAlertCircle size={48} color="var(--mantine-color-red-6)" />
            <Title order={3}>{t('auth.invalidResetLink')}</Title>
            <Text size="sm" c="dimmed">
              {t('auth.invalidResetLinkDescription')}
            </Text>
            <Button
              fullWidth
              variant="light"
              mt="md"
              onClick={() => navigate('/forgot-password')}
            >
              {t('auth.requestNewLink')}
            </Button>
          </Stack>
        </Paper>
      </GuestLayout>
    );
  }

  if (isSubmitted) {
    return (
      <GuestLayout hasRegisterLink={false} title={t('auth.resetPasswordTitle')}>
        <Paper withBorder shadow="xl" p={{base: 'xl', sm: 30}} radius="md">
          <Stack gap="md" align="center" ta="center">
            <IconCheck size={48} color="var(--mantine-color-green-6)" />
            <Title order={3}>{t('auth.passwordResetSuccess')}</Title>
            <Text size="sm" c="dimmed">
              {t('auth.passwordResetSuccessDescription')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('auth.redirectingToLogin')}
            </Text>
          </Stack>
        </Paper>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout hasRegisterLink={false} title={t('auth.resetPasswordTitle')}>
      <Stack gap="xl">
        <Transition
          mounted
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

              <Stack gap="lg">
                <div>
                  <Text size="sm" c="dimmed" ta="center">
                    {t('auth.resetPasswordDescription')}
                  </Text>
                </div>

                {email ? (
                  <Alert
                    variant="light"
                    color="blue"
                    icon={<IconAlertCircle size={16} />}
                  >
                    <Text size="sm">
                      {t('auth.resettingPasswordFor', {email})}
                    </Text>
                  </Alert>
                ) : null}

                <form onSubmit={form.onSubmit(handleSubmit)}>
                  <Stack gap="md">
                    <PasswordInput
                      required
                      autoComplete="new-password"
                      label={t('auth.newPassword')}
                      placeholder={t('auth.enterNewPassword')}
                      error={form.errors.password}
                      disabled={isLoading}
                      leftSection={<IconLock size={16} />}
                      {...form.getInputProps('password')}
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
                    />

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
                      {t('auth.resetPassword')}
                    </Button>
                  </Stack>
                </form>

                <Center>
                  <Anchor
                    c="dimmed"
                    component="button"
                    size="sm"
                    type="button"
                    disabled={isLoading}
                    onClick={() => navigate('/login')}
                  >
                    <Center inline>
                      <IconArrowLeft
                        style={{width: rem(14), height: rem(14)}}
                        stroke={1.5}
                      />
                      <Box ml={5}>{t('auth.backToLogin')}</Box>
                    </Center>
                  </Anchor>
                </Center>
              </Stack>
            </Paper>
          )}
        </Transition>
      </Stack>
    </GuestLayout>
  );
}
