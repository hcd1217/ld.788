import { useEffect, useState } from 'react';

import { Button, CloseButton, Group, Paper, Text } from '@mantine/core';

import { useTranslation } from '@/hooks/useTranslation';

type BeforeInstallPromptEvent = {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
} & Event;

export function PWAInstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | undefined>();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    globalThis.addEventListener('beforeinstallprompt', handler);

    return () => {
      globalThis.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(undefined);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Paper
      shadow="md"
      p="md"
      radius="md"
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        maxWidth: 400,
        width: 'calc(100% - 40px)',
      }}
    >
      <Group align="start">
        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500} mb={4}>
            {t('pwa.installTitle')}
          </Text>
          <Text size="xs" c="dimmed">
            {t('pwa.installDescription')}
          </Text>
        </div>
        <CloseButton size="sm" onClick={handleDismiss} />
      </Group>
      <Group mt="md">
        <Button size="xs" variant="light" onClick={handleDismiss}>
          {t('pwa.maybeLater')}
        </Button>
        <Button size="xs" onClick={handleInstallClick}>
          {t('pwa.install')}
        </Button>
      </Group>
    </Paper>
  );
}
