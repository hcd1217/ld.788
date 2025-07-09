import {useEffect, useState, useMemo, useCallback} from 'react';
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
import {showAuthNotifications} from '@/utils/notifications';
import {
  useAuthStore,
  useFormStore,
  useAppConfigStore,
} from '@/stores/useAppStore';
import {useTranslation} from '@/hooks/useTranslation';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {getFormValidators} from '@/utils/validation';
import {useFocusManagement} from '@/hooks/useFocusManagement';
import {Logo} from '@/components/common/Logo';
import {FormContainer} from '@/components/form/FormContainer';
import {FormInput} from '@/components/form/FormInput';
import {FormButton} from '@/components/form/FormButton';
import {LazyIcon} from '@/components/lazy/LazyIcon';
import {useClientCode} from '@/hooks/useClientCode';

type LoginFormValues = {
  identifier: string;
  password: string;
  clientCode: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isLoading = useFormStore((state) => state.isLoading);
  const setLoading = useFormStore((state) => state.setLoading);
  const setClientCode = useAppConfigStore((state) => state.setClientCode);
  const [showAlert, setShowAlert] = useState(false);
  const [mounted, setMounted] = useState(false);
  const {t} = useTranslation();
  const clientCode = useClientCode();

  // Memoized translation strings to prevent re-computation
  const translationStrings = useMemo(
    () => ({
      title: t('auth.title'),
      identifier: t('auth.identifier'),
      password: t('auth.password'),
      signIn: t('auth.signIn'),
      forgotPassword: t('auth.forgotPassword'),
      noAccount: t('auth.noAccount'),
      createAccount: t('auth.createAccount'),
      loginSuccess: t('notifications.loginSuccess'),
      loginSuccessMessage: t('notifications.loginSuccessMessage'),
      loginFailed: t('notifications.loginFailed'),
      invalidCredentials: t('notifications.invalidCredentials'),
    }),
    [t],
  );

  // Memoized form validators
  const validators = useMemo(() => {
    return getFormValidators(t, ['identifier', 'password', 'clientCode']);
  }, [t]);

  // Optimized focus management
  useFocusManagement('input[name="identifier"]', 300);

  const form = useForm<LoginFormValues>({
    initialValues: {
      identifier: localStorage.getItem('rememberedIdentifier') ?? '',
      password: '',
      clientCode,
    },
    validate: validators,
  });

  // Mount animation trigger
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleSubmit = useCallback(
    async (values: LoginFormValues) => {
      setLoading(true);
      try {
        // Always remember the identifier
        localStorage.setItem('rememberedIdentifier', values.identifier);

        await login({
          identifier: values.identifier,
          password: values.password,
          clientCode: values.clientCode,
        });
        setClientCode(values.clientCode);
        showAuthNotifications.loginSuccess(
          translationStrings.loginSuccess,
          translationStrings.loginSuccessMessage,
        );
        navigate('/home');
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : translationStrings.invalidCredentials;

        form.setErrors({
          identifier: '',
          password: '',
          clientCode: '',
        });

        setShowAlert(true);

        showAuthNotifications.loginFailed(
          translationStrings.loginFailed,
          errorMessage,
          <LazyIcon name="IconAlertCircle" size={16} />,
        );
      } finally {
        setLoading(false);
      }
    },
    [login, navigate, form, translationStrings, setLoading, setClientCode],
  );

  const handleFocus = useCallback(() => {
    setShowAlert(false);
  }, []);

  const handleForgotPassword = useCallback(() => {
    navigate('/forgot-password');
  }, [navigate]);

  const handleAlertClose = useCallback(() => {
    setShowAlert(false);
  }, []);

  // Memoized alert condition
  const shouldShowAlert = useMemo(() => {
    return showAlert && Boolean(form.errors.identifier && form.errors.password);
  }, [showAlert, form.errors.identifier, form.errors.password]);

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
            {translationStrings.title}
          </Title>
        </Group>
        <Space h="lg" />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            <FormInput
              required
              type="text"
              name="identifier"
              autoComplete="identifier"
              placeholder={translationStrings.identifier}
              error={form.errors.identifier}
              disabled={isLoading}
              {...form.getInputProps('identifier')}
              onFocus={handleFocus}
            />

            <FormInput
              required
              type="password"
              autoComplete="current-password"
              placeholder={translationStrings.password}
              error={form.errors.password}
              disabled={isLoading}
              {...form.getInputProps('password')}
              onFocus={handleFocus}
            />

            <Transition
              mounted={shouldShowAlert}
              transition="fade"
              duration={300}
              timingFunction="ease"
            >
              {(styles) => (
                <Alert
                  withCloseButton
                  style={styles}
                  icon={<LazyIcon name="IconAlertCircle" size={16} />}
                  color="red"
                  variant="light"
                  onClose={handleAlertClose}
                >
                  {translationStrings.invalidCredentials}
                </Alert>
              )}
            </Transition>

            <Group justify="flex-end">
              <Anchor
                component="button"
                type="button"
                size="sm"
                disabled={isLoading}
                onClick={handleForgotPassword}
              >
                {translationStrings.forgotPassword}
              </Anchor>
            </Group>

            <FormButton type="submit">{translationStrings.signIn}</FormButton>
          </Stack>
        </form>

        <Text size="sm" ta="center" mt="lg" c="dimmed">
          {translationStrings.noAccount}{' '}
          <Anchor href="/register" size="sm" fw="600">
            {translationStrings.createAccount}
          </Anchor>
        </Text>
      </FormContainer>
    </GuestLayout>
  );
}
