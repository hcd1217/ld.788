import {VALIDATION_PATTERNS, VALIDATION_CONSTRAINTS} from './patterns';
import type {TranslationFunction} from '@/hooks/useTranslation';

// Email validation
export function validateEmail(
  value: string,
  t: TranslationFunction,
): string | undefined {
  if (!value) return t('validation.emailRequired');
  if (!VALIDATION_PATTERNS.email.test(value))
    return t('validation.emailInvalid');
  return undefined;
}

// Password validation
export function validatePassword(
  value: string,
  t: TranslationFunction,
): string | undefined {
  if (!value) return t('validation.passwordRequired');
  if (!VALIDATION_PATTERNS.password.test(value)) {
    return t('validation.passwordWeak');
  }

  return undefined;
}

// Confirm password validation
export function validateConfirmPassword(
  value: string,
  password: string,
  t: TranslationFunction,
): string | undefined {
  if (!value) return t('validation.confirmPasswordRequired');
  if (value !== password) {
    return t('validation.passwordsDoNotMatch');
  }

  return undefined;
}

// Identifier validation (userName/email for login)
export function validateIdentifier(
  value: string,
  t: TranslationFunction,
): string | undefined {
  if (!value) return t('validation.identifierRequired');
  if (value.length < VALIDATION_CONSTRAINTS.minIdentifierLength) {
    return t('validation.identifierTooShort');
  }

  return undefined;
}
