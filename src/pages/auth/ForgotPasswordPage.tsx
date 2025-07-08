import {useState} from 'react';
import {useNavigate} from 'react-router';
import {
  Anchor,
  Center,
  Box,
  rem,
  Stack,
  Text,
  Title,
  Group,
  Space,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {IconArrowLeft, IconInfoCircle} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {authService} from '@/services/auth';
import {getFormValidators} from '@/utils/validation';
import {FormContainer} from '@/components/form/FormContainer';
import {FormInput} from '@/components/form/FormInput';
import {FormButton} from '@/components/form/FormButton';
import {Logo} from '@/components/common/Logo';
import {useClientCode} from '@/hooks/useClientCode';

type ForgotPasswordFormValues = {
  email: string;
  clientCode: string;
};

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const clientCode = useClientCode();

  const form = useForm<ForgotPasswordFormValues>({
    initialValues: {
      email: '',
      clientCode,
    },
    validate: getFormValidators(t, ['email']),
  });

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);

      await authService.forgotPassword({
        email: values.email,
        clientCode: values.clientCode,
      });

      setIsSubmitted(true);

      notifications.show({
        title: t('auth.passwordResetRequested'),
        message: t('auth.passwordResetEmailSent'),
        color: 'green',
      });
    } catch (error) {
      // Error notification is already handled by authService
      console.error('Forgot password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    const successContent = (
      <>
        <Group justify="center" gap="md" mb="lg">
          <Logo />
          <Title
            style={{
              fontWeight: 900,
            }}
            size="h2"
          >
            {t('auth.forgotPasswordTitle')}
          </Title>
        </Group>
        <Stack gap="md" align="center" ta="center">
          <IconInfoCircle size={48} color="var(--mantine-color-green-6)" />
          <Title order={3}>{t('auth.checkYourEmail')}</Title>
          <Text size="sm" c="dimmed">
            {t('auth.passwordResetEmailSentDescription')}
          </Text>
          <FormButton
            variant="light"
            type="button"
            onClick={() => {
              navigate('/login');
            }}
          >
            {t('auth.backToLogin')}
          </FormButton>
        </Stack>
      </>
    );

    return (
      <GuestLayout>
        <FormContainer mounted isLoading={false}>
          {successContent}
        </FormContainer>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <FormContainer mounted isLoading={isLoading}>
        <Group justify="center" gap="md" mb="lg">
          <Logo />
          <Title
            style={{
              fontWeight: 900,
            }}
            size="h2"
          >
            {t('auth.forgotPasswordTitle')}
          </Title>
        </Group>

        <Space h="lg" />

        <Text size="sm" c="dimmed" ta="center" mb="lg">
          {t('auth.forgotPasswordDescription')}
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            <FormInput
              required
              type="email"
              autoComplete="email"
              placeholder={t('auth.email')}
              error={form.errors.email}
              disabled={isLoading}
              {...form.getInputProps('email')}
            />

            <FormButton
              loading={isLoading}
              type="submit"
              disabled={!form.isValid() && form.isTouched()}
            >
              {t('auth.sendResetEmail')}
            </FormButton>
          </Stack>
        </form>

        <Center mt="lg">
          <Anchor
            c="dimmed"
            component="button"
            size="sm"
            type="button"
            disabled={isLoading}
            onClick={() => navigate('/login')}
          >
            <Center inline>
              <IconArrowLeft
                style={{width: rem(14), height: rem(14)}}
                stroke={1.5}
              />
              <Box ml={5}>{t('auth.backToLogin')}</Box>
            </Center>
          </Anchor>
        </Center>
      </FormContainer>
    </GuestLayout>
  );
}
