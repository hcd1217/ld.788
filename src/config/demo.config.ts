/**
 * Demo Configuration
 *
 * This file controls whether the app uses demo data or real API calls.
 * Set USE_DEMO_DATA to true to use mock data for UI development and testing.
 */

// Feature-specific demo flags
export const DEMO_CONFIG = {
  // Master switch
  enabled: true,

  // Feature-specific toggles (only work when enabled is true)
  features: {
    timekeeper: true,
    dashboard: true,
    timesheet: true,
    shifts: true,
    leaveRequests: true,
  },

  // Demo behavior settings
  settings: {
    // Simulate network delays (ms)
    networkDelay: {
      min: 200,
      max: 1000,
    },

    // Simulate random errors (0-1)
    errorRate: 0.05, // 5% chance of error

    // Auto-refresh intervals (ms)
    refreshIntervals: {
      dashboard: 30000, // 30 seconds
      clockStatus: 60000, // 1 minute
    },
  },
};

// Helper to check if a specific feature should use demo data
export const shouldUseDemoData = (feature: keyof typeof DEMO_CONFIG.features): boolean => {
  return DEMO_CONFIG.enabled && DEMO_CONFIG.features[feature];
};

// Helper to get random delay for demo
export const getDemoDelay = (): number => {
  const { min, max } = DEMO_CONFIG.settings.networkDelay;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper to simulate random errors
export const shouldSimulateError = (): boolean => {
  return DEMO_CONFIG.enabled && Math.random() < DEMO_CONFIG.settings.errorRate;
};
