import type { NavigationItem } from '@/lib/api/schemas/clientConfig.schemas';

const NAVIGATION_CACHE_KEY = 'navigationConfig';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL

interface NavigationCache {
  data: NavigationItem[];
  timestamp: number;
}

/**
 * Stores navigation configuration in sessionStorage with TTL
 * @param navigationConfig Navigation items from backend
 */
export function cacheNavigationConfig(navigationConfig: NavigationItem[]): void {
  try {
    const cache: NavigationCache = {
      data: navigationConfig,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(NAVIGATION_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    // Silently fail if sessionStorage is not available
    console.warn('Failed to cache navigation config:', error);
  }
}

/**
 * Retrieves cached navigation configuration if still valid
 * @returns Cached navigation config or undefined if expired/not found
 */
export function getCachedNavigationConfig(): NavigationItem[] | undefined {
  try {
    const cached = sessionStorage.getItem(NAVIGATION_CACHE_KEY);
    if (!cached) {
      return undefined;
    }

    const cache: NavigationCache = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - cache.timestamp > CACHE_TTL) {
      clearNavigationCache();
      return undefined;
    }

    return cache.data;
  } catch (error) {
    console.warn('Failed to retrieve cached navigation config:', error);
    return undefined;
  }
}

/**
 * Clears navigation cache from sessionStorage
 */
export function clearNavigationCache(): void {
  try {
    sessionStorage.removeItem(NAVIGATION_CACHE_KEY);
  } catch {
    // Silently fail
  }
}

/**
 * Updates navigation cache TTL without changing data
 * Useful when user activity indicates the cache should remain valid
 */
export function refreshNavigationCacheTTL(): void {
  try {
    const cached = sessionStorage.getItem(NAVIGATION_CACHE_KEY);
    if (!cached) {
      return;
    }

    const cache: NavigationCache = JSON.parse(cached);
    cache.timestamp = Date.now();
    sessionStorage.setItem(NAVIGATION_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Silently fail
  }
}

/**
 * Checks if navigation cache exists and is valid
 * @returns true if valid cache exists
 */
export function hasValidNavigationCache(): boolean {
  const cached = getCachedNavigationConfig();
  return cached !== undefined && cached.length > 0;
}
