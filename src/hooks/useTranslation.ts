import {useTranslation as useI18nTranslation} from 'react-i18next';
import type {TFunction} from 'i18next';
import type {TranslationResource} from '@/locales';

export type TranslationFunction = TFunction<'translation', undefined>;

type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

type DotNestedKeys<T> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T]: `${K & string}${DotPrefix<DotNestedKeys<T[K]> & string>}`;
      }[keyof T]
    : '';

export type TranslationKey = DotNestedKeys<TranslationResource>;

export function useTranslation() {
  const {t, i18n} = useI18nTranslation();

  return {
    t: t as TFunction<'translation', undefined>,
    i18n,
    currentLanguage: i18n.language,
    changeLanguage: (language: string) => i18n.changeLanguage(language),
  };
}

export default useTranslation;
