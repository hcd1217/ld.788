import { useState, useEffect } from 'react';
import { Paper, Text, Group, CloseButton, Stack, List, ThemeIcon, Button } from '@mantine/core';
import {
  IconShare,
  IconSquareRoundedPlus,
  IconDeviceMobile,
  IconDeviceDesktop,
  IconCheckbox,
} from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalStorage } from '@mantine/hooks';

// Detect if browser is Safari
const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase();
  const isSafariBrowser =
    ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android');
  return isSafariBrowser;
};

// Detect if app is running in standalone mode (already installed)
const isStandalone = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

// Detect if iOS or macOS
const isIOS = () => /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
const isMacOS = () => /macintosh|mac os x/.test(navigator.userAgent.toLowerCase());

export function SafariPWAGuide() {
  const { t } = useTranslation();
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useLocalStorage({
    key: 'safari-pwa-guide-dismissed',
    defaultValue: false,
  });

  useEffect(() => {
    // Show guide only for Safari users who haven't installed the app and haven't dismissed the guide
    if (isSafari() && !isStandalone() && !dismissed) {
      // Delay showing the guide to not overwhelm the user
      const timer = setTimeout(() => {
        setShowGuide(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [dismissed]);

  const handleDismiss = () => {
    setShowGuide(false);
  };

  const handleDismissPermanently = () => {
    setDismissed(true);
    setShowGuide(false);
  };

  if (!showGuide) {
    return null;
  }

  const isIOSDevice = isIOS();
  const isMacDevice = isMacOS();

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
      <Group align="start" mb="sm">
        <div style={{ flex: 1 }}>
          <Group gap="xs" mb={4}>
            {isIOSDevice ? <IconDeviceMobile size={20} /> : <IconDeviceDesktop size={20} />}
            <Text size="sm" fw={500}>
              {t('pwa.safari.installTitle')}
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            {t('pwa.safari.installDescription')}
          </Text>
        </div>
        <CloseButton size="sm" onClick={handleDismiss} />
      </Group>

      <Stack gap="xs">
        {isIOSDevice ? (
          <List spacing="xs" size="xs" center>
            <List.Item
              icon={
                <ThemeIcon color="blue" size={20} radius="xl">
                  <IconShare size={12} />
                </ThemeIcon>
              }
            >
              {t('pwa.safari.ios.step1')}
            </List.Item>
            <List.Item
              icon={
                <ThemeIcon color="blue" size={20} radius="xl">
                  <IconSquareRoundedPlus size={12} />
                </ThemeIcon>
              }
            >
              {t('pwa.safari.ios.step2')}
            </List.Item>
            <List.Item
              icon={
                <ThemeIcon color="blue" size={20} radius="xl">
                  <IconCheckbox size={12} />
                </ThemeIcon>
              }
            >
              {t('pwa.safari.ios.step3')}
            </List.Item>
          </List>
        ) : isMacDevice ? (
          <List spacing="xs" size="xs" center>
            <List.Item
              icon={
                <ThemeIcon color="blue" size={20} radius="xl">
                  <Text size="xs" fw={700}>
                    1
                  </Text>
                </ThemeIcon>
              }
            >
              {t('pwa.safari.mac.step1')}
            </List.Item>
            <List.Item
              icon={
                <ThemeIcon color="blue" size={20} radius="xl">
                  <Text size="xs" fw={700}>
                    2
                  </Text>
                </ThemeIcon>
              }
            >
              {t('pwa.safari.mac.step2')}
            </List.Item>
            <List.Item
              icon={
                <ThemeIcon color="blue" size={20} radius="xl">
                  <Text size="xs" fw={700}>
                    3
                  </Text>
                </ThemeIcon>
              }
            >
              {t('pwa.safari.mac.step3')}
            </List.Item>
          </List>
        ) : null}
      </Stack>

      <Group mt="md">
        <Button size="xs" variant="light" onClick={handleDismiss}>
          {t('pwa.safari.remindLater')}
        </Button>
        <Button size="xs" variant="subtle" onClick={handleDismissPermanently}>
          {t('pwa.safari.dontShowAgain')}
        </Button>
      </Group>
    </Paper>
  );
}
