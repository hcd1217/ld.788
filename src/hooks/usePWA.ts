import {useRegisterSW} from 'virtual:pwa-register/react';
import {useEffect, useRef, useCallback} from 'react';
import {notifications} from '@mantine/notifications';
import {useLocalStorage} from '@mantine/hooks';
import {showSuccessNotification} from '@/utils/notifications';

// Browser detection utilities
const isChromium = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('chrome') || ua.includes('chromium') || ua.includes('edg');
};

const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android');
};

const isStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as any).standalone === true;
};

// Safari cache clearing utility
const clearSafariCaches = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  }
};

export function usePWA() {
  const updateCheckInterval = useRef<number | undefined>(undefined);
  const [autoUpdate, setAutoUpdate] = useLocalStorage({
    key: 'pwa-auto-update',
    defaultValue: true,
  });
  
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('PWA Service Worker registered:', r);
      
      // More aggressive update checks for Safari
      if (r && isSafari()) {
        window.setInterval(() => {
          r.update();
        }, 30 * 60 * 1000); // 30 minutes for Safari
      }
    },
    onRegisterError(error) {
      console.error('PWA Service Worker registration error:', error);
    },
  });

  // Application-level version checking
  const checkForUpdates = useCallback(async () => {
    try {
      const currentBuild = import.meta.env.VITE_APP_BUILD as string;
      // Enhanced cache-busting for version requests
      const response = await fetch(`/version.json?t=${Date.now()}&v=${Math.random()}`);
      const serverVersion = await response.json();
      
      if (serverVersion.build && serverVersion.build !== currentBuild) {
        console.log('New version detected:', serverVersion.build);
        
        if (isSafari() && isStandalone()) {
          // Clear all caches first for Safari
          await clearSafariCaches();
          
          // Safari in standalone mode - requires complete app restart
          notifications.show({
            id: 'safari-update',
            title: 'New Version Available',
            message: 'Close Safari completely (swipe up → swipe app away), then reopen from home screen.',
            color: 'blue',
            autoClose: false,
            withCloseButton: true,
          });
        } else if (isChromium() && autoUpdate) {
          // Chrome with auto-update enabled
          notifications.show({
            id: 'auto-update',
            title: 'Updating...',
            message: 'The app will reload in 3 seconds.',
            color: 'blue',
            autoClose: 3000,
          });
          
          setTimeout(() => {
            updateServiceWorker(true);
            window.location.reload();
          }, 3000);
        } else {
          // Manual update for other cases
          notifications.show({
            id: 'manual-update',
            title: 'New Version Available',
            message: 'Click here to update now.',
            color: 'blue',
            autoClose: false,
            onClick() {
              updateServiceWorker(true);
              window.location.reload();
            },
          });
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }, [autoUpdate, updateServiceWorker]);

  // Setup periodic version checking
  useEffect(() => {
    // Initial check after 30 seconds
    const initialCheck = setTimeout(checkForUpdates, 30000);
    
    // Periodic checks every 5 minutes for Chrome, 10 minutes for Safari
    const interval = isSafari() ? 10 * 60 * 1000 : 5 * 60 * 1000;
    updateCheckInterval.current = window.setInterval(checkForUpdates, interval);
    
    // Check on visibility change (app comes to foreground)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void checkForUpdates();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearTimeout(initialCheck);
      if (updateCheckInterval.current) {
        window.clearInterval(updateCheckInterval.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForUpdates]);

  // Handle needRefresh for Chromium browsers
  useEffect(() => {
    if (needRefresh && isChromium()) {
      if (autoUpdate) {
        // Auto-update after delay
        setTimeout(() => {
          updateServiceWorker(true);
          window.location.reload();
        }, 3000);
        
        notifications.show({
          id: 'pwa-updating',
          title: 'Updating...',
          message: 'The app will reload automatically.',
          color: 'blue',
          autoClose: 3000,
        });
      } else {
        // Manual update prompt
        notifications.show({
          id: 'pwa-update',
          title: 'New version available',
          message: 'Click to update now.',
          color: 'blue',
          autoClose: false,
          onClick() {
            updateServiceWorker(true);
            window.location.reload();
          },
        });
      }
    } else if (needRefresh && !isChromium()) {
      // For non-Chromium browsers
      notifications.show({
        id: 'pwa-update',
        title: 'New version available',
        message: 'A new version of Credo App is available. Click to update.',
        color: 'blue',
        autoClose: false,
        onClick() {
          updateServiceWorker(true);
          window.location.reload();
        },
      });
    }
  }, [needRefresh, autoUpdate, updateServiceWorker]);

  // Show offline ready notification
  useEffect(() => {
    if (offlineReady) {
      showSuccessNotification(
        'Ready to work offline',
        'Credo App is now available offline!',
      );
    }
  }, [offlineReady]);

  return {
    offlineReady,
    needRefresh,
    updateServiceWorker,
    autoUpdate,
    setAutoUpdate,
    checkForUpdates,
    isStandalone: isStandalone(),
    isSafari: isSafari(),
    isChromium: isChromium(),
  };
}