// Main validation export file for backward compatibility
export * from './patterns';
export * from './authValidators';
export * from './commonValidators';
export * from './formValidators';

// Re-export commonly used functions
export {getFormValidators, createAuthValidation} from './formValidators';
export {
  validateEmail,
  validatePassword,
  validateIdentifier,
} from './authValidators';
export {validateRequired, validateName} from './commonValidators';
export {VALIDATION_PATTERNS, VALIDATION_CONSTRAINTS} from './patterns';
