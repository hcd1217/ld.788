import {AuthApi} from './auth';
import {ClientApi} from './client';

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:3000';

// Create API client instances
export const authApi = new AuthApi({
  baseURL: API_BASE_URL,
});

export const clientApi = new ClientApi({
  baseURL: API_BASE_URL,
});

// Export types and schemas
export * from './auth';
export * from './client';

export {
  LoginRequestSchema,
  LoginResponseSchema,
  JWTPayloadSchema,
  ForgotPasswordRequestSchema,
  ForgotPasswordResponseSchema,
  ResetPasswordRequestSchema,
  ResetPasswordResponseSchema,
} from './auth';

export {ApiError} from './base';
