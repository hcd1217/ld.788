import {type ReactNode} from 'react';
import {Navigate} from 'react-router';
import {useAppStore} from '@/stores/useAppStore';

type AdminProtectedRouteProps = {
  readonly children: ReactNode;
};

export function AdminProtectedRoute({
  children,
}: AdminProtectedRouteProps): ReactNode {
  const {adminAuthenticated} = useAppStore();

  if (!adminAuthenticated) {
    return <Navigate replace to="/admin/login" />;
  }

  return children;
}
