import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Stack, Space, Button, Text, Alert, TextInput, Group } from '@mantine/core';
import { IconX, IconCheck, IconQrcode, IconForms } from '@tabler/icons-react';
import { useAppStore } from '@/stores/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useAction } from '@/hooks/useAction';
import { GuestLayout } from '@/components/layouts/GuestLayout';
import { FormContainer } from '@/components/form/FormContainer';
import { AuthHeader, QrScannerModal } from '@/components/auth';
import { ROUTERS } from '@/config/routeConfig';
import { logError } from '@/utils/logger';

const MAGIC_LINK_STORAGE_KEY = 'magicLinkParams';

export function MagicLinkLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithMagicLink } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const { t } = useTranslation();
  const verificationInProgress = useRef(false);

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
      navigate(ROUTERS.MAGIC_LINK, { replace: true });
    }
  }, [mounted, searchParams, navigate]);

  const verifyMagicLink = useAction({
    options: {
      navigateTo: ROUTERS.HOME,
      delay: 1000,
    },
    async actionHandler() {
      // Prevent double execution (React StrictMode in dev)
      if (verificationInProgress.current) {
        return;
      }
      verificationInProgress.current = true;

      // Get stored params from sessionStorage
      const storedParams = sessionStorage.getItem(MAGIC_LINK_STORAGE_KEY);
      if (!storedParams) {
        setError(t('auth.magicLink.invalidLink'));
        throw new Error(t('auth.magicLink.invalidLink'));
      }

      const { token, clientCode } = JSON.parse(storedParams) as {
        token: string;
        clientCode: string;
      };

      // Validate required parameters
      if (!token || !clientCode) {
        setError(t('auth.magicLink.invalidLink'));
        throw new Error(t('auth.magicLink.invalidLink'));
      }

      setIsLoading(true);
      // Use the new store function that properly sets isAuthenticated
      await loginWithMagicLink({ clientCode, token });
      setError(undefined);
    },
    errorHandler(error) {
      logError('Magic link verification failed:', error, {
        module: 'MagicLinkLoginPagePage',
        action: 'if',
      });
      setError(t('auth.magicLink.verificationFailed'));
      verificationInProgress.current = false;
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
    const hasUrlParams = searchParams.has('token') || searchParams.has('clientCode');
    if (hasUrlParams) {
      // Wait for redirect to happen
      return;
    }

    // Check if we have stored params (means we've redirected to clean URL)
    const storedParams = sessionStorage.getItem(MAGIC_LINK_STORAGE_KEY);
    if (storedParams && !verificationInProgress.current) {
      void verifyMagicLink();
    } else if (!storedParams) {
      // No params found - show QR/manual entry options instead of error
      setShowOptions(true);
      setIsLoading(false);
      setError(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, searchParams]);

  const handleRetryLogin = () => {
    navigate(ROUTERS.LOGIN);
  };

  const handleQrScan = (data: string) => {
    try {
      const trimmedData = data.trim();
      // Reset the flag to allow new verification attempt
      verificationInProgress.current = false;

      // Try to parse as URL first
      if (trimmedData.includes('?') || trimmedData.startsWith('http')) {
        const url = new URL(trimmedData);
        const token = url.searchParams.get('token');
        const clientCode = url.searchParams.get('clientCode');

        if (token && clientCode) {
          // Store params and trigger verification
          sessionStorage.setItem(MAGIC_LINK_STORAGE_KEY, JSON.stringify({ token, clientCode }));
          void verifyMagicLink();
        } else {
          setError(t('auth.magicLink.invalidQrCode'));
        }
      } else {
        // Treat as token-only and use clientCode from localStorage
        const clientCode = localStorage.getItem('clientCode') ?? 'ACME';

        sessionStorage.setItem(
          MAGIC_LINK_STORAGE_KEY,
          JSON.stringify({ token: trimmedData, clientCode }),
        );
        void verifyMagicLink();
      }
    } catch (error_) {
      logError('Invalid QR code:', error_, {
        module: 'MagicLinkLoginPagePage',
        action: 'clientCode',
      });
      setError(t('auth.magicLink.invalidQrCode'));
    }
  };

  const handleManualCodeSubmit = () => {
    try {
      const trimmedCode = manualCode.trim();
      // Reset the flag to allow new verification attempt
      verificationInProgress.current = false;

      // If it looks like a URL, try parsing it
      if (trimmedCode.includes('?') || trimmedCode.startsWith('http')) {
        handleQrScan(trimmedCode);
      } else {
        // Treat as token-only input and use clientCode from localStorage
        const clientCode = localStorage.getItem('clientCode') ?? 'ACME';

        sessionStorage.setItem(
          MAGIC_LINK_STORAGE_KEY,
          JSON.stringify({ token: trimmedCode, clientCode }),
        );
        void verifyMagicLink();
      }
    } catch (error_) {
      logError('Invalid manual code:', error_, {
        module: 'MagicLinkLoginPagePage',
        action: 'clientCode',
      });
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
                <Alert w="100%" mb="xl" icon={<IconX size={20} />} color="red" variant="light">
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

                  <Button fullWidth variant="subtle" onClick={handleRetryLogin} mt="md">
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
