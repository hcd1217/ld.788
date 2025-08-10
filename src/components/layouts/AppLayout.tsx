import { Outlet } from 'react-router';
import { AuthLayout } from './AuthLayout';
import { useDeviceType } from '@/hooks/useDeviceType';

export function AppLayout() {
  const { isDesktop } = useDeviceType();

  return isDesktop ? <AuthLayout /> : <Outlet />;
}
