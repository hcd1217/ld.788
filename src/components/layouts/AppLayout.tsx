import { Outlet } from 'react-router';

import { useDeviceType } from '@/hooks/useDeviceType';

import { AuthLayout } from './AuthLayout';

export function AppLayout() {
  const { isDesktop } = useDeviceType();

  return isDesktop ? <AuthLayout /> : <Outlet />;
}
