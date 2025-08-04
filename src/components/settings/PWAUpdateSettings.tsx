import { Switch, Group, Text } from '@mantine/core';
import { usePWA } from '@/hooks/usePWA';
import { useTranslation } from '@/hooks/useTranslation';

export function PWAUpdateSettings() {
  const { t } = useTranslation();
  const { autoUpdate, setAutoUpdate, isChromium } = usePWA();

  // Only show for Chromium browsers
  if (!isChromium) {
    return null;
  }

  return (
    <Group justify="space-between">
      <div>
        <Text size="sm" fw={500}>
          {t('settings.autoUpdate.title')}
        </Text>
        <Text size="xs" c="dimmed">
          {t('settings.autoUpdate.description')}
        </Text>
      </div>
      <Switch
        checked={autoUpdate}
        onChange={(event) => setAutoUpdate(event.currentTarget.checked)}
      />
    </Group>
  );
}
