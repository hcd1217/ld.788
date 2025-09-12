import { useState } from 'react';

import { Outlet } from 'react-router';

import { Center, Loader } from '@mantine/core';

import { PWAInstallPrompt, SafariPWAGuide } from '@/components/common';
import { RouteChangeProvider } from '@/components/providers/RouteChangeProvider';
import { useOnce } from '@/hooks/useOnce';
import { useAppStore } from '@/stores/useAppStore';

const debug = true;

export function ServiceLayout() {
  const [ready, setReady] = useState(false);
  const { checkAuth, authInitialized } = useAppStore();

  useOnce(() => {
    run();
    async function run() {
      // Always check auth on initial load to ensure proper initialization
      // checkAuth() will preserve existing authenticated state
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
      {debug && (
        <>
          <PWAInstallPrompt />
          <SafariPWAGuide />
        </>
      )}
    </RouteChangeProvider>
  );
}
