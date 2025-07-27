import {useMantineColorScheme} from '@mantine/core';

export default function useIsDarkMode() {
  const {colorScheme} = useMantineColorScheme();
  return colorScheme === 'dark';
}
