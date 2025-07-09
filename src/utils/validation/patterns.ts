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
