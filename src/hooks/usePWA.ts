import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect, useRef, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { useLocalStorage } from '@mantine/hooks';
import { showSuccessNotification } from '@/utils/notifications';
import { useTranslation } from '@/hooks/useTranslation';

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
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

// Safari cache clearing utility
const clearSafariCaches = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  }
};

export function usePWA() {
  const { t } = useTranslation();
  const updateCheckInterval = useRef<number | undefined>(undefined);
  const lastNotificationTime = useRef<number>(0);
  const lastDetectedVersion = useRef<string>('');
  const [autoUpdate, setAutoUpdate] = useLocalStorage({
    key: 'pwa-auto-update',
    defaultValue: true,
  });
  const [storedVersion, setStoredVersion] = useLocalStorage({
    key: 'pwa-current-version',
    defaultValue: '',
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
        window.setInterval(
          () => {
            r.update();
          },
          30 * 60 * 1000,
        ); // 30 minutes for Safari
      }
    },
    onRegisterError(error) {
      console.error('PWA Service Worker registration error:', error);
    },
  });

  // LocalStorage-based version checking
  const checkForUpdates = useCallback(async () => {
    try {
      // Fetch current build from version.json
      const currentBuild = await fetchVersionWithRetry();

      if (!currentBuild) {
        console.error('Could not fetch current version, skipping update check');
        return;
      }

      // Initialize stored version if empty
      if (!storedVersion) {
        setStoredVersion(currentBuild);
        console.log('Initialized PWA version:', currentBuild);
        return;
      }

      // Check if current build differs from stored version
      if (currentBuild !== storedVersion) {
        console.log('New version detected:', currentBuild, '(previous:', storedVersion, ')');

        // Prevent duplicate notifications
        const now = Date.now();
        const timeSinceLastNotification = now - lastNotificationTime.current;
        const isSameVersion = lastDetectedVersion.current === currentBuild;

        // Skip if same version was already notified within last 10 minutes
        if (isSameVersion && timeSinceLastNotification < 10 * 60 * 1000) {
          console.log('Skipping duplicate notification for version:', currentBuild);
          return;
        }

        // Update tracking refs
        lastNotificationTime.current = now;
        lastDetectedVersion.current = currentBuild;

        if (isSafari() && isStandalone()) {
          // Clear all caches first for Safari
          await clearSafariCaches();

          // Safari in standalone mode - requires complete app restart
          notifications.show({
            id: 'safari-update',
            title: t('common.pwa.update.newVersionAvailable'),
            message: t('common.pwa.update.safari.closeCompletelyInstructions'),
            color: 'blue',
            autoClose: false,
            withCloseButton: true,
            onClose() {
              // Update stored version when user acknowledges update
              setStoredVersion(currentBuild);
            },
          });
        } else if (isChromium() && autoUpdate) {
          // Chrome with auto-update enabled
          notifications.show({
            id: 'auto-update',
            title: t('common.pwa.update.updating'),
            message: t('common.pwa.update.reloadIn3Seconds'),
            color: 'blue',
            autoClose: 3000,
          });

          setTimeout(() => {
            // Update stored version before reload
            setStoredVersion(currentBuild);
            updateServiceWorker(true);
            window.location.reload();
          }, 3000);
        } else {
          // Manual update for other cases
          notifications.show({
            id: 'manual-update',
            title: t('common.pwa.update.newVersionAvailable'),
            message: t('common.pwa.update.clickToUpdate'),
            color: 'blue',
            autoClose: false,
            onClick() {
              // Update stored version before reload
              setStoredVersion(currentBuild);
              updateServiceWorker(true);
              window.location.reload();
            },
          });
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }, [autoUpdate, updateServiceWorker, storedVersion, setStoredVersion, t]);

  // Setup localStorage-based version checking
  useEffect(() => {
    // Initial check immediately on mount
    void checkForUpdates();

    // Check on visibility change (app comes to foreground)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void checkForUpdates();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Optional periodic check every 30 minutes as fallback
    updateCheckInterval.current = window.setInterval(checkForUpdates, 30 * 60 * 1000);

    return () => {
      if (updateCheckInterval.current) {
        window.clearInterval(updateCheckInterval.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForUpdates]);

  // Handle needRefresh for service worker updates (only for cases not handled by app-level checking)
  useEffect(() => {
    if (needRefresh) {
      // Check if we already handled this through app-level version checking
      const now = Date.now();
      const recentlyNotified = now - lastNotificationTime.current < 5 * 60 * 1000; // 5 minutes

      if (recentlyNotified) {
        console.log('Skipping service worker notification - already handled by app-level check');
        return;
      }

      if (isChromium()) {
        if (autoUpdate) {
          // Auto-update after delay
          setTimeout(async () => {
            // Fetch and update stored version before reload
            const currentBuild = await fetchVersionWithRetry();
            if (currentBuild) {
              setStoredVersion(currentBuild);
            }
            updateServiceWorker(true);
            window.location.reload();
          }, 3000);

          notifications.show({
            id: 'pwa-updating',
            title: t('common.pwa.update.updating'),
            message: t('common.pwa.update.reloadAutomatically'),
            color: 'blue',
            autoClose: 3000,
          });
        } else {
          // Manual update prompt
          notifications.show({
            id: 'pwa-update-sw',
            title: t('common.pwa.update.newVersionAvailableForBrowser'),
            message: t('common.pwa.update.clickToUpdateShort'),
            color: 'blue',
            autoClose: false,
            onClick: async () => {
              // Fetch and update stored version before reload
              const currentBuild = await fetchVersionWithRetry();
              if (currentBuild) {
                setStoredVersion(currentBuild);
              }
              updateServiceWorker(true);
              window.location.reload();
            },
          });
        }
      } else {
        // For non-Chromium browsers
        notifications.show({
          id: 'pwa-update-sw',
          title: t('common.pwa.update.newVersionAvailableForBrowser'),
          message: t('common.pwa.update.newVersionOfApp', {
            appName: import.meta.env.VITE_APP_NAME || 'Credo',
          }),
          color: 'blue',
          autoClose: false,
          onClick: async () => {
            // Fetch and update stored version before reload
            const currentBuild = await fetchVersionWithRetry();
            if (currentBuild) {
              setStoredVersion(currentBuild);
            }
            updateServiceWorker(true);
            window.location.reload();
          },
        });
      }

      // Update tracking to prevent duplicate app-level notifications
      lastNotificationTime.current = now;
    }
  }, [needRefresh, autoUpdate, updateServiceWorker, setStoredVersion, t]);

  // Show offline ready notification
  useEffect(() => {
    if (offlineReady) {
      showSuccessNotification(
        t('common.pwa.update.offlineReady'),
        t('common.pwa.update.appAvailableOffline', {
          appName: import.meta.env.VITE_APP_NAME || 'Credo',
        }),
      );
    }
  }, [offlineReady, t]);

  return {
    offlineReady,
    needRefresh,
    autoUpdate,
    updateServiceWorker,
    setAutoUpdate,
    checkForUpdates,
    isStandalone: isStandalone(),
    isSafari: isSafari(),
    isChromium: isChromium(),
  };
}

// Fetch version from version.json with retry logic
async function fetchVersionWithRetry(retries = 3): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      // Fetch with cache-busting query parameter and no-cache headers
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch version: ${response.status}`);
      }

      const versionData = await response.json();
      return versionData.build;
    } catch (error) {
      console.error(`Failed to fetch version (attempt ${i + 1}/${retries}):`, error);
      if (i === retries - 1) {
        return null; // Return null after all retries failed
      }
      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  return null;
}
