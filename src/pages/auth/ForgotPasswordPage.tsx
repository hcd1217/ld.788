import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Stack, Text, Space, Button, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthForm } from '@/hooks/useAuthForm';
import { GuestLayout } from '@/components/layouts/GuestLayout';
import { authService } from '@/services/auth';
import { getFormValidators } from '@/utils/validation';
import { FormContainer } from '@/components/form/FormContainer';
import { AuthHeader, AuthFormLink, AuthSuccessState } from '@/components/auth';
import { useClientCode } from '@/hooks/useClientCode';
import { ROUTERS } from '@/config/routeConfig';

type ForgotPasswordFormValues = {
  email: string;
  clientCode: string;
};

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const clientCode = useClientCode();

  const form = useForm<ForgotPasswordFormValues>({
    initialValues: {
      email: '',
      clientCode,
    },
    validate: getFormValidators(t, ['email']),
  });

  const { isLoading, handleSubmit } = useAuthForm(form, {
    successTitle: t('auth.passwordResetRequested'),
    successMessage: t('auth.passwordResetEmailSent'),
    onSuccess() {
      setIsSubmitted(true);
    },
  });

  const onSubmit = handleSubmit(async (values: ForgotPasswordFormValues) => {
    await authService.forgotPassword({
      email: values.email,
      clientCode: values.clientCode,
    });
  });

  if (isSubmitted) {
    return (
      <GuestLayout>
        <FormContainer mounted isLoading={false}>
          <AuthSuccessState
            icon={<IconInfoCircle size={48} color="var(--mantine-color-green-6)" />}
            title={t('auth.checkYourEmail')}
            description={t('auth.passwordResetEmailSentDescription')}
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
          {t('auth.forgotPasswordDescription')}
        </Text>

        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack gap="lg">
            <TextInput
              required
              type="email"
              autoComplete="email"
              placeholder={t('auth.email')}
              error={form.errors.email}
              disabled={isLoading}
              {...form.getInputProps('email')}
            />

            <Button
              type="submit"
              variant="auth-form"
              disabled={!form.isValid() && form.isTouched()}
            >
              {t('auth.sendResetEmail')}
            </Button>
          </Stack>
        </form>

        <AuthFormLink text="" linkText={t('auth.backToLogin')} href={ROUTERS.LOGIN} />
      </FormContainer>
    </GuestLayout>
  );
}
