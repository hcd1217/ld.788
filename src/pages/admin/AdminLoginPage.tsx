import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import {
  Stack,
  Space,
  Button,
  PasswordInput,
  Title,
  Text,
  Alert,
} from '@mantine/core';
import {IconAlertCircle, IconShieldCheck} from '@tabler/icons-react';
import {useForm} from '@mantine/form';
import {useAppStore} from '@/stores/useAppStore';
import useTranslation from '@/hooks/useTranslation';
import {useAuthForm} from '@/hooks/useAuthForm';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {FormContainer} from '@/components/form/FormContainer';
import {AuthAlert} from '@/components/auth';
import {isDevelopment} from '@/utils/env';
import {ROUTERS} from '@/config/routeConfig';

type AdminLoginFormValues = {
  accessKey: string;
};

export function AdminLoginPage() {
  const navigate = useNavigate();
  const {adminLogin, adminAuthenticated} = useAppStore();
  const [mounted, setMounted] = useState(false);
  const {t} = useTranslation();

  const form = useForm<AdminLoginFormValues>({
    initialValues: isDevelopment
      ? {
          accessKey: localStorage.getItem('__ACCESSKEY__') ?? '',
        }
      : {
          accessKey: '',
        },
    validate: {
      accessKey: (value) =>
        value.trim().length === 0 ? t('validation.fieldRequired') : null,
    },
  });

  const {isLoading, showAlert, clearErrors, handleSubmit} = useAuthForm(form, {
    successTitle: t('admin.loginSuccess'),
    successMessage: t('admin.loginSuccessMessage'),
    errorTitle: t('admin.loginFailed'),
    onSuccess: () => navigate(ROUTERS.ADMIN_DASHBOARD),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (adminAuthenticated) {
      navigate(ROUTERS.ADMIN_DASHBOARD);
    }
  }, [adminAuthenticated, navigate]);

  // Focus input on mount
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(
        'input[name="accessKey"]',
      );
      input?.focus();
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const onSubmit = handleSubmit(async (values: AdminLoginFormValues) => {
    await adminLogin(values.accessKey);
  });

  return (
    <GuestLayout>
      <FormContainer isLoading={isLoading} mounted={mounted}>
        <Stack align="center" mb="xl">
          <IconShieldCheck size={48} stroke={1.5} />
          <Title order={2} ta="center">
            {t('admin.title')}
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            {t('admin.subtitle')}
          </Text>
        </Stack>

        <Space h="lg" />

        <form autoComplete="off" onSubmit={form.onSubmit(onSubmit)}>
          <Stack gap="lg">
            {/* Hidden username field to prevent Chrome password save */}
            <input
              type="text"
              name="username"
              autoComplete="username"
              style={{display: 'none'}}
              aria-hidden="true"
              tabIndex={-1}
            />
            <PasswordInput
              required
              name="accessKey"
              placeholder={t('admin.accessKeyPlaceholder')}
              error={form.errors.accessKey}
              disabled={isLoading}
              autoComplete="one-time-code"
              {...form.getInputProps('accessKey')}
              onFocus={clearErrors}
            />

            <AuthAlert
              show={showAlert ? Boolean(form.errors.accessKey) : false}
              message={t('admin.invalidAccessKey')}
              onClose={clearErrors}
            />

            <Alert
              icon={<IconAlertCircle size={16} />}
              variant="light"
              color="blue"
            >
              {t('admin.securityNotice')}
            </Alert>

            <Button
              fullWidth
              variant="filled"
              type="submit"
              disabled={isLoading}
            >
              {t('admin.signIn')}
            </Button>
          </Stack>
        </form>
      </FormContainer>
    </GuestLayout>
  );
}
