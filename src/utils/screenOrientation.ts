/**
 * Screen Orientation Lock utility
 * Handles portrait-only orientation lock for PWA
 */

type OrientationLockType = 'portrait' | 'landscape';

type ScreenOrientationAPI = {
  lock: (orientation: OrientationLockType) => Promise<void>;
  unlock: () => void;
};

/**
 * Attempts to lock screen orientation to portrait
 * Returns true if successful, false otherwise
 */
export async function lockToPortrait(): Promise<boolean> {
  try {
    // Check if the Screen Orientation API is available
    const screen = window.screen as Screen & {
      orientation?: ScreenOrientationAPI;
    };

    if (!screen.orientation?.lock) {
      console.warn('Screen Orientation API not supported');
      return false;
    }

    // Check if we're in a PWA context (standalone or fullscreen)
    const isStandalone =
      globalThis.matchMedia('(display-mode: standalone)').matches ||
      globalThis.matchMedia('(display-mode: fullscreen)').matches ||
      (globalThis.navigator as {standalone?: boolean}).standalone === true; // IOS specific

    if (!isStandalone) {
      console.info('Orientation lock only works in PWA standalone mode');
      return false;
    }

    // Attempt to lock orientation
    await screen.orientation.lock('portrait');
    console.info('Screen orientation locked to portrait');
    return true;
  } catch (error) {
    // This can fail for various reasons:
    // - Not in fullscreen/PWA mode
    // - User hasn't interacted with the page yet
    // - Device doesn't support orientation lock
    console.warn('Failed to lock screen orientation:', error);
    return false;
  }
}

/**
 * Unlocks screen orientation
 */
export function unlockOrientation(): void {
  try {
    const screen = window.screen as Screen & {
      orientation?: ScreenOrientationAPI;
    };

    if (screen.orientation?.unlock) {
      screen.orientation.unlock();
      console.info('Screen orientation unlocked');
    }
  } catch (error) {
    console.warn('Failed to unlock screen orientation:', error);
  }
}

/**
 * Initialize orientation lock with retry on user interaction
 * This is necessary because iOS requires user interaction for certain APIs
 */
export function initializeOrientationLock(): void {
  // Try to lock immediately (might work if already in PWA mode)
  void lockToPortrait();

  // Also try on first user interaction
  let hasAttempted = false;
  const attemptLock = async () => {
    if (!hasAttempted) {
      hasAttempted = true;
      await lockToPortrait();
      // Remove listeners after first attempt
      document.removeEventListener('click', attemptLock);
      document.removeEventListener('touchstart', attemptLock);
    }
  };

  // Add listeners for user interaction
  document.addEventListener('click', attemptLock, {once: true});
  document.addEventListener('touchstart', attemptLock, {once: true});

  // Also try when app gains focus (in case user switches back)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      void lockToPortrait();
    }
  });

  // Try again if orientation changes (user might have rotated before lock)
  globalThis.addEventListener('orientationchange', () => {
    void lockToPortrait();
  });
}
