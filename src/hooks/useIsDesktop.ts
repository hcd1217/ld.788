import {useMediaQuery} from '@mantine/hooks';

export function useIsDesktop() {
  return useMediaQuery('(min-width: 768px)');
}
