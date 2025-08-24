import { useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { GetMeResponse } from '@/lib/api/schemas/auth.schemas';
import { getNavigationItems, getMobileNavigationItems } from '@/services/navigationService';
import { skipEmpty, unique } from '@/utils/array';

// Stable empty object reference to avoid infinite loops
const EMPTY_ROUTE_CONFIG = {};

/**
 * Custom hook for getting navigation items with role-based access control
 * Handles both desktop and mobile navigation with backend/static fallback
 */
function useNavigationItems(isMobile = false) {
  const { t } = useTranslation();

  // Use selectors to only subscribe to needed state changes
  const user = useAppStore((state) => state.user);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const routeConfig = user?.routeConfig || EMPTY_ROUTE_CONFIG;

  // Get navigation items from backend or static fallback
  const navigationItems = useMemo(() => {
    // Extract role names from user profile
    const userRoles = skipEmpty(
      unique([
        ...(user?.roles?.map((role: GetMeResponse['roles'][number]) => role.name) || []),
        user?.department?.code || '',
      ]),
    );

    // If authenticated but user not loaded yet, show full menu
    const isProfileLoading = isAuthenticated && !user;

    // Use mobile or desktop navigation service based on isMobile flag
    if (isMobile) {
      return getMobileNavigationItems(
        user?.clientConfig?.mobileNavigation,
        t,
        routeConfig,
        userRoles,
        isProfileLoading,
      );
    }

    return getNavigationItems(
      user?.clientConfig?.navigation,
      t,
      routeConfig,
      userRoles,
      isProfileLoading,
    );
  }, [user, t, routeConfig, isAuthenticated, isMobile]);

  return {
    navigationItems,
    userProfile: user, // Keep as userProfile for backward compatibility
    isProfileLoading: isAuthenticated && !user,
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
