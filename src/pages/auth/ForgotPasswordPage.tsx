import {useState} from 'react';
import {useNavigate} from 'react-router';
import {
  TextInput,
  Button,
  Paper,
  Anchor,
  Center,
  Box,
  rem,
  Stack,
  Text,
  Title,
  Transition,
  LoadingOverlay,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {IconArrowLeft, IconMail, IconInfoCircle} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {authService} from '@/services/auth';
import {getFormValidators} from '@/utils/validation';

type ForgotPasswordFormValues = {
  email: string;
};

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    initialValues: {
      email: '',
    },
    validate: getFormValidators(t, ['email']),
  });

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);

      await authService.forgotPassword({
        email: values.email,
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
    return (
      <GuestLayout
        hasRegisterLink={false}
        title={t('auth.forgotPasswordTitle')}
      >
        <Paper withBorder shadow="xl" p={{base: 'xl', sm: 30}} radius="md">
          <Stack gap="md" align="center" ta="center">
            <IconInfoCircle size={48} color="var(--mantine-color-green-6)" />
            <Title order={3}>{t('auth.checkYourEmail')}</Title>
            <Text size="sm" c="dimmed">
              {t('auth.passwordResetEmailSentDescription')}
            </Text>
            <Button
              fullWidth
              variant="light"
              mt="md"
              onClick={() => navigate('/login')}
            >
              {t('auth.backToLogin')}
            </Button>
          </Stack>
        </Paper>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout hasRegisterLink={false} title={t('auth.forgotPasswordTitle')}>
      <Stack gap="xl">
        <Transition
          mounted
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

              <Stack gap="lg">
                <div>
                  <Text size="sm" c="dimmed" ta="center">
                    {t('auth.forgotPasswordDescription')}
                  </Text>
                </div>

                <form onSubmit={form.onSubmit(handleSubmit)}>
                  <Stack gap="md">
                    <TextInput
                      required
                      autoComplete="email"
                      label={t('auth.email')}
                      placeholder="you@example.com"
                      error={form.errors.email}
                      disabled={isLoading}
                      leftSection={<IconMail size={16} />}
                      {...form.getInputProps('email')}
                    />

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
                      {t('auth.sendResetEmail')}
                    </Button>
                  </Stack>
                </form>

                <Center>
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
              </Stack>
            </Paper>
          )}
        </Transition>
      </Stack>
    </GuestLayout>
  );
}
