import {adminApi} from '@/lib/api';

const STORAGE_KEY = 'admin_access_key';
const AUTH_FLAG_KEY = 'admin_authenticated';

/**
 * Store access key in sessionStorage and update API client
 */
export function storeAdminSession(accessKey: string): void {
  sessionStorage.setItem(STORAGE_KEY, accessKey);
  sessionStorage.setItem(AUTH_FLAG_KEY, 'true');
  adminApi.setAdminAccessKey(accessKey);
}

/**
 * Retrieve access key from sessionStorage
 */
export function retrieveAdminSession(): string | undefined {
  return sessionStorage.getItem(STORAGE_KEY) ?? undefined;
}

/**
 * Clear admin session data
 */
export function clearAdminSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(AUTH_FLAG_KEY);
  adminApi.clearAdminAccessKey();
}

/**
 * Check if admin is authenticated
 */
export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_FLAG_KEY) === 'true';
}

/**
 * Restore session from sessionStorage (called on app init)
 */
export function restoreAdminSession(): void {
  const accessKey = retrieveAdminSession();
  if (accessKey) {
    adminApi.setAdminAccessKey(accessKey);
  }
}

/**
 * Handle 401 responses by clearing admin session
 */
export function handleAdminUnauthorized(): void {
  clearAdminSession();
}
