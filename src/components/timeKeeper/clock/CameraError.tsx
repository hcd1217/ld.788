import { Box, Group, Text } from '@mantine/core';

interface CameraErrorProps {
  readonly error: string;
}

export function CameraError({ error }: CameraErrorProps) {
  return (
    <Box
      style={{
        position: 'absolute',
        bottom: 'var(--mantine-spacing-xl)',
        left: 'var(--mantine-spacing-md)',
        right: 'var(--mantine-spacing-md)',
        zIndex: 10000,
      }}
    >
      <Group justify="center">
        <Text c="white" ta="center">
          {error}
        </Text>
      </Group>
    </Box>
  );
}
