import {useEffect, useState} from 'react';
import {useMediaQuery} from '@mantine/hooks';

export type Orientation = 'portrait' | 'landscape';

export function useOrientation(): {
  readonly orientation: Orientation;
  readonly isPortrait: boolean;
  readonly isLandscape: boolean;
  readonly isMobile: boolean;
} {
  const [orientation, setOrientation] = useState<Orientation>(() => {
    if (globalThis.window === undefined) {
      return 'portrait';
    }

    // Initial check - comparing width vs height works better on iOS
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  });

  // Check if device is mobile
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const handleOrientationChange = () => {
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
      globalThis.removeEventListener(
        'orientationchange',
        handleOrientationChange,
      );
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
