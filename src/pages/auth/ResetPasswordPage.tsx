import {useState, useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router';
import {
  Anchor,
  Center,
  Stack,
  Text,
  Title,
  Group,
  Space,
  Button,
  PasswordInput,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {IconAlertCircle, IconCheck} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {authService} from '@/services/auth';
import {getFormValidators} from '@/utils/validation';
import {FormContainer} from '@/components/form/FormContainer';
import {Logo} from '@/components/common/Logo';

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
    const invalidTokenContent = (
      <>
        <Group justify="center" gap="md" mb="lg">
          <Logo />
          <Title
            style={{
              fontWeight: 900,
            }}
            size="h2"
          >
            Credo
          </Title>
        </Group>
        <Stack gap="md" align="center" ta="center">
          <IconAlertCircle size={48} color="var(--mantine-color-red-6)" />
          <Title order={3}>{t('auth.invalidResetLink')}</Title>
          <Text size="sm" c="dimmed">
            {t('auth.invalidResetLinkDescription')}
          </Text>
          <Button
            variant="light"
            type="button"
            onClick={() => navigate('/forgot-password')}
          >
            {t('auth.requestNewLink')}
          </Button>
        </Stack>
      </>
    );

    return (
      <GuestLayout>
        <FormContainer mounted isLoading={false}>
          {invalidTokenContent}
        </FormContainer>
      </GuestLayout>
    );
  }

  if (isSubmitted) {
    const successContent = (
      <>
        <Group justify="center" gap="md" mb="lg">
          <Logo />
          <Title
            style={{
              fontWeight: 900,
            }}
            size="h2"
          >
            Credo
          </Title>
        </Group>
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
      </>
    );

    return (
      <GuestLayout>
        <FormContainer mounted isLoading={false}>
          {successContent}
        </FormContainer>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <FormContainer mounted isLoading={isLoading}>
        <Group justify="center" gap="md" mb="lg">
          <Logo />
          <Title
            style={{
              fontWeight: 900,
            }}
            size="h2"
          >
            Credo
          </Title>
        </Group>

        <Space h="lg" />

        <Text size="sm" c="dimmed" ta="center" mb="lg">
          {t('auth.resetPasswordDescription')}
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            <PasswordInput
              required
              variant="auth-form"
              autoComplete="new-password"
              placeholder={t('auth.enterNewPassword')}
              error={form.errors.password}
              disabled={isLoading}
              {...form.getInputProps('password')}
            />

            <PasswordInput
              required
              variant="auth-form"
              autoComplete="new-password"
              placeholder={t('auth.confirmYourPassword')}
              error={form.errors.confirmPassword}
              disabled={isLoading}
              {...form.getInputProps('confirmPassword')}
            />

            <Button
              type="submit"
              variant="auth-form"
              disabled={!form.isValid() && form.isTouched()}
            >
              {t('auth.resetPassword')}
            </Button>
          </Stack>
        </form>

        <Center mt="lg">
          <Text size="sm" ta="center" mt="lg" c="dimmed">
            <Anchor href="/forgot-password" size="sm" fw="600">
              {t('auth.backToForgotPassword')}
            </Anchor>
          </Text>
        </Center>
      </FormContainer>
    </GuestLayout>
  );
}
