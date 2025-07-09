import {Text} from '@mantine/core';

export function VersionInformation() {
  return (
    <Text
      c="dimmed"
      fz="xs"
      fw={400}
      w="100%"
      ta="right"
      style={{fontStyle: 'italic'}}
      pr="sm"
    >
      v{import.meta.env.VITE_APP_VERSION} - {import.meta.env.VITE_APP_BUILD}
    </Text>
  );
}
