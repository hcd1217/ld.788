import {VALIDATION_CONSTRAINTS} from './patterns';
import type {TranslationFunction} from '@/hooks/useTranslation';

// Required field validation
export function validateRequired(
  value: string,
  t: TranslationFunction,
): string | undefined {
  if (!value) return t('validation.fieldRequired');
  return undefined;
}

// Name field validation (first name, last name)
export function validateName(
  value: string,
  t: TranslationFunction,
  fieldKey: 'firstName' | 'lastName',
): string | undefined {
  if (!value) return t(`validation.${fieldKey}Required`);
  if (value.length < VALIDATION_CONSTRAINTS.minNameLength) {
    return t(`validation.${fieldKey}TooShort`);
  }

  return undefined;
}
