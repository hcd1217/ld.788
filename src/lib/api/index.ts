import { AuthApi } from './services/auth.service';
import { ClientApi } from './services/client.service';
import { UserApi } from './services/user.service';
import { StoreApi } from './services/store.service';
import { HrApi } from './services/hr.service';
import { SalesApi } from './services/sales.service';
import { OverviewApi } from './services/overview.service';
import { DeliveryRequestApi } from './services/deliveryRequest.service';
import { MediaApi } from './services/media.service';

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

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

export const storeApi = new StoreApi({
  baseURL: API_BASE_URL,
});

export const hrApi = new HrApi({
  baseURL: API_BASE_URL,
});

export const salesApi = new SalesApi({
  baseURL: API_BASE_URL,
});

export const overviewApi = new OverviewApi({
  baseURL: API_BASE_URL,
});

export const deliveryRequestApi = new DeliveryRequestApi({
  baseURL: API_BASE_URL,
});

export const mediaApi = new MediaApi({
  baseURL: API_BASE_URL,
});

// Export types and schemas
export * from './schemas';

// Export service classes
export { AuthApi } from './services/auth.service';
export { ClientApi } from './services/client.service';
export { UserApi } from './services/user.service';
export { StoreApi } from './services/store.service';
export { HrApi } from './services/hr.service';
export { SalesApi } from './services/sales.service';
export { OverviewApi } from './services/overview.service';
export { DeliveryRequestApi } from './services/deliveryRequest.service';
export { MediaApi } from './services/media.service';

export { ApiError } from './base';
