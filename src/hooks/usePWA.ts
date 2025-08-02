import {useRegisterSW} from 'virtual:pwa-register/react';
import {useEffect} from 'react';
import {notifications} from '@mantine/notifications';
import {showSuccessNotification} from '@/utils/notifications';

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
      showSuccessNotification(
        'Ready to work offline',
        'Credo App is now available offline!',
      );
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) {
      // For PWA update, we need to use the native API directly for onClick support
      notifications.show({
        id: 'pwa-update',
        title: 'New version available',
        message: 'A new version of Credo App is available. Click to update.',
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
