import {
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
} from '@mantine/core';
import {IconSun, IconMoon} from '@tabler/icons-react';

export function ColorSchemeToggle() {
  const {setColorScheme} = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });

  return (
    <ActionIcon
      variant="default"
      size="lg"
      aria-label="Toggle color scheme"
      onClick={() =>
        setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')
      }
    >
      {computedColorScheme === 'light' ? (
        <IconMoon stroke={1.5} />
      ) : (
        <IconSun stroke={1.5} />
      )}
    </ActionIcon>
  );
}
