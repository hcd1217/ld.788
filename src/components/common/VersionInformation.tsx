import {Text} from '@mantine/core';
import {useAppStore} from '@/stores/useAppStore';

export function VersionInformation() {
  const {clientCode} = useAppStore();
  if (import.meta.env.PROD) return null;

  return (
    <Text
      c="dimmed"
      fz="xs"
      fw={400}
      w="100%"
      style={{fontStyle: 'italic'}}
      mt="xs"
    >
      {clientCode || 'No client code'}
      (v{import.meta.env.VITE_APP_VERSION} - {import.meta.env.VITE_APP_BUILD})
    </Text>
  );
}
