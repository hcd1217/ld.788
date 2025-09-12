import { useMediaQuery } from '@mantine/hooks';

import { AuthLayout } from './AuthLayout';
import { AuthLayoutMobile } from './AuthLayoutMobile';

export function ResponsiveAuthLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile ? <AuthLayoutMobile /> : <AuthLayout />;
}
