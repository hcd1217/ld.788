import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateIdentifier,
} from './authValidators';
import {validateRequired, validateName} from './commonValidators';
import type {TranslationFunction} from '@/hooks/useTranslation';

// Create form validation object for common auth forms
export function createAuthValidation(t: TranslationFunction) {
  return {
    email: (value: string) => validateEmail(value, t),
    password: (value: string) => validatePassword(value, t),
    confirmPassword: (value: string, values: {password: string}) =>
      validateConfirmPassword(value, values.password, t),
    firstName: (value: string) => validateName(value, t, 'firstName'),
    lastName: (value: string) => validateName(value, t, 'lastName'),
    identifier: (value: string) => validateIdentifier(value, t),
    clientCode: (value: string) => validateRequired(value, t),
    clientName: (value: string) => validateRequired(value, t),
    userName: (value: string) => validateIdentifier(value, t),
  };
}

// Helper to get only the validators needed for a specific form
export function getFormValidators<
  T extends keyof ReturnType<typeof createAuthValidation>,
>(
  t: TranslationFunction,
  fields: T[],
): Pick<ReturnType<typeof createAuthValidation>, T> {
  const allValidators = createAuthValidation(t);
  const result: Partial<Pick<ReturnType<typeof createAuthValidation>, T>> = {};

  for (const field of fields) {
    result[field] = allValidators[field];
  }

  return result as Pick<ReturnType<typeof createAuthValidation>, T>;
}
