import type { NavigationItemType as BackendNavigationItem } from '@/lib/api/schemas/clientConfig.schemas';
import type { NavigationItem as FrontendNavigationItem } from '@/components/layouts/types';
import { getIcon } from '@/utils/iconRegistry';
import { getRoute } from '@/config/routeConfig';
import { NAVIGATION_STRUCTURE, MOBILE_NAVIGATION_STRUCTURE } from '@/config/navigationConfig';
// Translation function type is 'any' to match existing NavBar.tsx pattern

/**
 * Transforms a single backend navigation item to frontend format
 * @param item Backend navigation item from API
 * @param t Translation function for i18n
 * @returns Frontend navigation item with resolved icon component
 */
function transformBackendItem(item: BackendNavigationItem, t: any): FrontendNavigationItem {
  const iconComponent = getIcon(item.icon);

  const frontendItem: FrontendNavigationItem = {
    id: item.id,
    label: t(item.translationKey),
    icon: iconComponent,
    path: item.path ? getRoute(item.path) : undefined,
    hidden: item.hidden,
    disabled: item.disabled,
    activePaths: item.activePaths
      ?.map((routeId) => getRoute(routeId))
      .filter((route): route is string => route !== undefined),
  };

  // Transform nested items recursively
  if (item.subs?.length) {
    frontendItem.subs = item.subs.map((subItem) => transformBackendItem(subItem, t));
  }

  return frontendItem;
}

/**
 * Transforms backend navigation array to frontend format
 * @param items Backend navigation items from API
 * @param t Translation function
 * @returns Array of frontend navigation items
 */
function transformBackendNavigation(
  items: BackendNavigationItem[],
  t: any,
): FrontendNavigationItem[] {
  // Sort by order if provided
  const sortedItems = [...items].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    return orderA - orderB;
  });

  return sortedItems.map((item) => transformBackendItem(item, t));
}

interface StaticNavigationItem {
  hidden?: boolean;
  path?: string;
  activePaths?: readonly string[];
  id: string;
  subs?: readonly StaticNavigationItem[];
}
/**
 * Transforms static navigation structure to frontend format
 * Used as fallback when backend navigation is not available
 * @param staticNav Static navigation configuration
 * @param t Translation function
 * @param routeConfig Optional route permissions
 * @param skipHiddenFilter Skip filtering of hidden items (useful when profile is loading)
 * @returns Array of frontend navigation items
 */
export function transformStaticNavigation(
  staticNav: readonly StaticNavigationItem[],
  t: any,
  routeConfig?: Record<string, boolean>,
  skipHiddenFilter?: boolean,
): FrontendNavigationItem[] {
  return staticNav
    .filter((item: StaticNavigationItem) => {
      // Skip filtering hidden items if profile is loading to show full menu
      if (!skipHiddenFilter && 'hidden' in item && item.hidden) {
        return false;
      }
      // Filter by route permissions if available
      if ('path' in item && item.path && routeConfig && !routeConfig[item.path]) {
        return false;
      }
      return true;
    })
    .map((item: any) => {
      const frontendItem: FrontendNavigationItem = {
        id: item.id,
        label: t(item.translationKey),
        icon: item.icon,
        path: 'path' in item ? item.path : undefined,
        activePaths: 'activePaths' in item && item.activePaths ? [...item.activePaths] : undefined,
      };

      // Transform sub-items
      if ('subs' in item && item.subs) {
        frontendItem.subs = item.subs
          .filter((sub: any) => {
            // Skip filtering hidden items if profile is loading
            if (!skipHiddenFilter && 'hidden' in sub && sub.hidden) {
              return false;
            }
            if ('path' in sub && sub.path && routeConfig && !routeConfig[sub.path]) {
              return false;
            }
            return true;
          })
          .map((sub: any) => ({
            id: sub.id,
            label: t(sub.translationKey),
            icon: sub.icon,
            path: 'path' in sub ? sub.path : undefined,
            activePaths: 'activePaths' in sub && sub.activePaths ? [...sub.activePaths] : undefined,
          }));
      }

      return frontendItem;
    });
}

/**
 * Gets navigation items with backend priority and static fallback
 * @param backendNav Optional backend navigation configuration
 * @param t Translation function
 * @param routeConfig Optional route permissions for static navigation
 * @param userRoles Optional user roles for role-based filtering
 * @param isProfileLoading Whether the user profile is still loading
 * @returns Array of frontend navigation items ready for rendering
 */
export function getNavigationItems(
  backendNav: BackendNavigationItem[] | undefined,
  /**
   * Don't use
   *    t: (key: string, options?: Record<string, unknown>) => string,
   * because of this error:
   *    Type instantiation is excessively deep and possibly infinite.ts(2589)
   * in src/components/layouts/NavBar.tsx
   *  // Get navigation items from backend or static fallback
   *  // Backend navigation takes priority if available
   *  const navigationItems = useMemo(() => {
   *    return getNavigationItems(userProfile?.clientConfig?.navigation, t, routeConfig);
   *  }, [userProfile, t, routeConfig]);
   */
  t: any,
  routeConfig?: Record<string, boolean>,
  userRoles?: string[],
  isProfileLoading?: boolean,
): FrontendNavigationItem[] {
  // Use backend navigation if available
  if (backendNav?.length) {
    // Apply role-based access control if user roles are provided
    const processedNav = userRoles ? applyRoleBasedAccess(backendNav, userRoles) : backendNav;
    return transformBackendNavigation(processedNav, t);
  }

  // Fallback to static navigation
  // When profile is loading, don't filter out hidden items to avoid showing minimal menu
  return transformStaticNavigation(NAVIGATION_STRUCTURE, t, routeConfig, isProfileLoading);
}

/**
 * Applies role-based access control to navigation items
 * Marks items as disabled if user lacks required roles
 * @param items Navigation items to process
 * @param userRoles User's current roles
 * @returns Navigation items with disabled state applied based on roles
 */
function applyRoleBasedAccess(
  items: BackendNavigationItem[],
  userRoles: string[],
): BackendNavigationItem[] {
  return items.map((item) => {
    // Create a new item to avoid mutation
    const newItem = { ...item };

    // Check if user has required role (if roles are specified)
    const hasRequiredRole =
      !item.roles?.length || item.roles.some((role) => userRoles.includes(role));

    // Mark as disabled if user lacks required role
    if (!hasRequiredRole) {
      newItem.disabled = true;
    }

    // Process sub-items recursively
    if (item.subs?.length) {
      const processedSubs = applyRoleBasedAccess(item.subs, userRoles);

      // If parent is disabled, all children should be disabled too
      if (newItem.disabled) {
        newItem.subs = processedSubs.map((sub) => ({ ...sub, disabled: true }));
      } else {
        newItem.subs = processedSubs;
      }

      // If parent has no path and all children are disabled, disable parent too
      if (!newItem.path && processedSubs.every((sub) => sub.disabled)) {
        newItem.disabled = true;
      }
    }

    return newItem;
  });
}

/**
 * Filters navigation items based on feature flags
 * @param items Navigation items to filter
 * @param enabledFlags Enabled feature flags
 * @returns Filtered navigation items
 */
export function filterNavigationByFeatureFlags(
  items: BackendNavigationItem[],
  enabledFlags: string[],
): BackendNavigationItem[] {
  return items
    .map((item) => {
      // If no feature flags specified, item is always enabled
      if (!item.featureFlags?.length) {
        // Filter sub-items if they exist
        if (item.subs?.length) {
          const filteredSubs = filterNavigationByFeatureFlags(item.subs, enabledFlags);
          if (filteredSubs.length !== item.subs.length) {
            return { ...item, subs: filteredSubs };
          }
        }
        return item;
      }

      // Check if all required feature flags are enabled
      const allFlagsEnabled = item.featureFlags.every((flag) => enabledFlags.includes(flag));
      if (!allFlagsEnabled) {
        return null;
      }

      // Filter sub-items recursively
      if (item.subs?.length) {
        const filteredSubs = filterNavigationByFeatureFlags(item.subs, enabledFlags);
        // Keep parent with filtered sub-items
        if (filteredSubs.length > 0) {
          return { ...item, subs: filteredSubs };
        }
        // Remove parent if no sub-items are accessible and parent has no path
        if (!item.path) {
          return null;
        }
      }

      return item;
    })
    .filter((item): item is BackendNavigationItem => item !== null);
}

/**
 * Gets mobile navigation items with backend priority and static fallback
 * @param backendMobileNav Optional backend mobile navigation configuration
 * @param t Translation function
 * @param routeConfig Optional route permissions for static navigation
 * @param userRoles Optional user roles for role-based filtering
 * @param isProfileLoading Whether the user profile is still loading
 * @returns Array of frontend navigation items ready for mobile navigation
 */
export function getMobileNavigationItems(
  backendMobileNav: BackendNavigationItem[] | undefined,
  t: any,
  routeConfig?: Record<string, boolean>,
  userRoles?: string[],
  isProfileLoading?: boolean,
): FrontendNavigationItem[] {
  // Use backend mobile navigation if available
  if (backendMobileNav?.length) {
    // Apply role-based access control if user roles are provided
    const processedNav = userRoles
      ? applyRoleBasedAccess(backendMobileNav, userRoles)
      : backendMobileNav;
    return transformBackendNavigation(processedNav, t);
  }

  // Fallback to static mobile navigation
  // When profile is loading, don't filter out hidden items
  return transformStaticNavigation(MOBILE_NAVIGATION_STRUCTURE, t, routeConfig, isProfileLoading);
}
