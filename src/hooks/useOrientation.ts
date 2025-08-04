import { useEffect, useState } from 'react';

export type Orientation = 'portrait' | 'landscape';

export function useOrientation(): {
  readonly orientation: Orientation;
  readonly isPortrait: boolean;
  readonly isLandscape: boolean;
  readonly isMobile: boolean;
} {
  // Check if device is mobile
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>('portrait');

  useEffect(() => {
    const handleOrientationChange = () => {
      const isMobile = Math.min(window.innerWidth, window.innerHeight) < 600;
      setIsMobile(isMobile);
      if (!isMobile) {
        return;
      }

      // Use window dimensions for iOS compatibility
      const isLandscape = window.innerWidth > window.innerHeight;
      setOrientation(isLandscape ? 'landscape' : 'portrait');
    };

    // Listen to both resize and orientationchange events for better compatibility
    window.addEventListener('resize', handleOrientationChange);
    globalThis.addEventListener('orientationchange', handleOrientationChange);

    // Also check on visibility change (when app comes back to foreground)
    document.addEventListener('visibilitychange', handleOrientationChange);

    // Initial check
    handleOrientationChange();

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      globalThis.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('visibilitychange', handleOrientationChange);
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    isMobile: isMobile ?? false,
  };
}
