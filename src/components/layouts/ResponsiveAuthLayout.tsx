import { AuthLayout } from './AuthLayout';
import { AuthLayoutMobile } from './AuthLayoutMobile';
import { useDeviceType } from '@/hooks/useDeviceType';

export function ResponsiveAuthLayout() {
  const { isMobile } = useDeviceType();

  return isMobile ? <AuthLayoutMobile /> : <AuthLayout />;
}
