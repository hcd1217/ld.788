import type {NavigationItem} from '@/components/layouts/types';

/**
 * Check if a navigation item or any of its sub-items is active
 * based on the current pathname
 */
export function isNavigationItemActive(
  item: NavigationItem,
  pathname: string,
): boolean {
  // Direct path match
  if (pathname === item?.path) {
    return true;
  }

  // Check active paths
  if (item?.activePaths?.some((path) => pathname.startsWith(path))) {
    return true;
  }

  // Check if any sub-item is active
  if (item.subs) {
    return item?.subs.some((sub) => isNavigationItemActive(sub, pathname));
  }

  return false;
}

/**
 * Generate a unique ID for a navigation item
 */
export function generateNavigationId(): string {
  // Use a more robust ID generation to avoid conflicts
  return `nav-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
