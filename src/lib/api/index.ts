import {AuthApi} from './auth';
import {ClientApi} from './client';
import {UserApi} from './user';
import {AdminApi} from './admin';

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

export const userApi = new UserApi({
  baseURL: API_BASE_URL,
});

export const adminApi = new AdminApi({
  baseURL: API_BASE_URL,
});

// Export types and schemas
export * from './auth';
export * from './client';
export * from './user';
export * from './admin';

export {ApiError} from './base';
