// Unified route definitions - single source of truth
const ROUTE_DEFINITIONS = {
  // Root
  ROOT: { id: 'root', path: '/' },

  // Auth routes
  LOGIN: { id: 'login', path: '/login' },
  MAGIC_LINK: { id: 'magic-link', path: '/magic-link' },
  CLIENT_LOGIN: { id: 'client-login', path: '/:clientCode/login' },
  FORGOT_PASSWORD: { id: 'forgot-password', path: '/forgot-password' },
  RESET_PASSWORD: { id: 'reset-password', path: '/reset-password' },
  REGISTER: { id: 'register', path: '/register' },

  // Time keeper routes
  TIME_KEEPER_DASHBOARD: { id: 'time-keeper/dashboard', path: '/time-keeper/dashboard' },
  TIME_KEEPER_MY_TIMESHEET: { id: 'time-keeper/my-timesheet', path: '/time-keeper/my-timesheet' },
  TIME_KEEPER_CLOCK: { id: 'time-keeper/clock', path: '/time-keeper/clock' },
  TIME_KEEPER_JOBS: { id: 'time-keeper/jobs', path: '/time-keeper/jobs' },
  TIME_KEEPER_SERVICES: { id: 'time-keeper/services', path: '/time-keeper/services' },
  TIME_KEEPER_LEAVE_REQUEST: {
    id: 'time-keeper/leave-request',
    path: '/time-keeper/leave-request/:id',
  },
  TIME_KEEPER_SHIFT: { id: 'time-keeper/shift', path: '/time-keeper/shift/:id' },

  // App routes
  HOME: { id: 'home', path: '/home' },
  EXPLORE: { id: 'explore', path: '/explore' },
  MORE: { id: 'more', path: '/more' },
  PROFILE: { id: 'profile', path: '/profile' },
  SETTINGS: { id: 'settings', path: '/settings' },
  NOTIFICATIONS: { id: 'notifications', path: '/notifications' },

  // Config routes
  CUSTOMER_CONFIG: { id: 'customer-config', path: '/customer-config' },
  PRODUCT_CONFIG: { id: 'product-config', path: '/product-config' },

  // Store management
  STORES: { id: 'stores', path: '/stores' },
  STORE_CONFIG: { id: 'store-config', path: '/store-config' },
  STORE_MANAGEMENT: { id: 'store-management', path: '/store-management' },
  STORE_EDIT: { id: 'store-edit', path: '/stores/edit/:storeId' },

  // Employee management
  EMPLOYEE_MANAGEMENT: { id: 'employee-management', path: '/employee-management' },
  EMPLOYEE_DETAIL: { id: 'employee-detail', path: '/employees/:employeeId' },
  EMPLOYEES_ADD: { id: 'employees-add', path: '/employees/add' },
  EMPLOYEE_EDIT: { id: 'employee-edit', path: '/employees/edit/:employeeId' },

  // Customer management
  CUSTOMER_MANAGEMENT: { id: 'customer-management', path: '/customer-management' },
  CUSTOMER_DETAIL: { id: 'customer-detail', path: '/customers/:customerId' },
  CUSTOMER_ADD: { id: 'customer-add', path: '/customers/add' },
  CUSTOMER_EDIT: { id: 'customer-edit', path: '/customers/edit/:customerId' },

  // Product management
  PRODUCT_MANAGEMENT: { id: 'product-management', path: '/product-management' },
  PRODUCT_DETAIL: { id: 'product-detail', path: '/product/:productId' }, // Fixed: was :customerId
  PRODUCT_ADD: { id: 'product-add', path: '/product/add' },
  PRODUCT_EDIT: { id: 'product-edit', path: '/product/edit/:productId' }, // Fixed: was :customerId

  // PO management
  PO_MANAGEMENT: { id: 'po-management', path: '/po-management' },
  PO_DETAIL: { id: 'po-detail', path: '/po/:poId' },
  PO_ADD: { id: 'po-add', path: '/po/add' },
  PO_EDIT: { id: 'po-edit', path: '/po/edit/:poId' },

  // Staff management
  STAFF: { id: 'staff', path: '/staff' },
  STAFF_ADD: { id: 'staff-add', path: '/staff/add' },
  STAFF_EDIT: { id: 'staff-edit', path: '/staff/edit/:staffId' },

  // User management
  USER_MANAGEMENT: { id: 'user-management', path: '/user-management' },
  USER_DETAIL: { id: 'user-detail', path: '/user/:userId' },
  ADD_USER: { id: 'add-user', path: '/add-user' },
  IMPORT_USERS: { id: 'import-users', path: '/import-users' },

  // Configuration
  CONFIGURATION: { id: 'configuration', path: '/configuration' },
  SALARY_MANAGEMENT: { id: 'salary-management', path: '/salary-management' },

  // Admin management
  ROLE_MANAGEMENT: { id: 'role-management', path: '/role-management' },
  PERMISSION_MANAGEMENT: { id: 'permission-management', path: '/permission-management' },

  // Admin routes
  ADMIN_LOGIN: { id: 'admin-login', path: '/admin/login' },
  ADMIN_DASHBOARD: { id: 'admin-dashboard', path: '/admin/dashboard' },
  ADMIN_CLIENTS: { id: 'admin-clients', path: '/admin/clients' },
  ADMIN_CLIENTS_NEW: { id: 'admin-clients-new', path: '/admin/clients/new' },
  ADMIN_CLIENT_DETAIL: { id: 'admin-client-detail', path: '/admin/clients/:clientCode' },
  ADMIN_PERMISSIONS: { id: 'admin-permissions', path: '/admin/permissions' },
  ADMIN_STORES: { id: 'admin-stores', path: '/admin/stores' },
  ADMIN_MONITORING: { id: 'admin-monitoring', path: '/admin/monitoring' },
  ADMIN_SETTINGS: { id: 'admin-settings', path: '/admin/settings' },

  // Sample/Error routes
  SAMPLE_ERRORS: { id: 'sample-errors', path: '/sample/errors' },
} as const;

// Type helper to extract keys
type RouteDefinitionKeys = keyof typeof ROUTE_DEFINITIONS;

// Generate RouteIdentifiers for backward compatibility
export const RouteIdentifiers = Object.fromEntries(
  Object.entries(ROUTE_DEFINITIONS).map(([key, value]) => [key, value.id]),
) as Record<RouteDefinitionKeys, (typeof ROUTE_DEFINITIONS)[RouteDefinitionKeys]['id']>;

// Generate ROUTERS for backward compatibility
export const ROUTERS = Object.fromEntries(
  Object.entries(ROUTE_DEFINITIONS).map(([key, value]) => [key, value.path]),
) as Record<RouteDefinitionKeys, (typeof ROUTE_DEFINITIONS)[RouteDefinitionKeys]['path']>;

// Type for route identifiers
export type RouteIdentifier = (typeof ROUTE_DEFINITIONS)[RouteDefinitionKeys]['id'];

// Automatically generate route registry
const routeRegistry: Record<RouteIdentifier, string> = Object.fromEntries(
  Object.values(ROUTE_DEFINITIONS).map(({ id, path }) => [id, path]),
) as Record<RouteIdentifier, string>;

/**
 * Retrieves a route path by its identifier
 * @param identifier - RouteIdentifier
 * @returns The corresponding route path or undefined
 */
export function getRoute(identifier?: RouteIdentifier): string | undefined {
  return identifier ? routeRegistry[identifier] : undefined;
}

/**
 * Check if a route identifier exists in the registry
 * @param identifier - Route identifier to check
 * @returns boolean indicating if the route exists
 */
export function hasRoute(identifier: string): boolean {
  return identifier in routeRegistry;
}

export type RouteConfig = Partial<Record<keyof typeof ROUTERS, boolean>>;

// Generic helper for parameterized routes
function replaceRouteParams(path: string, params: Record<string, string>): string {
  let result = path;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, value);
  }
  return result;
}

// Helper functions for parameterized routes
export const getEmployeeDetailRoute = (employeeId: string) =>
  replaceRouteParams(ROUTERS.EMPLOYEE_DETAIL, { employeeId });

export const getEmployeeEditRoute = (employeeId: string) =>
  replaceRouteParams(ROUTERS.EMPLOYEE_EDIT, { employeeId });

export const getClientLoginRoute = (clientCode: string) =>
  replaceRouteParams(ROUTERS.CLIENT_LOGIN, { clientCode });

export const getStoreEditRoute = (storeId: string) =>
  replaceRouteParams(ROUTERS.STORE_EDIT, { storeId });

export const getStaffEditRoute = (staffId: string) =>
  replaceRouteParams(ROUTERS.STAFF_EDIT, { staffId });

export const getUserDetailRoute = (userId: string) =>
  replaceRouteParams(ROUTERS.USER_DETAIL, { userId });

export const getAdminClientDetailRoute = (clientCode: string) =>
  replaceRouteParams(ROUTERS.ADMIN_CLIENT_DETAIL, { clientCode });

// Customer management helper functions
export const getCustomerDetailRoute = (customerId: string) =>
  replaceRouteParams(ROUTERS.CUSTOMER_DETAIL, { customerId });

export const getCustomerEditRoute = (customerId: string) =>
  replaceRouteParams(ROUTERS.CUSTOMER_EDIT, { customerId });

// Product management helper functions (fixed parameter names)
export const getProductDetailRoute = (productId: string) =>
  replaceRouteParams(ROUTERS.PRODUCT_DETAIL, { productId });

export const getProductEditRoute = (productId: string) =>
  replaceRouteParams(ROUTERS.PRODUCT_EDIT, { productId });

// PO management helper functions
export const getPODetailRoute = (poId: string) => replaceRouteParams(ROUTERS.PO_DETAIL, { poId });

export const getPOEditRoute = (poId: string) => replaceRouteParams(ROUTERS.PO_EDIT, { poId });
