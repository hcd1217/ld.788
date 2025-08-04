import { Center, Loader, Stack } from '@mantine/core';

export function AppLoader() {
  return (
    <Center style={{ height: '100vh', width: '100%' }}>
      <Stack align="center" gap="md">
        <Loader size="lg" />
      </Stack>
    </Center>
  );
}
