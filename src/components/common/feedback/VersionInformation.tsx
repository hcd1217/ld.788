import { useEffect, useState } from 'react';

import { Text } from '@mantine/core';

import { STORAGE_KEYS } from '@/utils/storageKeys';

export function VersionInformation() {
  const [clientCode, setClientCode] = useState('');
  useEffect(() => {
    setTimeout(() => {
      setClientCode(localStorage.getItem(STORAGE_KEYS.AUTH.CLIENT_CODE) ?? '');
    }, 200);
  }, []);
  if (!clientCode) {
    return null;
  }

  return (
    <Text c="dimmed" fz={10} fw={400} w="100%" ta="right" style={{ fontStyle: 'italic' }} pr="sm">
      {clientCode} (v{import.meta.env.VITE_APP_VERSION} - {import.meta.env.VITE_APP_BUILD})
    </Text>
  );
}
