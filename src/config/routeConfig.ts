// Type for route identifiers - ensures type safety
export const RouteIdentifiers = {
  // Root
  ROOT: 'root',

  // Auth routes
  LOGIN: 'login',
  MAGIC_LINK: 'magic-link',
  CLIENT_LOGIN: 'client-login',
  FORGOT_PASSWORD: 'forgot-password',
  RESET_PASSWORD: 'reset-password',
  REGISTER: 'register',

  // App routes
  HOME: 'home',
  EXPLORE: 'explore',
  MORE: 'more',
  PROFILE: 'profile',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',

  // Config routes
  CUSTOMER_CONFIG: 'customer-config',
  PRODUCT_CONFIG: 'product-config',

  // Store management
  STORES: 'stores',
  STORE_CONFIG: 'store-config',
  STORE_MANAGEMENT: 'store-management',
  STORE_EDIT: 'store-edit',

  // Employee management
  EMPLOYEE_MANAGEMENT: 'employee-management',
  EMPLOYEE_DETAIL: 'employee-detail',
  EMPLOYEES_ADD: 'employees-add',
  EMPLOYEE_EDIT: 'employee-edit',

  // Customer management
  CUSTOMER_MANAGEMENT: 'customer-management',
  CUSTOMER_DETAIL: 'customer-detail',
  CUSTOMER_ADD: 'customer-add',
  CUSTOMER_EDIT: 'customer-edit',

  // Product management
  PRODUCT_MANAGEMENT: 'product-management',
  PRODUCT_DETAIL: 'product-detail',
  PRODUCT_ADD: 'product-add',
  PRODUCT_EDIT: 'product-edit',

  // PO management
  PO_MANAGEMENT: 'po-management',
  PO_DETAIL: 'po-detail',
  PO_ADD: 'po-add',
  PO_EDIT: 'po-edit',

  // Staff management
  STAFF: 'staff',
  STAFF_ADD: 'staff-add',
  STAFF_EDIT: 'staff-edit',

  // User management
  USER_MANAGEMENT: 'user-management',
  USER_DETAIL: 'user-detail',
  ADD_USER: 'add-user',
  IMPORT_USERS: 'import-users',

  // Configuration
  CONFIGURATION: 'configuration',
  SALARY_MANAGEMENT: 'salary-management',

  // Admin management
  ROLE_MANAGEMENT: 'role-management',
  PERMISSION_MANAGEMENT: 'permission-management',

  // Admin routes
  ADMIN_LOGIN: 'admin-login',
  ADMIN_DASHBOARD: 'admin-dashboard',
  ADMIN_CLIENTS: 'admin-clients',
  ADMIN_CLIENTS_NEW: 'admin-clients-new',
  ADMIN_CLIENT_DETAIL: 'admin-client-detail',
  ADMIN_PERMISSIONS: 'admin-permissions',
  ADMIN_STORES: 'admin-stores',
  ADMIN_MONITORING: 'admin-monitoring',
  ADMIN_SETTINGS: 'admin-settings',

  // Sample/Error routes
  SAMPLE_ERRORS: 'sample-errors',
} as const;

export type RouteIdentifier = (typeof RouteIdentifiers)[keyof typeof RouteIdentifiers];

export const ROUTERS = {
  // Root
  ROOT: '/',

  // Auth routes
  LOGIN: '/login',
  MAGIC_LINK: '/magic-link',
  CLIENT_LOGIN: '/:clientCode/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  REGISTER: '/register',

  // App routes
  HOME: '/home',
  EXPLORE: '/explore',
  MORE: '/more',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',

  // Config routes
  CUSTOMER_CONFIG: '/customer-config',
  PRODUCT_CONFIG: '/product-config',

  // Store management
  STORES: '/stores',
  STORE_CONFIG: '/store-config',
  STORE_MANAGEMENT: '/store-management',
  STORE_EDIT: '/stores/edit/:storeId',

  // Employee management
  EMPLOYEE_MANAGEMENT: '/employee-management',
  EMPLOYEE_DETAIL: '/employees/:employeeId',
  EMPLOYEES_ADD: '/employees/add',
  EMPLOYEE_EDIT: '/employees/edit/:employeeId',

  // Customer management
  CUSTOMER_MANAGEMENT: '/customer-management',
  CUSTOMER_DETAIL: '/customers/:customerId',
  CUSTOMER_ADD: '/customers/add',
  CUSTOMER_EDIT: '/customers/edit/:customerId',

  // Product management
  PRODUCT_MANAGEMENT: '/product-management',
  PRODUCT_DETAIL: '/product/:customerId',
  PRODUCT_ADD: '/product/add',
  PRODUCT_EDIT: '/product/edit/:customerId',

  // PO management
  PO_MANAGEMENT: '/po-management',
  PO_DETAIL: '/po/:poId',
  PO_ADD: '/po/add',
  PO_EDIT: '/po/edit/:poId',

  // Staff management
  STAFF: '/staff',
  STAFF_ADD: '/staff/add',
  STAFF_EDIT: '/staff/edit/:staffId',

  // User management
  USER_MANAGEMENT: '/user-management',
  USER_DETAIL: '/user/:userId',
  ADD_USER: '/add-user',
  IMPORT_USERS: '/import-users',

  // Configuration
  CONFIGURATION: '/configuration',
  SALARY_MANAGEMENT: '/salary-management',

  // Admin management
  ROLE_MANAGEMENT: '/role-management',
  PERMISSION_MANAGEMENT: '/permission-management',

  // Admin routes
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_CLIENTS: '/admin/clients',
  ADMIN_CLIENTS_NEW: '/admin/clients/new',
  ADMIN_CLIENT_DETAIL: '/admin/clients/:clientCode',
  ADMIN_PERMISSIONS: '/admin/permissions',
  ADMIN_STORES: '/admin/stores',
  ADMIN_MONITORING: '/admin/monitoring',
  ADMIN_SETTINGS: '/admin/settings',

  // Sample/Error routes
  SAMPLE_ERRORS: '/sample/errors',
} as const;

// Route registry with all navigation routes
const routeRegistry: Record<RouteIdentifier, string> = {
  [RouteIdentifiers.ROOT]: ROUTERS.ROOT,
  [RouteIdentifiers.LOGIN]: ROUTERS.LOGIN,
  [RouteIdentifiers.MAGIC_LINK]: ROUTERS.MAGIC_LINK,
  [RouteIdentifiers.CLIENT_LOGIN]: ROUTERS.CLIENT_LOGIN,
  [RouteIdentifiers.FORGOT_PASSWORD]: ROUTERS.FORGOT_PASSWORD,
  [RouteIdentifiers.RESET_PASSWORD]: ROUTERS.RESET_PASSWORD,
  [RouteIdentifiers.REGISTER]: ROUTERS.REGISTER,
  [RouteIdentifiers.HOME]: ROUTERS.HOME,
  [RouteIdentifiers.EXPLORE]: ROUTERS.EXPLORE,
  [RouteIdentifiers.MORE]: ROUTERS.MORE,
  [RouteIdentifiers.PROFILE]: ROUTERS.PROFILE,
  [RouteIdentifiers.SETTINGS]: ROUTERS.SETTINGS,
  [RouteIdentifiers.NOTIFICATIONS]: ROUTERS.NOTIFICATIONS,
  [RouteIdentifiers.CUSTOMER_CONFIG]: ROUTERS.CUSTOMER_CONFIG,
  [RouteIdentifiers.PRODUCT_CONFIG]: ROUTERS.PRODUCT_CONFIG,
  [RouteIdentifiers.STORES]: ROUTERS.STORES,
  [RouteIdentifiers.STORE_CONFIG]: ROUTERS.STORE_CONFIG,
  [RouteIdentifiers.STORE_MANAGEMENT]: ROUTERS.STORE_MANAGEMENT,
  [RouteIdentifiers.STORE_EDIT]: ROUTERS.STORE_EDIT,
  [RouteIdentifiers.EMPLOYEE_MANAGEMENT]: ROUTERS.EMPLOYEE_MANAGEMENT,
  [RouteIdentifiers.EMPLOYEE_DETAIL]: ROUTERS.EMPLOYEE_DETAIL,
  [RouteIdentifiers.EMPLOYEES_ADD]: ROUTERS.EMPLOYEES_ADD,
  [RouteIdentifiers.EMPLOYEE_EDIT]: ROUTERS.EMPLOYEE_EDIT,
  [RouteIdentifiers.CUSTOMER_MANAGEMENT]: ROUTERS.CUSTOMER_MANAGEMENT,
  [RouteIdentifiers.CUSTOMER_DETAIL]: ROUTERS.CUSTOMER_DETAIL,
  [RouteIdentifiers.CUSTOMER_ADD]: ROUTERS.CUSTOMER_ADD,
  [RouteIdentifiers.CUSTOMER_EDIT]: ROUTERS.CUSTOMER_EDIT,
  [RouteIdentifiers.PRODUCT_MANAGEMENT]: ROUTERS.PRODUCT_MANAGEMENT,
  [RouteIdentifiers.PRODUCT_DETAIL]: ROUTERS.PRODUCT_DETAIL,
  [RouteIdentifiers.PRODUCT_ADD]: ROUTERS.PRODUCT_ADD,
  [RouteIdentifiers.PRODUCT_EDIT]: ROUTERS.PRODUCT_EDIT,
  [RouteIdentifiers.PO_MANAGEMENT]: ROUTERS.PO_MANAGEMENT,
  [RouteIdentifiers.PO_DETAIL]: ROUTERS.PO_DETAIL,
  [RouteIdentifiers.PO_ADD]: ROUTERS.PO_ADD,
  [RouteIdentifiers.PO_EDIT]: ROUTERS.PO_EDIT,
  [RouteIdentifiers.STAFF]: ROUTERS.STAFF,
  [RouteIdentifiers.STAFF_ADD]: ROUTERS.STAFF_ADD,
  [RouteIdentifiers.STAFF_EDIT]: ROUTERS.STAFF_EDIT,
  [RouteIdentifiers.USER_MANAGEMENT]: ROUTERS.USER_MANAGEMENT,
  [RouteIdentifiers.USER_DETAIL]: ROUTERS.USER_DETAIL,
  [RouteIdentifiers.ADD_USER]: ROUTERS.ADD_USER,
  [RouteIdentifiers.IMPORT_USERS]: ROUTERS.IMPORT_USERS,
  [RouteIdentifiers.CONFIGURATION]: ROUTERS.CONFIGURATION,
  [RouteIdentifiers.SALARY_MANAGEMENT]: ROUTERS.SALARY_MANAGEMENT,
  [RouteIdentifiers.ROLE_MANAGEMENT]: ROUTERS.ROLE_MANAGEMENT,
  [RouteIdentifiers.PERMISSION_MANAGEMENT]: ROUTERS.PERMISSION_MANAGEMENT,
  [RouteIdentifiers.ADMIN_LOGIN]: ROUTERS.ADMIN_LOGIN,
  [RouteIdentifiers.ADMIN_DASHBOARD]: ROUTERS.ADMIN_DASHBOARD,
  [RouteIdentifiers.ADMIN_CLIENTS]: ROUTERS.ADMIN_CLIENTS,
  [RouteIdentifiers.ADMIN_CLIENTS_NEW]: ROUTERS.ADMIN_CLIENTS_NEW,
  [RouteIdentifiers.ADMIN_CLIENT_DETAIL]: ROUTERS.ADMIN_CLIENT_DETAIL,
  [RouteIdentifiers.ADMIN_PERMISSIONS]: ROUTERS.ADMIN_PERMISSIONS,
  [RouteIdentifiers.ADMIN_STORES]: ROUTERS.ADMIN_STORES,
  [RouteIdentifiers.ADMIN_MONITORING]: ROUTERS.ADMIN_MONITORING,
  [RouteIdentifiers.ADMIN_SETTINGS]: ROUTERS.ADMIN_SETTINGS,
  [RouteIdentifiers.SAMPLE_ERRORS]: ROUTERS.SAMPLE_ERRORS,
};

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

// Helper functions for parameterized routes
export const getEmployeeDetailRoute = (employeeId: string) =>
  ROUTERS.EMPLOYEE_DETAIL.replace(':employeeId', employeeId);
export const getEmployeeEditRoute = (employeeId: string) =>
  ROUTERS.EMPLOYEE_EDIT.replace(':employeeId', employeeId);
export const getClientLoginRoute = (clientCode: string) => `/${clientCode}/login`;
export const getStoreEditRoute = (storeId: string) => `/stores/edit/${storeId}`;
export const getStaffEditRoute = (staffId: string) => `/staff/edit/${staffId}`;
export const getUserDetailRoute = (userId: string) => `/user/${userId}`;
export const getAdminClientDetailRoute = (clientCode: string) => `/admin/clients/${clientCode}`;

// Customer management helper functions
export const getCustomerDetailRoute = (customerId: string) =>
  ROUTERS.CUSTOMER_DETAIL.replace(':customerId', customerId);
export const getCustomerEditRoute = (customerId: string) =>
  ROUTERS.CUSTOMER_EDIT.replace(':customerId', customerId);

// PO management helper functions
export const getPODetailRoute = (poId: string) => ROUTERS.PO_DETAIL.replace(':poId', poId);
export const getPOEditRoute = (poId: string) => ROUTERS.PO_EDIT.replace(':poId', poId);
