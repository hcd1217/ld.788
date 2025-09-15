import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

import { useAppStore } from '@/stores/useAppStore';
import { isDevelopment } from '@/utils/env';

export function ColorSchemeToggle() {
  const { publicClientConfig } = useAppStore();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });

  if (!publicClientConfig?.features?.darkMode && !isDevelopment) {
    return null;
  }

  return (
    <ActionIcon
      variant="default"
      size="lg"
      onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
    >
      {computedColorScheme === 'light' ? <IconMoon stroke={1.5} /> : <IconSun stroke={1.5} />}
    </ActionIcon>
  );
}
