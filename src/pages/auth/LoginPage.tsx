import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Group,
  Anchor,
  Stack,
  Space,
  Button,
  TextInput,
  PasswordInput,
  Divider,
  Text,
} from '@mantine/core';
import { IconQrcode } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useAppStore } from '@/stores/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthForm } from '@/hooks/useAuthForm';
import { GuestLayout } from '@/components/layouts/GuestLayout';
import { getFormValidators } from '@/utils/validation';
import { FormContainer } from '@/components/form/FormContainer';
import { AuthHeader, AuthAlert, AuthFormLink } from '@/components/auth';
import { useClientCode } from '@/hooks/useClientCode';
import { isDevelopment } from '@/utils/env';
import { ROUTERS } from '@/config/routeConfig';
import { useOnce } from '@/hooks/useOnce';
import { logInfo } from '@/utils/logger';

type LoginFormValues = {
  identifier: string;
  password: string;
  clientCode: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();
  const clientCode = useClientCode();

  // Update localStorage if client-code is provided in URL
  useOnce(() => {
    // Extract client-code from URL query params
    const clientCodeFromUrl = searchParams.get('client-code');
    logInfo('clientCodeFromUrl', {
      module: 'LoginPagePage',
      action: 'LoginPage',
    });

    // Use client code from URL if available
    if (clientCodeFromUrl && clientCodeFromUrl !== clientCode) {
      localStorage.setItem('clientCode', clientCodeFromUrl);
    }

    if (clientCodeFromUrl) {
      // Reload the page without search params
      navigate(ROUTERS.LOGIN, { replace: true });
    }
  });

  const form = useForm<LoginFormValues>({
    initialValues: {
      identifier:
        (isDevelopment ? 'admin' : '') || localStorage.getItem('rememberedIdentifier') || '',
      password: isDevelopment ? (localStorage.getItem('__PASSWORD__') ?? '') : '',
      clientCode,
    },
    validate: getFormValidators(t, ['identifier', 'password', 'clientCode']),
  });

  const { isLoading, showAlert, clearErrors, handleSubmit } = useAuthForm(form, {
    successTitle: t('notifications.loginSuccess'),
    successMessage: t('notifications.loginSuccessMessage'),
    errorTitle: t('notifications.loginFailed'),
    onSuccess: () => navigate(ROUTERS.HOME),
  });

  // Focus identifier input on mount and trigger mount animation
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      const emailInput = document.querySelector<HTMLInputElement>('input[name="identifier"]');
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
              show={showAlert ? Boolean(form.errors.identifier && form.errors.password) : false}
              message={t('notifications.invalidCredentials')}
              onClose={clearErrors}
            />

            <Group justify="flex-end">
              <Anchor
                component="button"
                type="button"
                size="sm"
                disabled={isLoading}
                onClick={() => navigate(ROUTERS.FORGOT_PASSWORD)}
              >
                {t('auth.forgotPassword')}
              </Anchor>
            </Group>

            <Button variant="auth-form" type="submit">
              {t('auth.signIn')}
            </Button>
          </Stack>
        </form>

        <Stack gap="md" mt="xl">
          <Divider
            label={
              <Text size="sm" c="dimmed">
                {t('auth.magicLink.or')}
              </Text>
            }
            labelPosition="center"
          />

          <Button
            variant="default"
            fullWidth
            leftSection={<IconQrcode size={20} />}
            onClick={() => navigate(ROUTERS.MAGIC_LINK)}
            disabled={isLoading}
          >
            {t('auth.magicLink.useMagicLink')}
          </Button>
        </Stack>

        <AuthFormLink
          text={t('auth.noAccount')}
          linkText={t('auth.createAccount')}
          href={ROUTERS.REGISTER}
        />
      </FormContainer>
    </GuestLayout>
  );
}
