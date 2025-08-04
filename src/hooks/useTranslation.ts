import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

export type TranslationFunction = TFunction<'translation', undefined>;

export function useTranslation() {
  const { t, i18n } = useI18nTranslation();

  return {
    t: t as TranslationFunction,
    i18n,
    currentLanguage: i18n.language,
    changeLanguage: (language: string) => i18n.changeLanguage(language),
  };
}
