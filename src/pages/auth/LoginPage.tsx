import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import {
  Group,
  Anchor,
  Stack,
  Alert,
  Transition,
  Title,
  Text,
  Space,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {IconAlertCircle} from '@tabler/icons-react';
import {useAppStore} from '@/stores/useAppStore';
import {useTranslation} from '@/hooks/useTranslation';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {getFormValidators} from '@/utils/validation';
import {Logo} from '@/components/common/Logo';
import {FormContainer} from '@/components/form/FormContainer';
import {FormInput} from '@/components/form/FormInput';
import {FormButton} from '@/components/form/FormButton';
import {useClientCode} from '@/hooks/useClientCode';

type LoginFormValues = {
  identifier: string;
  password: string;
  clientCode: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const {login, isLoading} = useAppStore();
  const [showAlert, setShowAlert] = useState(false);
  const [mounted, setMounted] = useState(false);
  const {t} = useTranslation();
  const clientCode = useClientCode();

  const form = useForm<LoginFormValues>({
    initialValues: {
      identifier: localStorage.getItem('rememberedIdentifier') ?? '',
      password: '',
      clientCode,
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
      // Always remember the identifier
      localStorage.setItem('rememberedIdentifier', values.identifier);

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
      navigate('/home');
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
    <GuestLayout>
      <FormContainer isLoading={isLoading} mounted={mounted}>
        <Group justify="center" gap="md" mb="lg">
          <Logo />
          <Title
            style={{
              fontWeight: 900,
            }}
            size="h2"
          >
            {t('auth.title')}
          </Title>
        </Group>
        <Space h="lg" />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            <FormInput
              required
              type="text"
              autoComplete="identifier"
              placeholder={t('auth.identifier')}
              error={form.errors.identifier}
              disabled={isLoading}
              {...form.getInputProps('identifier')}
              onFocus={() => {
                setShowAlert(false);
              }}
            />

            <FormInput
              required
              type="password"
              autoComplete="current-password"
              placeholder={t('auth.password')}
              error={form.errors.password}
              disabled={isLoading}
              {...form.getInputProps('password')}
              onFocus={() => {
                setShowAlert(false);
              }}
            />

            <Transition
              mounted={
                showAlert
                  ? Boolean(form.errors.identifier && form.errors.password)
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

            <FormButton type="submit">
              {t('auth.signIn')}
            </FormButton>
          </Stack>
        </form>

        <Text size="sm" ta="center" mt="lg" c="dimmed">
          {t('auth.noAccount')}{' '}
          <Anchor href="/register" size="sm" fw="600">
            {t('auth.createAccount')}
          </Anchor>
        </Text>
      </FormContainer>
    </GuestLayout>
  );
}
