import {Navigate, Outlet} from 'react-router';
import {useAppStore} from '@/stores/useAppStore';

export function RootUserLayout() {
  const {user} = useAppStore();

  if (!user?.isRoot) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}
