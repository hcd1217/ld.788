import { Box, Button, Group, Image, Progress, Stack, Text } from '@mantine/core';
import { IconCheck, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface PhotoPreviewProps {
  readonly capturedPhoto: string;
  readonly autoConfirmCountdown: number | null;
  readonly autoConfirmSeconds: number;
  readonly onRetake: () => void;
  readonly onConfirm: () => void;
}

export function PhotoPreview({
  capturedPhoto,
  autoConfirmCountdown,
  autoConfirmSeconds,
  onRetake,
  onConfirm,
}: PhotoPreviewProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Captured photo preview */}
      <Image
        src={capturedPhoto}
        alt="Captured photo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />

      {/* Auto-confirm progress */}
      {autoConfirmCountdown !== null && (
        <Box
          style={{
            position: 'absolute',
            top: 'var(--mantine-spacing-md)',
            left: 'var(--mantine-spacing-md)',
            right: 'var(--mantine-spacing-md)',
            zIndex: 10000,
          }}
        >
          <Stack gap="xs">
            <Text c="white" ta="center" size="sm">
              {t('timekeeper.clock.camera.autoConfirm', { seconds: autoConfirmCountdown })}
            </Text>
            <Progress
              value={(1 - autoConfirmCountdown / autoConfirmSeconds) * 100}
              color="green"
              size="sm"
              animated
            />
          </Stack>
        </Box>
      )}

      {/* Confirm/Retake buttons */}
      <Box
        style={{
          position: 'absolute',
          bottom: 'var(--mantine-spacing-xl)',
          left: 'var(--mantine-spacing-md)',
          right: 'var(--mantine-spacing-md)',
          zIndex: 10000,
        }}
      >
        <Group grow>
          <Button
            size="lg"
            variant="outline"
            color="white"
            leftSection={<IconRefresh size={20} />}
            onClick={onRetake}
            style={{
              borderColor: 'white',
              color: 'white',
            }}
          >
            {t('timekeeper.clock.camera.retake')}
          </Button>
          <Button size="lg" color="brand" leftSection={<IconCheck size={20} />} onClick={onConfirm}>
            {t('timekeeper.clock.camera.confirm')}
          </Button>
        </Group>
      </Box>
    </>
  );
}
