import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router';
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Anchor,
  Center,
  Box,
  rem,
  Stack,
  Alert,
  Transition,
  LoadingOverlay,
  Grid,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {
  IconArrowLeft,
  IconAlertCircle,
  IconMail,
  IconLock,
  IconUser,
  IconBuilding,
  IconId,
} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {useAppStore} from '@/stores/useAppStore';
import {getLocaleConfig} from '@/config/localeConfig';
import i18n from '@/lib/i18n';
import {clientService} from '@/services/client';
import {getFormValidators} from '@/utils/validation';

type RegisterFormValues = {
  clientCode: string;
  clientName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function RegisterPage() {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {setClientCode} = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [mounted, setMounted] = useState(false);
  const form = useForm<RegisterFormValues>({
    initialValues: import.meta.env.PROD
      ? {
          clientCode: '',
          clientName: '',
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
        }
      : {
          clientCode: 'ACME',
          clientName: 'Acme Corporation',
          firstName: 'John',
          lastName: 'Doe',
          email: 'admin@acme.com',
          password: 's5cureP@s5w0rd123!!!',
          confirmPassword: 's5cureP@s5w0rd123!!!',
        },
    validate: getFormValidators(t, [
      'clientCode',
      'clientName',
      'firstName',
      'lastName',
      'email',
      'password',
      'confirmPassword',
    ]),
  });

  // Focus first name field (based on locale order) on mount and trigger mount animation
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      const localeConfig = getLocaleConfig(i18n.language);
      const fieldToFocus =
        localeConfig.nameOrder === 'family-first'
          ? 'input[name="lastName"]'
          : 'input[name="firstName"]';
      const inputElement =
        document.querySelector<HTMLInputElement>(fieldToFocus);
      inputElement?.focus();
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true);

      const {client} = await clientService.registerNewClient({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        code: values.clientCode,
        name: values.clientName,
      });
      setClientCode(client.code);
      notifications.show({
        title: t('notifications.registrationSuccess'),
        message: t('notifications.registrationSuccessMessage'),
        color: 'green',
      });
      navigate('/login');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('notifications.registrationFailed');

      form.setErrors({
        email: ' ',
        password: ' ',
      });

      setShowAlert(true);

      notifications.show({
        title: t('notifications.registrationFailed'),
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestLayout hasRegisterLink={false} title={t('auth.registerTitle')}>
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
                <TextInput
                  required
                  autoComplete="off"
                  label={t('auth.clientCode')}
                  placeholder={t('auth.clientCode')}
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
                  autoComplete="off"
                  label={t('auth.clientName')}
                  placeholder={t('auth.clientName')}
                  error={form.errors.clientName}
                  disabled={isLoading}
                  leftSection={<IconId size={16} />}
                  {...form.getInputProps('clientName')}
                  onFocus={() => {
                    setShowAlert(false);
                  }}
                />
                <Stack gap="md">
                  <Grid>
                    {(() => {
                      const localeConfig = getLocaleConfig(i18n.language);
                      const firstNameField = (
                        <Grid.Col key="firstName" span={{base: 12, sm: 6}}>
                          <TextInput
                            required
                            autoComplete="given-name"
                            label={t('auth.firstName')}
                            placeholder={t('auth.firstNamePlaceholder')}
                            error={form.errors.firstName}
                            disabled={isLoading}
                            leftSection={<IconUser size={16} />}
                            {...form.getInputProps('firstName')}
                            onFocus={() => {
                              setShowAlert(false);
                            }}
                          />
                        </Grid.Col>
                      );

                      const lastNameField = (
                        <Grid.Col key="lastName" span={{base: 12, sm: 6}}>
                          <TextInput
                            required
                            autoComplete="family-name"
                            label={t('auth.lastName')}
                            placeholder={t('auth.lastNamePlaceholder')}
                            error={form.errors.lastName}
                            disabled={isLoading}
                            leftSection={<IconUser size={16} />}
                            {...form.getInputProps('lastName')}
                            onFocus={() => {
                              setShowAlert(false);
                            }}
                          />
                        </Grid.Col>
                      );

                      // Return fields in order based on locale configuration
                      return localeConfig.nameOrder === 'family-first'
                        ? [lastNameField, firstNameField]
                        : [firstNameField, lastNameField];
                    })()}
                  </Grid>

                  <TextInput
                    required
                    autoComplete="email"
                    label={t('auth.email')}
                    placeholder="you@example.com"
                    error={form.errors.email}
                    disabled={isLoading}
                    leftSection={<IconMail size={16} />}
                    {...form.getInputProps('email')}
                    onFocus={() => {
                      setShowAlert(false);
                    }}
                  />

                  <PasswordInput
                    required
                    autoComplete="new-password"
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

                  <PasswordInput
                    required
                    autoComplete="new-password"
                    label={t('auth.confirmPassword')}
                    placeholder={t('auth.confirmYourPassword')}
                    error={form.errors.confirmPassword}
                    disabled={isLoading}
                    leftSection={<IconLock size={16} />}
                    {...form.getInputProps('confirmPassword')}
                    onFocus={() => {
                      setShowAlert(false);
                    }}
                  />

                  <Transition
                    mounted={
                      showAlert
                        ? Boolean(form.errors.email && form.errors.password)
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
                        {t('notifications.registrationFailed')}
                      </Alert>
                    )}
                  </Transition>

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
                    {t('auth.createAccount')}
                  </Button>
                </Stack>
              </form>

              <Center mt="md">
                <Stack gap="xs" align="center">
                  <Anchor
                    component="button"
                    type="button"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => navigate('/login')}
                  >
                    {t('auth.haveAccount')} {t('auth.signIn')}
                  </Anchor>

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
                </Stack>
              </Center>
            </Paper>
          )}
        </Transition>
      </Stack>
    </GuestLayout>
  );
}
