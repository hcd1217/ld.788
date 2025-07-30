import {useRegisterSW} from 'virtual:pwa-register/react';
import {useEffect} from 'react';
import {notifications} from '@mantine/notifications';

export function usePWA() {
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('PWA Service Worker registered:', r);
    },
    onRegisterError(error) {
      console.error('PWA Service Worker registration error:', error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      notifications.show({
        title: 'Ready to work offline',
        message: 'CMngt App is now available offline!',
        color: 'green',
      });
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) {
      notifications.show({
        id: 'pwa-update',
        title: 'New version available',
        message: 'A new version of CMngt App is available. Click to update.',
        color: 'blue',
        autoClose: false,
        onClick() {
          updateServiceWorker(true);
        },
      });
    }
  }, [needRefresh, updateServiceWorker]);

  return {
    offlineReady,
    needRefresh,
    updateServiceWorker,
  };
}
