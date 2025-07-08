import {useState, useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router';
import {
  Anchor,
  Center,
  Box,
  rem,
  Stack,
  Text,
  Title,
  Alert,
  Group,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {IconArrowLeft, IconAlertCircle, IconCheck} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {authService} from '@/services/auth';
import {getFormValidators} from '@/utils/validation';
import {AuthFormContainer} from '@/components/auth/AuthFormContainer';
import {AuthFormInput} from '@/components/auth/AuthFormInput';
import {AuthFormButton} from '@/components/auth/AuthFormButton';
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
            {t('auth.resetPasswordTitle')}
          </Title>
        </Group>
        <Stack gap="md" align="center" ta="center">
          <IconAlertCircle size={48} color="var(--mantine-color-red-6)" />
          <Title order={3}>{t('auth.invalidResetLink')}</Title>
          <Text size="sm" c="dimmed">
            {t('auth.invalidResetLinkDescription')}
          </Text>
          <AuthFormButton
            variant="light"
            type="button"
            onClick={() => navigate('/forgot-password')}
          >
            {t('auth.requestNewLink')}
          </AuthFormButton>
        </Stack>
      </>
    );

    return (
      <GuestLayout>
        <AuthFormContainer mounted isLoading={false}>
          {invalidTokenContent}
        </AuthFormContainer>
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
            {t('auth.resetPasswordTitle')}
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
        <AuthFormContainer mounted isLoading={false}>
          {successContent}
        </AuthFormContainer>
      </GuestLayout>
    );
  }

  const content = (
    <>
      <Group justify="center" gap="md" mb="lg">
        <Logo />
        <Title
          style={{
            fontWeight: 900,
          }}
          size="h2"
        >
          {t('auth.resetPasswordTitle')}
        </Title>
      </Group>

      <Text size="sm" c="dimmed" ta="center" mb="lg">
        {t('auth.resetPasswordDescription')}
      </Text>

      {email ? (
        <Alert
          variant="light"
          color="blue"
          icon={<IconAlertCircle size={16} />}
          mb="lg"
        >
          <Text size="sm">{t('auth.resettingPasswordFor', {email})}</Text>
        </Alert>
      ) : null}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <AuthFormInput
            required
            type="password"
            autoComplete="new-password"
            placeholder={t('auth.enterNewPassword')}
            error={form.errors.password}
            disabled={isLoading}
            {...form.getInputProps('password')}
          />

          <AuthFormInput
            required
            type="password"
            autoComplete="new-password"
            placeholder={t('auth.confirmYourPassword')}
            error={form.errors.confirmPassword}
            disabled={isLoading}
            {...form.getInputProps('confirmPassword')}
          />

          <AuthFormButton
            loading={isLoading}
            type="submit"
            disabled={!form.isValid() && form.isTouched()}
          >
            {t('auth.resetPassword')}
          </AuthFormButton>
        </Stack>
      </form>

      <Center mt="lg">
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
    </>
  );

  return (
    <GuestLayout>
      <AuthFormContainer mounted isLoading={isLoading}>
        {content}
      </AuthFormContainer>
    </GuestLayout>
  );
}
