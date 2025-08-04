import { Navigate } from 'react-router';
import { useAppStore } from '@/stores/useAppStore';

export function TopPage() {
  const { isAuthenticated } = useAppStore();
  return <Navigate to={isAuthenticated ? '/home' : '/login'} />;
}
