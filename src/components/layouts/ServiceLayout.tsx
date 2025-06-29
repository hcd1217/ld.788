import {useEffect, useState} from 'react';
import {Outlet, useNavigate, useParams} from 'react-router';
import {Center, Loader} from '@mantine/core';
import {useAppStore} from '@/stores/useAppStore';
import {PWAInstallPrompt} from '@/components/common/PWAInstallPrompt';

export function ServiceLayout() {
  const params = useParams();
  const [ready, setReady] = useState(false);
  const {setClientCode, checkAuth} = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    run();
    async function run() {
      await checkAuth();
      setReady(true);
    }
  }, [checkAuth, navigate]);

  useEffect(() => {
    if (params.clientCode) {
      setClientCode(params.clientCode);
    }
  }, [params.clientCode, setClientCode]);

  if (!ready) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <>
      <Outlet />
      <PWAInstallPrompt />
    </>
  );
}
