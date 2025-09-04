/**
 * Centralized storage keys for localStorage and sessionStorage
 * Provides type safety and single source of truth for all storage keys
 */

// Helper function for creating view mode keys dynamically
export const getViewModeKey = (key = 'DEFAULT') => {
  return `__VIEW_MODE_${key}__`.toUpperCase();
};

// Helper function for creating clock photo keys dynamically
export const getClockPhotoKey = (clockId: string) => {
  return `clock_photo_${clockId}`;
};

/**
 * All storage keys used throughout the application
 * Organized by domain/feature for better maintainability
 */
export const STORAGE_KEYS = {
  // Authentication & Session
  AUTH: {
    REFRESH_TOKEN: 'refreshToken',
    CLIENT_CODE: 'clientCode',
    ACCESS_TOKEN: 'accessToken', // sessionStorage
  },

  // User Preferences
  USER: {
    LANGUAGE: 'language',
    REMEMBERED_IDENTIFIER: 'rememberedIdentifier',
  },

  // UI State & Navigation
  UI: {
    EXPANDED_MENU: 'expandedMenu',
    // View mode uses dynamic keys: __VIEW_MODE_${key}__
    // Use getViewModeKey() helper function
  },

  // Client Configuration
  CLIENT: {
    API_DELAY: '__CLIENT_CONFIG_API_DELAY__',
  },

  // Debug & Development
  DEBUG: {
    MODE: '__DEBUG_MODE__',
    CURRENT_ROLE: '__DEBUG_CURRENT_ROLE__',
    PASSWORD: '__PASSWORD__', // Development only
  },

  // Timekeeper Feature
  TIMEKEEPER: {
    // Clock photos use dynamic keys: clock_photo_${clockId}
    // Use getClockPhotoKey() helper function
  },
} as const;

// Type for all static storage keys
export type StorageKey =
  | (typeof STORAGE_KEYS.AUTH)[keyof typeof STORAGE_KEYS.AUTH]
  | (typeof STORAGE_KEYS.USER)[keyof typeof STORAGE_KEYS.USER]
  | (typeof STORAGE_KEYS.CLIENT)[keyof typeof STORAGE_KEYS.CLIENT]
  | (typeof STORAGE_KEYS.DEBUG)[keyof typeof STORAGE_KEYS.DEBUG];

// Type-safe storage helpers (optional, for future use)
export const storage = {
  /**
   * Get item from localStorage with type safety
   */
  get(key: StorageKey | string): string | null {
    return localStorage.getItem(key);
  },

  /**
   * Set item in localStorage with type safety
   */
  set(key: StorageKey | string, value: string): void {
    localStorage.setItem(key, value);
  },

  /**
   * Remove item from localStorage with type safety
   */
  remove(key: StorageKey | string): void {
    localStorage.removeItem(key);
  },

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    localStorage.clear();
  },
} as const;

// Session storage helpers
export const session = {
  /**
   * Get item from sessionStorage with type safety
   */
  get(key: StorageKey | string): string | null {
    return sessionStorage.getItem(key);
  },

  /**
   * Set item in sessionStorage with type safety
   */
  set(key: StorageKey | string, value: string): void {
    sessionStorage.setItem(key, value);
  },

  /**
   * Remove item from sessionStorage with type safety
   */
  remove(key: StorageKey | string): void {
    sessionStorage.removeItem(key);
  },

  /**
   * Clear all items from sessionStorage
   */
  clear(): void {
    sessionStorage.clear();
  },
} as const;
