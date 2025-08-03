import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router';
import {Stack, Space, Button, Text, Alert, TextInput, Group} from '@mantine/core';
import {IconX, IconCheck, IconQrcode, IconForms} from '@tabler/icons-react';
import {useAppStore} from '@/stores/useAppStore';
import {useTranslation} from '@/hooks/useTranslation';
import {useAction} from '@/hooks/useAction';
import {GuestLayout} from '@/components/layouts/GuestLayout';
import {FormContainer} from '@/components/form/FormContainer';
import {AuthHeader, QrScannerModal} from '@/components/auth';
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
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showOptions, setShowOptions] = useState(false);
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

      setUser(user);
      setError(undefined);
    },
    errorHandler(error) {
      console.error('Magic link verification failed:', error);
      setError(t('auth.magicLink.verificationFailed'));
    },
    cleanupHandler() {
      // Clear stored params on error or after successful verification
      sessionStorage.removeItem(MAGIC_LINK_STORAGE_KEY);
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
      // No params found - show QR/manual entry options instead of error
      setShowOptions(true);
      setIsLoading(false);
      setError(undefined);
    }
  }, [mounted, searchParams, verifyMagicLink, t]);

  const handleRetryLogin = () => {
    navigate(ROUTERS.LOGIN);
  };

  const handleQrScan = (data: string) => {
    try {
      // Parse the scanned data - it should be a URL with token and clientCode
      const url = new URL(data);
      const token = url.searchParams.get('token');
      const clientCode = url.searchParams.get('clientCode');

      if (token && clientCode) {
        // Store params and reload to trigger verification
        sessionStorage.setItem(
          MAGIC_LINK_STORAGE_KEY,
          JSON.stringify({ token, clientCode }),
        );
        // Trigger verification
        void verifyMagicLink();
      } else {
        setError(t('auth.magicLink.invalidQrCode'));
      }
    } catch (err) {
      console.error('Invalid QR code:', err);
      setError(t('auth.magicLink.invalidQrCode'));
    }
  };

  const handleManualCodeSubmit = () => {
    try {
      // Manual code could be in format: token:clientCode or just the token
      const parts = manualCode.split(':');

      if (parts.length === 2) {
        const [token, clientCode] = parts;
        sessionStorage.setItem(
          MAGIC_LINK_STORAGE_KEY,
          JSON.stringify({ token: token.trim(), clientCode: clientCode.trim() }),
        );
        void verifyMagicLink();
      } else if (parts.length === 1 && manualCode.includes('?')) {
        // Try parsing as URL
        handleQrScan(manualCode);
      } else {
        setError(t('auth.magicLink.invalidLink'));
      }
    } catch (err) {
      console.error('Invalid manual code:', err);
      setError(t('auth.magicLink.invalidLink'));
    }
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

          {!isLoading && !error && !showOptions && (
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

          {!isLoading && (error || showOptions) ? (
            <>

              {error && (
                <Alert
                  w="100%"
                  mb="xl"
                  icon={<IconX size={20} />}
                  color="red"
                  variant="light"
                >
                  {error}
                </Alert>
              )}

              {!showManualEntry ? (
                <Stack gap="md" w="100%">
                  <Button
                    fullWidth
                    variant="filled"
                    leftSection={<IconQrcode size={20} />}
                    onClick={() => setShowQrScanner(true)}
                  >
                    {t('auth.magicLink.scanQrCode')}
                  </Button>

                  <Text ta="center" size="sm" c="dimmed">
                    {t('auth.magicLink.or')}
                  </Text>

                  <Button
                    fullWidth
                    variant="default"
                    leftSection={<IconForms size={20} />}
                    onClick={() => setShowManualEntry(true)}
                  >
                    {t('auth.magicLink.enterCodeManually')}
                  </Button>

                  <Button
                    fullWidth
                    variant="subtle"
                    onClick={handleRetryLogin}
                    mt="md"
                  >
                    {t('auth.magicLink.tryAgain')}
                  </Button>
                </Stack>
              ) : (
                <Stack gap="md" w="100%">
                  <Text size="sm" c="dimmed">
                    {t('auth.magicLink.enterCodeDescription')}
                  </Text>

                  <TextInput
                    placeholder={t('auth.magicLink.magicLinkCode')}
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && manualCode) {
                        handleManualCodeSubmit();
                      }
                    }}
                  />

                  <Group grow>
                    <Button
                      variant="default"
                      onClick={() => {
                        setShowManualEntry(false);
                        setManualCode('');
                        setError(undefined);
                      }}
                    >
                      {t('common.cancel')}
                    </Button>

                    <Button
                      variant="filled"
                      onClick={handleManualCodeSubmit}
                      disabled={!manualCode}
                    >
                      {t('auth.magicLink.verifyCode')}
                    </Button>
                  </Group>
                </Stack>
              )}
            </>
          ) : null}
        </Stack>
      </FormContainer>

      <QrScannerModal
        opened={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        onScan={handleQrScan}
      />
    </GuestLayout>
  );
}
