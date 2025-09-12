import { Modal, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconRotate2 } from '@tabler/icons-react';

import { useOrientation } from '@/hooks/useOrientation';
import { useTranslation } from '@/hooks/useTranslation';

export function OrientationNotice() {
  const { t } = useTranslation();
  const { isLandscape, isMobile } = useOrientation();

  if (!isMobile) {
    return null;
  }

  return (
    <Modal
      fullScreen
      // Only show on mobile devices in landscape mode
      opened={isLandscape}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      padding="xl"
      transitionProps={{
        transition: 'fade',
        duration: 200,
      }}
      styles={{
        content: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        body: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        },
      }}
      onClose={() => {
        // Prevent closing
      }}
    >
      <Stack align="center" gap="xl">
        <ThemeIcon
          size={100}
          radius="xl"
          variant="light"
          style={{
            animation: 'rotate 2s ease-in-out infinite',
          }}
        >
          <IconRotate2 size={60} />
        </ThemeIcon>

        <Stack align="center" gap="md">
          <Text size="xl" fw={700} ta="center">
            {t('orientation.title')}
          </Text>
          <Text size="md" c="dimmed" ta="center" maw={300}>
            {t('orientation.message')}
          </Text>
        </Stack>
      </Stack>

      <style>{`
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-90deg);
          }
          50% {
            transform: rotate(-90deg);
          }
          75% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </Modal>
  );
}
