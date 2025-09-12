import { useMemo } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/stores/useAppStore';
import { getMobileNavigationItems, getNavigationItems } from '@/utils/navigation';

/**
 * Custom hook for getting navigation items with role-based access control
 * Handles both desktop and mobile navigation with backend/static fallback
 */
function useNavigationItems(isMobile = false) {
  const { t } = useTranslation();

  // Use selectors to only subscribe to needed state changes
  const user = useAppStore((state) => state.user);

  // Get navigation items from backend or static fallback
  const navigationItems = useMemo(() => {
    // Extract role names from user profile
    const userRoles = [user?.department?.code || ''];

    // Extract navigation overrides from user profile
    const navigationOverrides = user?.navigationOverrides;

    // Use mobile or desktop navigation service based on isMobile flag
    if (isMobile) {
      return getMobileNavigationItems(
        user?.clientConfig?.mobileNavigation,
        t,
        userRoles,
        navigationOverrides,
      );
    }

    return getNavigationItems(
      user?.clientConfig?.navigation,
      t,
      userRoles,
      navigationOverrides,
    );
  }, [user, t, isMobile]);

  return {
    navigationItems,
    userProfile: user, // Keep as userProfile for backward compatibility
  };
}

/**
 * Convenience hook for desktop navigation
 */
export function useDesktopNavigation() {
  return useNavigationItems(false);
}

/**
 * Convenience hook for mobile navigation
 */
export function useMobileNavigation() {
  return useNavigationItems(true);
}
