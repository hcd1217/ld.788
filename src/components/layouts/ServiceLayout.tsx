import { useState } from 'react';
import { Outlet } from 'react-router';
import { Center, Loader } from '@mantine/core';
import { useAppStore } from '@/stores/useAppStore';
import { PWAInstallPrompt, SafariPWAGuide } from '@/components/common';
import { RouteChangeProvider } from '@/components/providers/RouteChangeProvider';
import { useOnce } from '@/hooks/useOnce';

export function ServiceLayout() {
  const [ready, setReady] = useState(false);
  const { checkAuth, authInitialized } = useAppStore();

  useOnce(() => {
    run();
    async function run() {
      await checkAuth();
      setReady(true);
    }
  });

  if (!ready || !authInitialized) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <RouteChangeProvider>
      <Outlet />
      <PWAInstallPrompt />
      <SafariPWAGuide />
    </RouteChangeProvider>
  );
}
