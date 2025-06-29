import en from './en.json';
import vi from './vi.json';

export const resources = {
  en: {
    translation: en,
  },
  vi: {
    translation: vi,
  },
} as const;

export type Language = keyof typeof resources;
export type TranslationResource = (typeof resources)['en']['translation'];

// Type augmentation for react-i18next
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: TranslationResource;
    };
  }
}
