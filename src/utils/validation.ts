import type {TranslationFunction} from '@/hooks/useTranslation';

// Validation regex patterns
export const VALIDATION_PATTERNS = {
  email: /^\S+@\S+\.\S+$/,
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&()^])[A-Za-z\d@#$!%*?&()^]{8,}$/,
} as const;

// Validation constraints
export const VALIDATION_CONSTRAINTS = {
  minNameLength: 2,
  minIdentifierLength: 5,
  minPasswordLength: 8,
} as const;

// Email validation
export function validateEmail(
  value: string,
  t: TranslationFunction,
): string | undefined {
  if (!value) return t('validation.emailRequired');
  if (!VALIDATION_PATTERNS.email.test(value))
    return t('validation.invalidEmail');
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
