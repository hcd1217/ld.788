import { useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { getNavigationItems, getMobileNavigationItems } from '@/services/navigationService';

// Stable empty object reference to avoid infinite loops
const EMPTY_ROUTE_CONFIG = {};

/**
 * Custom hook for getting navigation items with role-based access control
 * Handles both desktop and mobile navigation with backend/static fallback
 */
function useNavigationItems(isMobile = false) {
  const { t } = useTranslation();

  // Use selectors to only subscribe to needed state changes
  const userProfile = useAppStore((state) => state.userProfile);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const routeConfig = userProfile?.routeConfig || EMPTY_ROUTE_CONFIG;

  // Get navigation items from backend or static fallback
  const navigationItems = useMemo(() => {
    // Extract role names from user profile
    const userRoles = userProfile?.roles?.map((role) => role.name) || [];

    // If authenticated but userProfile not loaded yet, show full menu
    const isProfileLoading = isAuthenticated && !userProfile;

    // Use mobile or desktop navigation service based on isMobile flag
    if (isMobile) {
      return getMobileNavigationItems(
        userProfile?.clientConfig?.mobileNavigation,
        t,
        routeConfig,
        userRoles,
        isProfileLoading,
      );
    }

    return getNavigationItems(
      userProfile?.clientConfig?.navigation,
      t,
      routeConfig,
      userRoles,
      isProfileLoading,
    );
  }, [userProfile, t, routeConfig, isAuthenticated, isMobile]);

  return {
    navigationItems,
    userProfile,
    isProfileLoading: isAuthenticated && !userProfile,
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
