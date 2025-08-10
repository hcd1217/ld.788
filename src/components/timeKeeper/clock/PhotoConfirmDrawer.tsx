import { Drawer, Image, Stack, Button, Group, Text, Box } from '@mantine/core';
import { IconCheck, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface PhotoConfirmDrawerProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly onRetake: () => void;
  readonly photo: string | null;
}

export function PhotoConfirmDrawer({
  opened,
  onClose,
  onConfirm,
  onRetake,
  photo,
}: PhotoConfirmDrawerProps) {
  const { t } = useTranslation();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="auto"
      withCloseButton={false}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <Stack gap={0}>
        {/* Photo preview */}
        {photo && (
          <Box style={{ maxHeight: '60vh', display: 'flex', justifyContent: 'center' }}>
            <Image
              src={photo}
              alt="Captured photo"
              fit="contain"
              style={{ maxWidth: '100%', maxHeight: '60vh' }}
            />
          </Box>
        )}

        {/* Actions */}
        <Stack p="md" gap="md">
          <Text ta="center" size="lg" fw={500}>
            {t('timekeeper.clock.camera.useThisPhoto')}
          </Text>

          <Group grow>
            <Button
              size="lg"
              variant="outline"
              leftSection={<IconRefresh size={20} />}
              onClick={onRetake}
            >
              {t('timekeeper.clock.camera.retake')}
            </Button>
            <Button size="lg" leftSection={<IconCheck size={20} />} onClick={onConfirm}>
              {t('timekeeper.clock.camera.confirm')}
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Drawer>
  );
}
