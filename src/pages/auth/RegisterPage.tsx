import {useNavigate} from 'react-router';
import {Stack, Space, Button, TextInput, PasswordInput} from '@mantine/core';
import {useForm} from '@mantine/form';
import useTranslation from '@/hooks/useTranslation';
import {useAuthForm} from '@/hooks/useAuthForm';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {clientService} from '@/services/client';
import {getFormValidators} from '@/utils/validation';
import {FirstNameAndLastNameInForm} from '@/components/form/FirstNameAndLastNameInForm';
import {FormContainer} from '@/components/form/FormContainer';
import {AuthHeader, AuthAlert, AuthFormLink} from '@/components/auth';
import {generateRandomString} from '@/utils/string';
import {isProduction} from '@/utils/env';
import {ROUTERS, getClientLoginRoute} from '@/config/routeConfig';

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

  const form = useForm<RegisterFormValues>({
    initialValues: isProduction
      ? {
          clientCode: generateRandomString(5).toUpperCase(),
          clientName: '',
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
        }
      : {
          clientCode: generateRandomString(5).toUpperCase(),
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

  const {isLoading, showAlert, clearErrors, handleSubmit} = useAuthForm(form, {
    successTitle: t('notifications.registrationSuccess'),
    successMessage: t('notifications.registrationSuccessMessage'),
    errorTitle: t('notifications.registrationFailed'),
    onSuccess: () => navigate(getClientLoginRoute(form.values.clientCode)),
  });

  const onSubmit = handleSubmit(async (values: RegisterFormValues) => {
    const {client} = await clientService.registerNewClient({
      clientCode: values.clientCode,
      clientName: values.clientName,
      rootUserEmail: values.email,
      rootUserPassword: values.password,
      rootUserFirstName: values.firstName,
      rootUserLastName: values.lastName,
    });
    form.setFieldValue('clientCode', client.code);
  });

  return (
    <GuestLayout>
      <Space h="lg" />
      <FormContainer mounted isLoading={isLoading}>
        <AuthHeader title={t('auth.registerTitle')} />
        <Space h="lg" />
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack gap="md">
            <TextInput
              required
              autoComplete="off"
              placeholder={t('auth.clientName')}
              error={form.errors.clientName}
              disabled={isLoading}
              {...form.getInputProps('clientName')}
              onFocus={clearErrors}
            />
            <FirstNameAndLastNameInForm
              form={form}
              isLoading={isLoading}
              setShowAlert={(value) => value || clearErrors()}
            />

            <TextInput
              required
              type="email"
              autoComplete="email"
              placeholder={t('auth.email')}
              error={form.errors.email}
              disabled={isLoading}
              {...form.getInputProps('email')}
              onFocus={clearErrors}
            />

            <PasswordInput
              required
              autoComplete="new-password"
              placeholder={t('auth.password')}
              error={form.errors.password}
              disabled={isLoading}
              {...form.getInputProps('password')}
              onFocus={clearErrors}
            />

            <PasswordInput
              required
              autoComplete="new-password"
              placeholder={t('auth.confirmPassword')}
              error={form.errors.confirmPassword}
              disabled={isLoading}
              {...form.getInputProps('confirmPassword')}
              onFocus={clearErrors}
            />

            <AuthAlert
              show={
                showAlert
                  ? Boolean(form.errors.email && form.errors.password)
                  : false
              }
              message={t('notifications.registrationFailed')}
              onClose={clearErrors}
            />

            <Button variant="auth-form" type="submit">
              {t('auth.start')}
            </Button>
          </Stack>
        </form>

        <AuthFormLink
          text={t('auth.haveAccount')}
          linkText={t('auth.backToLogin')}
          href={ROUTERS.LOGIN}
        />
      </FormContainer>
    </GuestLayout>
  );
}
