import {AppShell, Group} from '@mantine/core';
import {Outlet, Navigate} from 'react-router';
import {type ReactNode} from 'react';
import {
  ColorSchemeToggle,
  LanguageSwitcher,
  AppLogo,
} from '@/components/common';
import {useAppStore} from '@/stores/useAppStore';
import {AdminLoadingOverlay} from '@/components/admin/AdminLoadingOverlay';

export function AdminProtectedRoute(): ReactNode {
  const {adminAuthenticated} = useAppStore();

  if (!adminAuthenticated) {
    return <Navigate replace to="/admin/login" />;
  }

  return (
    <>
      <AppShell header={{height: 60}} padding="md">
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <AppLogo link="/admin/dashboard" />
            <Group>
              <LanguageSwitcher />
              <ColorSchemeToggle />
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
      <AdminLoadingOverlay />
    </>
  );
}
