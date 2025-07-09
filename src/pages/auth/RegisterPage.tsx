import {useState} from 'react';
import {useNavigate} from 'react-router';
import {
  Anchor,
  Center,
  Text,
  Stack,
  Alert,
  Transition,
  Title,
  Space,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {IconAlertCircle} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {clientService} from '@/services/client';
import {getFormValidators} from '@/utils/validation';
import {FirstNameAndLastNameInForm} from '@/components/form/FirstNameAndLastNameInForm';
import {FormContainer} from '@/components/form/FormContainer';
import {FormInput} from '@/components/form/FormInput';
import {FormButton} from '@/components/form/FormButton';
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
          clientCode: Math.random().toString(36).slice(2, 10).toUpperCase(),
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

  return (
    <GuestLayout>
      <Space h="lg" />
      <FormContainer mounted isLoading={isLoading}>
        <Logo />
        <Title
          style={{
            fontWeight: 900,
          }}
          size="h2"
        >
          {t('auth.registerTitle')}
        </Title>
        <Space h="lg" />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <FormInput
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

            <FormInput
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

            <FormInput
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

            <FormInput
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

            <FormButton type="submit">{t('auth.start')}</FormButton>
          </Stack>
        </form>

        <Center mt="lg">
          <Text size="sm" ta="center" mt="lg" c="dimmed">
            {t('auth.haveAccount')}{' '}
            <Anchor href="/login" size="sm" fw="600">
              {t('auth.backToLogin')}
            </Anchor>
          </Text>
        </Center>
      </FormContainer>
    </GuestLayout>
  );
}
