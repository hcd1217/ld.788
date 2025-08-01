import {useState, useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router';
import {Stack, Text, Space, Button, PasswordInput} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {IconAlertCircle, IconCheck} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {useAuthForm} from '@/hooks/useAuthForm';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {authService} from '@/services/auth';
import {getFormValidators} from '@/utils/validation';
import {FormContainer} from '@/components/form/FormContainer';
import {AuthHeader, AuthFormLink, AuthSuccessState} from '@/components/auth';
import {ROUTERS} from '@/config/routeConfig';

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {t} = useTranslation();
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

  const {isLoading, handleSubmit} = useAuthForm(form, {
    successTitle: t('auth.passwordResetSuccess'),
    successMessage: t('auth.passwordResetSuccessDescription'),
    errorTitle: t('auth.passwordResetFailed'),
    onSuccess() {
      setIsSubmitted(true);
      setTimeout(() => navigate(ROUTERS.LOGIN), 3000);
    },
  });

  const onSubmit = handleSubmit(async (values: ResetPasswordFormValues) => {
    if (!email || !token) {
      throw new Error(t('auth.invalidResetLink'));
    }

    await authService.resetPassword({
      email,
      token,
      password: values.password,
    });
  });

  if (!isValidToken) {
    return (
      <GuestLayout>
        <FormContainer mounted isLoading={false}>
          <AuthSuccessState
            icon={
              <IconAlertCircle size={48} color="var(--mantine-color-red-6)" />
            }
            title={t('auth.invalidResetLink')}
            description={t('auth.invalidResetLinkDescription')}
            buttonText={t('auth.requestNewLink')}
            onButtonClick={() => navigate(ROUTERS.FORGOT_PASSWORD)}
          />
        </FormContainer>
      </GuestLayout>
    );
  }

  if (isSubmitted) {
    return (
      <GuestLayout>
        <FormContainer mounted isLoading={false}>
          <AuthSuccessState
            icon={<IconCheck size={48} color="var(--mantine-color-green-6)" />}
            title={t('auth.passwordResetSuccess')}
            description={t('auth.passwordResetSuccessDescription')}
            subDescription={t('auth.redirectingToLogin')}
            buttonText={t('auth.backToLogin')}
            onButtonClick={() => navigate(ROUTERS.LOGIN)}
          />
        </FormContainer>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <FormContainer mounted isLoading={isLoading}>
        <AuthHeader />
        <Space h="lg" />
        <Text size="sm" c="dimmed" ta="center" mb="lg">
          {t('auth.resetPasswordDescription')}
        </Text>

        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack gap="lg">
            <PasswordInput
              required
              autoComplete="new-password"
              placeholder={t('auth.enterNewPassword')}
              error={form.errors.password}
              disabled={isLoading}
              {...form.getInputProps('password')}
            />

            <PasswordInput
              required
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

        <AuthFormLink
          text=""
          linkText={t('auth.backToForgotPassword')}
          href={ROUTERS.FORGOT_PASSWORD}
        />
      </FormContainer>
    </GuestLayout>
  );
}
