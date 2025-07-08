import {useState} from 'react';
import {useNavigate} from 'react-router';
import {
  Anchor,
  Center,
  Box,
  rem,
  Stack,
  Alert,
  Transition,
  Group,
  Title,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {
  IconAlertCircle,
  IconArrowLeft,
} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {clientService} from '@/services/client';
import {getFormValidators} from '@/utils/validation';
import {FirstNameAndLastNameInForm} from '@/components/form/FirstNameAndLastNameInForm';
import {AuthFormContainer} from '@/components/auth/AuthFormContainer';
import {AuthFormInput} from '@/components/auth/AuthFormInput';
import {AuthFormButton} from '@/components/auth/AuthFormButton';
import {Logo} from '@/components/common/Logo';

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
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

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
      notifications.show({
        title: t('notifications.registrationSuccess'),
        message: t('notifications.registrationSuccessMessage'),
        color: 'green',
      });
      navigate(`/${client.code}/login`);
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
          {t('auth.registerTitle')}
        </Title>
      </Group>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <AuthFormInput
            required
            autoComplete="off"
            placeholder={t('auth.clientCode')}
            error={form.errors.clientCode}
            disabled={isLoading}
            {...form.getInputProps('clientCode')}
            onFocus={() => {
              setShowAlert(false);
            }}
          />
          <AuthFormInput
            required
            autoComplete="off"
            placeholder={t('auth.clientName')}
            error={form.errors.clientName}
            disabled={isLoading}
            {...form.getInputProps('clientName')}
            onFocus={() => {
              setShowAlert(false);
            }}
          />
          <FirstNameAndLastNameInForm
            form={form}
            isLoading={isLoading}
            setShowAlert={setShowAlert}
          />

          <AuthFormInput
            required
            type="email"
            autoComplete="email"
            placeholder={t('auth.email')}
            error={form.errors.email}
            disabled={isLoading}
            {...form.getInputProps('email')}
            onFocus={() => {
              setShowAlert(false);
            }}
          />

          <AuthFormInput
            required
            type="password"
            autoComplete="new-password"
            placeholder={t('auth.password')}
            error={form.errors.password}
            disabled={isLoading}
            {...form.getInputProps('password')}
            onFocus={() => {
              setShowAlert(false);
            }}
          />

          <AuthFormInput
            required
            type="password"
            autoComplete="new-password"
            placeholder={t('auth.confirmPassword')}
            error={form.errors.confirmPassword}
            disabled={isLoading}
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

          <AuthFormButton loading={isLoading} type="submit">
            {t('auth.createAccount')}
          </AuthFormButton>
        </Stack>
      </form>

      <Center mt="lg">
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
    </>
  );

  return (
    <GuestLayout>
      <AuthFormContainer isLoading={isLoading} mounted={true}>
        {content}
      </AuthFormContainer>
    </GuestLayout>
  );
}
