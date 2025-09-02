import { Alert, Text, List } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { usePWA } from '@/hooks/usePWA';
import { useTranslation } from '@/hooks/useTranslation';

export function SafariUpdateGuide() {
  const { t } = useTranslation();
  const { isSafari, isStandalone, needRefresh } = usePWA();

  // Only show for Safari in standalone mode when update is needed
  if (!isSafari || !isStandalone || !needRefresh) {
    return null;
  }

  return (
    <Alert icon={<IconInfoCircle />} title={t('common.pwa.safari.updateGuideTitle')} color="blue">
      <Text size="sm" mb="xs">
        {t('common.pwa.safari.updateInstructions')}
      </Text>
      <List size="sm">
        <List.Item>{t('common.pwa.safari.step1')}</List.Item>
        <List.Item>{t('common.pwa.safari.step2')}</List.Item>
        <List.Item>{t('common.pwa.safari.step3')}</List.Item>
        <List.Item>{t('common.pwa.safari.step4')}</List.Item>
      </List>
      <Text size="xs" c="dimmed" mt="xs">
        {t('common.pwa.safari.restartNote')}
      </Text>
    </Alert>
  );
}
