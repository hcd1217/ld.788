import { useEffect, useRef } from 'react';

import { useLocation } from 'react-router';

export interface RouteChangeHandler {
  readonly from: string | null;
  readonly to: string;
  readonly isFirstMount: boolean;
}

/**
 * Hook to detect and handle route changes
 * @param handler - Callback function triggered on route change
 * @param dependencies - Optional dependencies to re-run effect
 */
export function useRouteChange(
  handler: (routeChange: RouteChangeHandler) => void,
  dependencies: readonly unknown[] = [],
) {
  const location = useLocation();
  const previousPath = useRef<string | null>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    const currentPath = location.pathname;

    // Skip on first mount unless explicitly needed
    if (isFirstMount.current) {
      handler({
        from: null,
        to: currentPath,
        isFirstMount: true,
      });
      isFirstMount.current = false;
      previousPath.current = currentPath;
      return;
    }

    // Only trigger if path actually changed
    if (previousPath.current !== currentPath) {
      handler({
        from: previousPath.current,
        to: currentPath,
        isFirstMount: false,
      });
      previousPath.current = currentPath;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, ...dependencies]);
}

/**
 * Hook to get current route information
 * Useful for components that need to know current route without change detection
 */
export function useCurrentRoute() {
  const location = useLocation();

  return {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    fullPath: `${location.pathname}${location.search}${location.hash}`,
  };
}
