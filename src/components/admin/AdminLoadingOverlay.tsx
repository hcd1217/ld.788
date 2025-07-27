import {Portal, Overlay, Center, Loader, Stack, Text} from '@mantine/core';
import {useAppStore} from '@/stores/useAppStore';
import useTranslation from '@/hooks/useTranslation';
import useIsDarkMode from '@/hooks/useIsDarkMode';

export function AdminLoadingOverlay() {
  const {adminApiLoading, adminApiLoadingMessage} = useAppStore();
  const isDarkMode = useIsDarkMode();
  const {t} = useTranslation();

  if (!adminApiLoading) {
    return null;
  }

  return (
    <Portal>
      <Overlay
        fixed
        backgroundOpacity={0.95}
        blur={3}
        styles={{
          root: {
            backgroundColor: isDarkMode
              ? 'var(--mantine-color-dark-9)'
              : 'white',
            opacity: 0.95,
            zIndex: 10_000, // Ensure it's above all other content
          },
        }}
      >
        <Center h="100vh">
          <Stack align="center" gap="md">
            <Loader size="xl" color="blue" type="oval" />
            <Text size="xl" fw={500} c="brand">
              {adminApiLoadingMessage || t('admin.common.loading')}
            </Text>
          </Stack>
        </Center>
      </Overlay>
    </Portal>
  );
}
