import type { ClientConfig } from '@/lib/api/schemas/auth.schemas';
import type { Dictionary } from '@/types/dictionary';

/**
 * Converts flat dot-notation keys to nested object structure
 * Example: { 'common.login': 'Login' } => { common: { login: 'Login' } }
 */
function unFlattenTranslations(flatTranslations: Dictionary): Dictionary {
  const result: Dictionary = {};

  for (const [key, value] of Object.entries(flatTranslations)) {
    const parts = key.split('.');
    let current = result;

    for (const [index, part] of parts.entries()) {
      if (index === parts.length - 1) {
        current[part] = value;
      } else {
        current[part] ||= {};
        if (typeof current[part] !== 'string') {
          current = current[part];
        }
      }
    }
  }

  return result;
}

/**
 * Deep merges two objects, with source overriding target values
 */
function deepMerge(target: Dictionary, source: Dictionary): Dictionary {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    for (const key of Object.keys(source)) {
      if (isObject(source[key])) {
        if (key in target) {
          output[key] = deepMerge(target[key] as Dictionary, source[key] as Dictionary);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    }
  }

  return output;
}

function isObject(item: Dictionary): item is Record<string, Dictionary> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Merges client-specific translations with base translations
 * Client translations take precedence over base translations
 */
export function mergeTranslations(
  baseTranslations: Dictionary,
  clientTranslations?: ClientConfig['translations'],
): Dictionary {
  if (!clientTranslations) {
    return baseTranslations;
  }

  const mergedTranslations = { ...baseTranslations };

  // Process each language
  for (const [lang, translations] of Object.entries(clientTranslations)) {
    if (translations && mergedTranslations[lang]) {
      // Convert flat client translations to nested structure
      if (typeof translations === 'string') {
        continue;
      }

      const nestedClientTranslations = unFlattenTranslations(translations);

      // Deep merge with base translations
      const merged = mergedTranslations[lang];
      if (typeof merged === 'string') {
        continue;
      }

      const mergedTranslation = merged.translation;
      if (!mergedTranslation && typeof mergedTranslation === 'string') {
        continue;
      }

      // Const x = mergedTranslations[lang].translation
      mergedTranslations[lang] = {
        translation: deepMerge(mergedTranslation as Dictionary, nestedClientTranslations),
      };
    }
  }

  return mergedTranslations;
}

/**
 * Extracts translations for a specific language from client config
 */
export function getClientTranslationsForLanguage(
  clientTranslations: ClientConfig['translations'],
  language: string,
): Dictionary | undefined {
  if (!clientTranslations) {
    return undefined;
  }

  return clientTranslations[language] as Dictionary;
}
