import {AuthApi} from './services/auth.service';
import {ClientApi} from './services/client.service';
import {UserApi} from './services/user.service';
import {AdminApi} from './services/admin.service';
import {StoreApi} from './services/store.service';
import {HrApi} from './services/hr.service';

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

export const storeApi = new StoreApi({
  baseURL: API_BASE_URL,
});

export const hrApi = new HrApi({
  baseURL: API_BASE_URL,
});

// Export types and schemas
export * from './schemas';

// Export service classes
export {AuthApi} from './services/auth.service';
export {ClientApi} from './services/client.service';
export {UserApi} from './services/user.service';
export {AdminApi} from './services/admin.service';
export {StoreApi} from './services/store.service';
export {HrApi} from './services/hr.service';

export {ApiError} from './base';
