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
