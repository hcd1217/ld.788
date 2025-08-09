import { type ReactNode, useCallback } from 'react';
import { useRouteChange } from '@/hooks/useRouteChange';
import { routeTracker } from '@/utils/routeTracking';
import { refreshNavigationCacheTTL } from '@/utils/navigationCache';
import { useTheme } from '@/hooks/useTheme';
import { getThemeForRoute } from '@/utils/routeTheme';
import { routeObjects } from '@/routers';

interface RouteChangeProviderProps {
  readonly children: ReactNode;
  readonly onRouteChange?: (from: string | null, to: string) => void;
}

/**
 * Provider component that handles global route change events
 * Place this at the root of your application to track all route changes
 */
export function RouteChangeProvider({ children, onRouteChange }: RouteChangeProviderProps) {
  const { themeName, setThemeName } = useTheme();

  const handleRouteChange = useCallback(
    (routeChange: { from: string | null; to: string; isFirstMount: boolean }) => {
      const { from, to, isFirstMount } = routeChange;

      // Extract theme from route configuration
      const newTheme = getThemeForRoute(to, routeObjects) || 'elegant';

      // Update theme if changed (useLocalStorage handles persistence)
      if (themeName !== newTheme) {
        setThemeName(newTheme);
      }

      // Track route change
      routeTracker.track(from, to);

      // Refresh navigation cache TTL on user activity
      refreshNavigationCacheTTL();

      // Scroll to top on route change (common UX pattern)
      if (!isFirstMount && typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Call custom handler if provided
      if (onRouteChange) {
        onRouteChange(from, to);
      }

      // Additional route-specific logic can be added here
      // For example:
      // - Clear form data
      // - Reset specific store states
      // - Trigger data fetching
      // - Update breadcrumbs
      // - Clear errors from error store
    },
    [themeName, setThemeName, onRouteChange],
  );

  useRouteChange(handleRouteChange);

  return <>{children}</>;
}
