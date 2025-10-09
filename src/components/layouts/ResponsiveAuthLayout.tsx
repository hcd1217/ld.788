import { useDeviceType } from '@/hooks/useDeviceType';

import { AuthLayout } from './AuthLayout';
import { AuthLayoutMobile } from './AuthLayoutMobile';

export function ResponsiveAuthLayout() {
  const { isMobile } = useDeviceType();

  return isMobile ? <AuthLayoutMobile /> : <AuthLayout />;
}
