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

const MAGIC_LINK_STORAGE_KEY = 'magicLinkParams';

export function MagicLinkLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {setUser} = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const {t} = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle URL params and redirect to clean URL
  useEffect(() => {
    if (!mounted) {
      return;
    }

    // Extract token and client code from URL query params
    const tokenFromUrl = searchParams.get('token');
    const clientCodeFromUrl = searchParams.get('clientCode');

    if (tokenFromUrl && clientCodeFromUrl) {
      // Store params in sessionStorage and redirect to clean URL
      sessionStorage.setItem(
        MAGIC_LINK_STORAGE_KEY,
        JSON.stringify({
          token: tokenFromUrl,
          clientCode: clientCodeFromUrl,
        }),
      );
      // Redirect to clean URL (remove query params)
      navigate(ROUTERS.MAGIC_LINK, {replace: true});
    }
  }, [mounted, searchParams, navigate]);

  const verifyMagicLink = useAction({
    options: {
      navigateTo: ROUTERS.HOME,
      delay: 1000,
    },
    async actionHandler() {
      // Get stored params from sessionStorage
      const storedParams = sessionStorage.getItem(MAGIC_LINK_STORAGE_KEY);
      if (!storedParams) {
        setError(t('auth.magicLink.invalidLink'));
        throw new Error(t('auth.magicLink.invalidLink'));
      }

      const {token, clientCode} = JSON.parse(storedParams) as {
        token: string;
        clientCode: string;
      };

      // Validate required parameters
      if (!token || !clientCode) {
        setError(t('auth.magicLink.invalidLink'));
        throw new Error(t('auth.magicLink.invalidLink'));
      }

      setIsLoading(true);
      const {user} = await authService.loginWithMagicToken(clientCode, token);

      // Clear stored params after successful verification
      sessionStorage.removeItem(MAGIC_LINK_STORAGE_KEY);

      setUser(user);
      setError(undefined);
    },
    errorHandler(error) {
      console.error('Magic link verification failed:', error);
      setError(t('auth.magicLink.verificationFailed'));
      // Clear stored params on error
      sessionStorage.removeItem(MAGIC_LINK_STORAGE_KEY);
    },
    cleanupHandler() {
      setIsLoading(false);
    },
  });

  // Trigger verification after redirect to clean URL
  useEffect(() => {
    if (!mounted) {
      return;
    }

    // Check if we have params in URL (means we haven't redirected yet)
    const hasUrlParams =
      searchParams.has('token') || searchParams.has('clientCode');
    if (hasUrlParams) {
      // Wait for redirect to happen
      return;
    }

    // Check if we have stored params (means we've redirected to clean URL)
    const storedParams = sessionStorage.getItem(MAGIC_LINK_STORAGE_KEY);
    if (storedParams) {
      void verifyMagicLink();
    } else {
      // No params found anywhere - show error
      setError(t('auth.magicLink.invalidLink'));
      setIsLoading(false);
    }
  }, [mounted, searchParams, verifyMagicLink, t]);

  const handleRetryLogin = () => {
    navigate(ROUTERS.LOGIN);
  };

  return (
    <GuestLayout>
      <FormContainer isLoading={isLoading} mounted={mounted}>
        <AuthHeader title={t('auth.magicLink.title')} />
        <Space h="lg" />

        <Stack gap="sm" align="center" p={0}>
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
                w="100%"
                mb="xl"
                icon={<IconX size={20} />}
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
