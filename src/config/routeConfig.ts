export const ROUTERS = {
  // Root
  ROOT: '/',

  // Auth routes
  LOGIN: '/login',
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
  EMPLOYEES_EDIT: '/employees/edit/:employeeId',

  // Purchasing order management
  PO_MANAGEMENT: '/po-management',

  // Customer management
  CUSTOMER_MANAGEMENT: '/customer-management',

  // Product management
  PRODUCT_MANAGEMENT: '/product-management',

  // Department management
  DEPARTMENT_MANAGEMENT: '/department-management',

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
};

// Helper functions for parameterized routes
export const getClientLoginRoute = (clientCode: string) =>
  `/${clientCode}/login`;
export const getEmployeeDetailRoute = (employeeId: string) =>
  `/employees/${employeeId}`;
export const getEmployeeEditRoute = (employeeId: string) =>
  `/employees/edit/${employeeId}`;
export const getStoreEditRoute = (storeId: string) => `/stores/edit/${storeId}`;
export const getStaffEditRoute = (staffId: string) => `/staff/edit/${staffId}`;
export const getUserDetailRoute = (userId: string) => `/user/${userId}`;
export const getAdminClientDetailRoute = (clientCode: string) =>
  `/admin/clients/${clientCode}`;
