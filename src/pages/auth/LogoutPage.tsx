import { ROUTERS } from '@/config/routeConfig';
import { useAppStore } from '@/stores/useAppStore';
import { LoadingOverlay } from '@mantine/core';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export function LogoutPage() {
  const { logout } = useAppStore();
  const navigate = useNavigate();
  useEffect(() => {
    logout();
    navigate(ROUTERS.LOGIN);
  }, [logout, navigate]);

  return <LoadingOverlay visible={true} />;
}
