import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router';
import {Stack, Space, Button, Text, Alert} from '@mantine/core';
import {IconX, IconCheck} from '@tabler/icons-react';
import {useAppStore} from '@/stores/useAppStore';
import {useTranslation} from '@/hooks/useTranslation';
import {useAction} from '@/hooks/useAction';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {FormContainer} from '@/components/form/FormContainer';
import {AuthHeader} from '@/components/auth';
import {ROUTERS} from '@/config/routeConfig';
import {authService} from '@/services/auth';

export function MagicLinkLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {setUser} = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const {t} = useTranslation();

  // Extract token and client code from URL query params
  const token = searchParams.get('token');
  const clientCode = searchParams.get('clientCode');

  useEffect(() => {
    setMounted(true);
  }, []);

  const verifyMagicLink = useAction({
    options: {
      successTitle: t('notifications.loginSuccess'),
      successMessage: t('notifications.magicLinkSuccess'),
      errorTitle: t('notifications.loginFailed'),
      errorMessage: t('auth.magicLink.verificationFailed'),
      navigateTo: ROUTERS.HOME,
      delay: 1000,
    },
    async actionHandler() {
      // Validate required parameters
      if (!token || !clientCode) {
        setError(t('auth.magicLink.invalidLink'));
        throw new Error(t('auth.magicLink.invalidLink'));
      }

      setIsLoading(true);
      const {user} = await authService.loginWithMagicToken(clientCode, token);

      setUser(user);
      setError(undefined);
    },
    errorHandler(error) {
      console.error('Magic link verification failed:', error);
      setError(t('auth.magicLink.verificationFailed'));
    },
    cleanupHandler() {
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (!mounted) {
      return;
    }

    // Only verify if we have the required parameters
    if (token && clientCode) {
      void verifyMagicLink();
    } else {
      setError(t('auth.magicLink.invalidLink'));
      setIsLoading(false);
    }
  }, [mounted, token, clientCode, verifyMagicLink, t]);

  const handleRetryLogin = () => {
    navigate(ROUTERS.LOGIN);
  };

  return (
    <GuestLayout>
      <FormContainer isLoading={isLoading} mounted={mounted}>
        <AuthHeader title={t('auth.magicLink.title')} />
        <Space h="lg" />

        <Stack gap="lg" align="center">
          {isLoading ? (
            <Text size="md" ta="center">
              {t('auth.magicLink.verifying')}
            </Text>
          ) : null}

          {!isLoading && !error && (
            <>
              <IconCheck size={48} color="var(--mantine-color-green-6)" />
              <Text size="md" ta="center" c="green">
                {t('auth.magicLink.success')}
              </Text>
              <Text size="sm" ta="center" c="dimmed">
                {t('auth.magicLink.redirecting')}
              </Text>
            </>
          )}

          {!isLoading && error ? (
            <>
              <Alert
                icon={<IconX size={20} />}
                title={t('common.error')}
                color="red"
                variant="light"
              >
                {error}
              </Alert>

              <Button fullWidth variant="auth-form" onClick={handleRetryLogin}>
                {t('auth.magicLink.tryAgain')}
              </Button>
            </>
          ) : null}
        </Stack>
      </FormContainer>
    </GuestLayout>
  );
}
