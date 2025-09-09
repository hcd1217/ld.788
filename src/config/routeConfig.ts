// Unified route definitions - single source of truth
const ROUTE_DEFINITIONS = {
  // Root
  ROOT: { id: 'root', path: '/' },

  // Auth routes
  LOGIN: { id: 'login', path: '/login' },
  MAGIC_LINK: { id: 'magic-link', path: '/magic-link' },
  CLIENT_LOGIN: { id: 'client-login', path: '/:clientCode/login' },
  LOGOUT: { id: 'logout', path: '/logout' },

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
  MORE: { id: 'more', path: '/more' },
  PROFILE: { id: 'profile', path: '/profile' },
  NOTIFICATIONS: { id: 'notifications', path: '/notifications' },

  // Config routes
  CUSTOMER_CONFIG: { id: 'customer-config', path: '/customer-config' },
  PRODUCT_CONFIG: { id: 'product-config', path: '/product-config' },

  // Employee management
  EMPLOYEE_MANAGEMENT: { id: 'employee-management', path: '/employee-management' },
  EMPLOYEE_DETAIL: { id: 'employee-detail', path: '/employees/:employeeId' },
  EMPLOYEES_ADD: { id: 'employees-add', path: '/employees/add' },
  EMPLOYEE_EDIT: { id: 'employee-edit', path: '/employees/edit/:employeeId' },

  // PO management
  PO_MANAGEMENT: { id: 'po-management', path: '/po-management' },
  PO_DETAIL: { id: 'po-detail', path: '/po/:poId' },
  PO_ADD: { id: 'po-add', path: '/po/add' },
  PO_EDIT: { id: 'po-edit', path: '/po/edit/:poId' },

  // Delivery management
  DELIVERY_MANAGEMENT: { id: 'delivery-management', path: '/delivery-management' },
  DELIVERY_DETAIL: { id: 'delivery-detail', path: '/delivery/:deliveryId' },
  DELIVERY_UPDATE_ORDER: { id: 'delivery-update-order', path: '/delivery/update-order' },
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

// PO management helper functions
export const getPODetailRoute = (poId: string) => replaceRouteParams(ROUTERS.PO_DETAIL, { poId });

export const getPOEditRoute = (poId: string) => replaceRouteParams(ROUTERS.PO_EDIT, { poId });

export const getDeliveryDetailRoute = (deliveryId: string) =>
  replaceRouteParams(ROUTERS.DELIVERY_DETAIL, { deliveryId });
