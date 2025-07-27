import {Outlet} from 'react-router';
import {AuthLayout} from './AuthLayout';
import useIsDesktop from '@/hooks/useIsDesktop';

export function AppLayout() {
  const isDesktop = useIsDesktop();

  return isDesktop ? <AuthLayout /> : <Outlet />;
}
