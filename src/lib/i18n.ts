import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '@/locales/en.json';
import vi from '@/locales/vi.json';
import { isDevelopment } from '@/utils/env';
import { STORAGE_KEYS } from '@/utils/storageKeys';
import type { ClientConfig } from '@/lib/api/schemas/clientConfig.schemas';
import type { Dictionary } from '@/types/dictionary';

const baseResources = {
  en: {
    translation: en,
  },
  vi: {
    translation: vi,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: baseResources,
    lng: localStorage.getItem(STORAGE_KEYS.USER.LANGUAGE) ?? 'vi',
    fallbackLng: 'en',
    debug: isDevelopment,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

/**
 * Updates i18n resources with client-specific translations
 * Client translations override base translations
 */
export function updateClientTranslations(clientTranslations?: ClientConfig['translations']): void {
  if (!clientTranslations) {
    return;
  }

  try {
    // Process each language in client translations
    for (const [lang, translations] of Object.entries(clientTranslations)) {
      if (translations) {
        // Convert flat dot-notation to nested structure
        const nestedTranslations = unFlattenTranslations(translations);

        // Add or update the resource bundle
        // The 'true' parameter performs a deep merge
        i18n.addResourceBundle(lang, 'translation', nestedTranslations, true, true);
      }
    }
  } catch (error) {
    console.error('Failed to update client translations:', error);
  }
}

/**
 * Clears client translations and restores base translations only
 */
export function clearClientTranslations(): void {
  try {
    // Get all languages
    const languages = Object.keys(baseResources);

    // Reset each language to base translations only
    for (const lang of languages) {
      const baseTranslation = baseResources[lang as keyof typeof baseResources];
      if (baseTranslation) {
        // Replace the entire resource bundle with base translations
        i18n.addResourceBundle(lang, 'translation', baseTranslation.translation, false, false);
      }
    }
  } catch (error) {
    console.error('Failed to clear client translations:', error);
  }
}

/**
 * Helper function to convert flat dot-notation keys to nested object
 */
function unFlattenTranslations(flatTranslations: string | Dictionary): Dictionary {
  const result: Dictionary = {};

  for (const [key, value] of Object.entries(flatTranslations)) {
    const parts = key.split('.');
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      // If the path is not an object, create it. This overwrites any conflicting primitive values.
      if (typeof current[part] !== 'object' || current[part] === null) {
        current[part] = {};
      }
      current = current[part] as Dictionary;
    }

    const lastPart = parts.at(-1);
    if (lastPart !== undefined) {
      current[lastPart] = value;
    }
  }

  return result;
}

export { baseResources };
export default i18n;
