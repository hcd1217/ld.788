// Locale-specific configuration
export type NameOrder = 'given-first' | 'family-first';

export interface LocaleConfig {
  nameOrder: NameOrder;
  // Add more locale-specific configurations here as needed
  // dateFormat?: string;
  // numberFormat?: string;
  // etc.
}

// Define the configuration for each locale
export const localeConfigs: Record<string, LocaleConfig> = {
  // Western name order (given name first)
  en: {
    nameOrder: 'given-first',
  },

  // Eastern name order (family name first)
  vi: {
    nameOrder: 'family-first',
  },

  // Asian locales typically use family-first
  ja: {
    nameOrder: 'family-first',
  },

  zh: {
    nameOrder: 'family-first',
  },

  'zh-CN': {
    nameOrder: 'family-first',
  },

  'zh-TW': {
    nameOrder: 'family-first',
  },

  ko: {
    nameOrder: 'family-first',
  },

  // Add more locales as needed
  // Default to given-first for unknown locales
};

// Helper function to get locale config with fallback
export function getLocaleConfig(locale: string): LocaleConfig {
  // Try exact match first
  if (localeConfigs[locale]) {
    return localeConfigs[locale];
  }

  // Try language code without region (e.g., 'zh' from 'zh-CN')
  const languageCode = locale.split('-')[0];
  if (localeConfigs[languageCode]) {
    return localeConfigs[languageCode];
  }

  // Default configuration
  return {
    nameOrder: 'given-first',
  };
}
