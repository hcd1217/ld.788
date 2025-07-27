import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router';
import {
  Group,
  Anchor,
  Stack,
  Space,
  Button,
  TextInput,
  PasswordInput,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {useAppStore} from '@/stores/useAppStore';
import useTranslation from '@/hooks/useTranslation';
import {useAuthForm} from '@/hooks/useAuthForm';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {getFormValidators} from '@/utils/validation';
import {FormContainer} from '@/components/form/FormContainer';
import {AuthHeader, AuthAlert, AuthFormLink} from '@/components/auth';
import {useClientCode} from '@/hooks/useClientCode';
import {isDevelopment} from '@/utils/env';

type LoginFormValues = {
  identifier: string;
  password: string;
  clientCode: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {login} = useAppStore();
  const [mounted, setMounted] = useState(false);
  const {t} = useTranslation();

  // Extract client-code from URL query params
  const clientCodeFromUrl = searchParams.get('client-code');

  // Use client code from URL if available, otherwise use default
  const defaultClientCode = useClientCode();
  const clientCode = clientCodeFromUrl ?? defaultClientCode;

  // Update localStorage if client-code is provided in URL
  useEffect(() => {
    if (clientCodeFromUrl && clientCodeFromUrl !== defaultClientCode) {
      localStorage.setItem('clientCode', clientCodeFromUrl);
      console.log('reload the page without search params', clientCodeFromUrl);
      // Reload the page without search params
      navigate(`/login`, {replace: true});
    }
  }, [navigate, defaultClientCode, clientCodeFromUrl]);

  const form = useForm<LoginFormValues>({
    initialValues: {
      identifier:
        (isDevelopment ? 'admin' : '') ||
        localStorage.getItem('rememberedIdentifier') ||
        '',
      password: isDevelopment
        ? (localStorage.getItem('__PASSWORD__') ?? '')
        : '',
      clientCode,
    },
    validate: getFormValidators(t, ['identifier', 'password', 'clientCode']),
  });

  const {isLoading, showAlert, clearErrors, handleSubmit} = useAuthForm(form, {
    successTitle: t('notifications.loginSuccess'),
    successMessage: t('notifications.loginSuccessMessage'),
    errorTitle: t('notifications.loginFailed'),
    onSuccess: () => navigate('/home'),
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

  const onSubmit = handleSubmit(async (values: LoginFormValues) => {
    localStorage.setItem('rememberedIdentifier', values.identifier);
    await login({
      identifier: values.identifier,
      password: values.password,
      clientCode: values.clientCode,
    });
  });

  return (
    <GuestLayout>
      <FormContainer isLoading={isLoading} mounted={mounted}>
        <AuthHeader title={t('auth.title')} />
        <Space h="lg" />
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack gap="lg">
            <TextInput
              required
              type="text"
              autoComplete="identifier"
              placeholder={t('auth.identifier')}
              error={form.errors.identifier}
              disabled={isLoading}
              {...form.getInputProps('identifier')}
              onFocus={clearErrors}
            />

            <PasswordInput
              required
              autoComplete="current-password"
              placeholder={t('auth.password')}
              error={form.errors.password}
              disabled={isLoading}
              {...form.getInputProps('password')}
              onFocus={clearErrors}
            />

            <AuthAlert
              show={
                showAlert
                  ? Boolean(form.errors.identifier && form.errors.password)
                  : false
              }
              message={t('notifications.invalidCredentials')}
              onClose={clearErrors}
            />

            <Group justify="flex-end">
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

            <Button variant="auth-form" type="submit">
              {t('auth.signIn')}
            </Button>
          </Stack>
        </form>

        <AuthFormLink
          text={t('auth.noAccount')}
          linkText={t('auth.createAccount')}
          href="/register"
        />
      </FormContainer>
    </GuestLayout>
  );
}
