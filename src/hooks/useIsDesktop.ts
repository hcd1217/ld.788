import {useMediaQuery} from '@mantine/hooks';

export default function useIsDesktop() {
  return useMediaQuery('(min-width: 768px)');
}
