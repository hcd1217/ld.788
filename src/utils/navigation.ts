import type { NavigationItem as FrontendNavigationItem } from '@/components/layouts/types';
import { getRoute } from '@/config/routeConfig';
import type { NavigationItemType as BackendNavigationItem } from '@/lib/api/schemas/clientConfig.schemas';
import { getIcon } from '@/utils/iconRegistry';
// Translation function type is 'any' to match existing NavBar.tsx pattern

/**
 * Transforms a single backend navigation item to frontend format
 * @param item Backend navigation item from API
 * @param t Translation function for i18n
 * @returns Frontend navigation item with resolved icon component
 */
function transformBackendItem(
  item: BackendNavigationItem,
  t: any,
  isRootUser?: boolean,
): FrontendNavigationItem {
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
    frontendItem.subs = item.subs.map((subItem) => transformBackendItem(subItem, t, isRootUser));
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
  isRootUser?: boolean,
): FrontendNavigationItem[] {
  // Sort by order if provided
  const sortedItems = [...items].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    return orderA - orderB;
  });

  return sortedItems.map((item) => transformBackendItem(item, t, isRootUser));
}

/**
 * Gets navigation items with backend priority and static fallback
 * @param backendNav Optional backend navigation configuration
 * @param t Translation function
 * @param userRoles Optional user roles for role-based filtering
 * @param navigationOverrides Optional navigation overrides (granted/denied)
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
   *    return getNavigationItems(userProfile?.clientConfig?.navigation, t);
   *  }, [userProfile, t]);
   */
  t: any,
  userRoles?: string[],
  navigationOverrides?: { granted: string[]; denied: string[] },
  isRootUser?: boolean,
): FrontendNavigationItem[] {
  // Use backend navigation if available
  if (backendNav?.length) {
    // Apply role-based access control if user roles are provided
    let processedNav = userRoles
      ? applyRoleBasedAccess(backendNav, isRootUser ?? false, userRoles)
      : backendNav;

    // Apply navigation overrides after role-based access
    processedNav = applyNavigationOverrides(processedNav, navigationOverrides);

    return transformBackendNavigation(processedNav, t, isRootUser);
  }

  throw new Error('No backend navigation found');
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
  isRootUser: boolean,
  userRoles: string[],
): BackendNavigationItem[] {
  return items.map((item) => {
    // Create a new item to avoid mutation
    const newItem = { ...item };

    // Check if user has required role (if roles are specified)
    const hasRequiredRole = isRootUser
      ? true
      : !item.roles?.length || item.roles.some((role) => userRoles.includes(role));

    // Mark as disabled if user lacks required role
    if (!hasRequiredRole) {
      newItem.disabled = true;
    }

    // Process sub-items recursively
    if (item.subs?.length) {
      const processedSubs = applyRoleBasedAccess(item.subs, isRootUser ?? false, userRoles);

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
 * Applies navigation overrides (granted/denied) to navigation items
 * @param items Navigation items to process
 * @param overrides Navigation overrides with granted and denied arrays
 * @returns Navigation items with overrides applied
 */
function applyNavigationOverrides(
  items: BackendNavigationItem[],
  overrides?: { granted: string[]; denied: string[] },
): BackendNavigationItem[] {
  if (!overrides) {
    return items;
  }

  const { granted = [], denied = [] } = overrides;

  return items
    .map((item) => {
      // If item is denied, hide it
      if (denied.includes(item.id)) {
        return null;
      }

      // Create a new item to avoid mutation
      const newItem = { ...item };

      // If item is explicitly granted, enable it regardless of role
      if (granted.includes(item.id)) {
        newItem.disabled = false;
      }

      // Process sub-items recursively
      if (item.subs?.length) {
        const processedSubs = applyNavigationOverrides(item.subs, overrides);
        // Only include sub-items that weren't filtered out
        newItem.subs = processedSubs.filter((sub) => sub !== null) as BackendNavigationItem[];

        // If parent has no path and all children are removed, remove parent too
        if (!newItem.path && newItem.subs.length === 0) {
          return null;
        }
      }

      return newItem;
    })
    .filter((item): item is BackendNavigationItem => item !== null);
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
 * @param userRoles Optional user roles for role-based filtering
 * @param navigationOverrides Optional navigation overrides (granted/denied)
 * @returns Array of frontend navigation items ready for mobile navigation
 */
export function getMobileNavigationItems(
  backendMobileNav: BackendNavigationItem[] | undefined,
  t: any,
  userRoles?: string[],
  navigationOverrides?: { granted: string[]; denied: string[] },
  isRootUser?: boolean,
): FrontendNavigationItem[] {
  // Use backend mobile navigation if available
  if (backendMobileNav?.length) {
    // Apply role-based access control if user roles are provided
    let processedNav = userRoles
      ? applyRoleBasedAccess(backendMobileNav, isRootUser ?? false, userRoles)
      : backendMobileNav;

    // Apply navigation overrides after role-based access
    processedNav = applyNavigationOverrides(processedNav, navigationOverrides);

    return transformBackendNavigation(processedNav, t, isRootUser);
  }

  throw new Error('No backend mobile navigation found');
}
