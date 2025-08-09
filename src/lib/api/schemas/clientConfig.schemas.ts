import * as z from 'zod/v4';
import {
  booleanSchema,
  ClientPublicConfigSchema,
  dictionarySchema,
  falseBooleanSchema,
  numberSchema,
  optionalBooleanSchema,
  stringSchema,
  trueBooleanSchema,
} from './common.schemas';
import { ROUTERS, hasRoute, RouteIdentifiers } from '@/config/routeConfig';
import type { RouteIdentifier } from '@/config/routeConfig';
import { hasIcon, IconIdentifiers } from '@/utils/iconRegistry';
import type { IconIdentifier } from '@/utils/iconRegistry';

// Default mobile navigation configuration for backend reference
const DEFAULT_MOBILE_NAVIGATION_CONFIG: NavigationItem[] = [
  {
    id: 'mobile-nav-home',
    translationKey: 'common.pages.home',
    icon: IconIdentifiers.HOME,
    path: RouteIdentifiers.HOME,
    order: 1,
  },
  {
    id: 'mobile-nav-employees',
    translationKey: 'common.pages.employeeManagementMobile',
    icon: IconIdentifiers.ADDRESS_BOOK,
    path: RouteIdentifiers.EMPLOYEE_MANAGEMENT,
    order: 2,
  },
  {
    id: 'mobile-nav-po',
    translationKey: 'common.pages.poManagementMobile',
    icon: IconIdentifiers.SHOPPING_CART,
    path: RouteIdentifiers.PO_MANAGEMENT,
    order: 3,
  },
  {
    id: 'mobile-nav-more',
    translationKey: 'common.pages.more',
    icon: IconIdentifiers.DOTS,
    path: RouteIdentifiers.MORE,
    order: 4,
  },
];

// Default navigation configuration for backend reference
const DEFAULT_NAVIGATION_CONFIG: NavigationItem[] = [
  {
    id: 'nav-home',
    translationKey: 'common.pages.home',
    icon: IconIdentifiers.DASHBOARD,
    path: RouteIdentifiers.HOME,
    order: 1,
  },
  {
    id: 'nav-store-management',
    translationKey: 'common.pages.storeManagement',
    icon: IconIdentifiers.STORE,
    path: RouteIdentifiers.STORES,
    order: 2,
    hidden: true,
    activePaths: [RouteIdentifiers.STORES, RouteIdentifiers.STORE_CONFIG],
  },
  {
    id: 'nav-employee-management',
    translationKey: 'common.pages.employeeManagement',
    icon: IconIdentifiers.USERS,
    path: RouteIdentifiers.EMPLOYEE_MANAGEMENT,
    order: 3,
    activePaths: [
      RouteIdentifiers.EMPLOYEE_MANAGEMENT,
      RouteIdentifiers.EMPLOYEES_ADD,
      RouteIdentifiers.EMPLOYEE_EDIT,
    ],
  },
  {
    id: 'nav-po-management',
    translationKey: 'common.pages.poManagement',
    icon: IconIdentifiers.SHOPPING_CART,
    path: RouteIdentifiers.PO_MANAGEMENT,
    order: 4,
    activePaths: [
      RouteIdentifiers.PO_MANAGEMENT,
      RouteIdentifiers.PO_ADD,
      RouteIdentifiers.PO_DETAIL,
      RouteIdentifiers.PO_EDIT,
    ],
  },
  {
    id: 'nav-configuration',
    translationKey: 'common.pages.configuration',
    icon: IconIdentifiers.SETTINGS,
    order: 5,
    subs: [
      // {
      //   id: 'nav-employee-config',
      //   translationKey: 'common.pages.employeeConfig',
      //   icon: IconIdentifiers.USERS,
      //   path: RouteIdentifiers.EMPLOYEE_MANAGEMENT,
      //   order: 1,
      // },
      {
        id: 'nav-customer-config',
        translationKey: 'common.pages.customerConfig',
        icon: IconIdentifiers.ADDRESS_BOOK,
        path: RouteIdentifiers.CUSTOMER_MANAGEMENT,
        order: 2,
      },
      {
        id: 'nav-product-config',
        translationKey: 'common.pages.productConfig',
        icon: IconIdentifiers.BOX,
        path: RouteIdentifiers.PRODUCT_MANAGEMENT,
        order: 3,
      },
      {
        id: 'nav-role-config',
        translationKey: 'common.pages.roleManagement',
        icon: IconIdentifiers.CHECKLIST,
        path: RouteIdentifiers.ROLE_MANAGEMENT,
        order: 4,
        roles: ['admin'],
      },
    ],
  },
  {
    id: 'nav-profile',
    translationKey: 'common.pages.profile',
    icon: IconIdentifiers.USER_CIRCLE,
    path: RouteIdentifiers.PROFILE,
    order: 99,
  },
];

// Define the base navigation item type for proper typing
interface BaseNavigationItemType {
  id: string;
  icon?: string;
  translationKey: string;
  path?: string; // Will be validated by route refinement
  order?: number;
  hidden?: boolean;
  activePaths?: string[]; // Will be validated by route refinement
  roles?: string[];
  featureFlags?: string[];
  subs?: BaseNavigationItemType[];
}
export interface NavigationItemType extends BaseNavigationItemType {
  icon?: IconIdentifier; // Will be validated by icon refinement
  path?: RouteIdentifier; // Will be validated by route refinement
  activePaths?: RouteIdentifier[]; // Will be validated by route refinement
  subs?: NavigationItemType[];
}

// Schema for navigation item (backend-driven navigation)
const BaseNavigationItemSchema: z.ZodType<BaseNavigationItemType> = z.lazy(() =>
  z.object({
    id: stringSchema,
    translationKey: stringSchema, // i18n translation key
    icon: stringSchema
      .refine((val) => isValidIconIdentifier(val), {
        message: 'Invalid icon identifier',
      })
      .optional(),
    path: stringSchema
      .refine((val) => isValidRouteIdentifier(val), {
        message: 'Invalid route identifier',
      })
      .optional(), // Route identifier
    order: numberSchema.optional(), // Display order
    hidden: optionalBooleanSchema, // Visibility flag
    activePaths: z
      .array(
        stringSchema.refine(isValidRouteIdentifier, {
          message: 'Invalid route identifier in activePaths',
        }),
      )
      .optional(), // Route identifiers that highlight this item
    roles: z.array(stringSchema).optional(), // Required roles
    featureFlags: z.array(stringSchema).optional(), // Required feature flags
    subs: z.array(BaseNavigationItemSchema).optional(), // Nested items
  }),
);

const NavigationItemSchema = BaseNavigationItemSchema.transform((item) => {
  return transform(item);

  function transform({
    icon,
    path,
    activePaths,
    subs,
    ...props
  }: BaseNavigationItemType): NavigationItemType {
    return {
      icon: isValidIconIdentifier(icon) ? (icon as IconIdentifier) : undefined,
      path: isValidRouteIdentifier(path) ? (path as RouteIdentifier) : undefined,
      activePaths: activePaths
        ?.filter((p) => isValidRouteIdentifier(p))
        .map((p) => p as RouteIdentifier),
      ...props,
      subs: subs?.map((sub) => transform(sub)),
    };
  }
});

// Schema for client config
export const ClientConfigSchema = z.object({
  sessionTimeoutMinutes: numberSchema.optional(),
  maxConcurrentSessions: numberSchema.optional(),
  allowPasswordReset: booleanSchema.optional(),
  allowSelfRegistration: booleanSchema.optional(),
  translations: dictionarySchema.optional(),
  navigation: z.array(NavigationItemSchema).optional().default(DEFAULT_NAVIGATION_CONFIG), // Backend-driven navigation
  mobileNavigation: z
    .array(NavigationItemSchema)
    .optional()
    .default(DEFAULT_MOBILE_NAVIGATION_CONFIG), // Backend-driven mobile navigation
  ...ClientPublicConfigSchema.shape,
});

export const RouteConfigSchema = z.object({
  [ROUTERS.ROOT]: trueBooleanSchema,
  [ROUTERS.LOGIN]: trueBooleanSchema,
  [ROUTERS.CLIENT_LOGIN]: trueBooleanSchema,
  [ROUTERS.FORGOT_PASSWORD]: optionalBooleanSchema,
  [ROUTERS.RESET_PASSWORD]: optionalBooleanSchema,
  [ROUTERS.REGISTER]: falseBooleanSchema,
  [ROUTERS.TIME_KEEPER_DASHBOARD]: trueBooleanSchema,
  [ROUTERS.HOME]: optionalBooleanSchema,
  [ROUTERS.EXPLORE]: trueBooleanSchema,
  [ROUTERS.MORE]: trueBooleanSchema,
  [ROUTERS.PROFILE]: trueBooleanSchema,
  [ROUTERS.SETTINGS]: trueBooleanSchema,
  [ROUTERS.NOTIFICATIONS]: optionalBooleanSchema,
  [ROUTERS.STORES]: optionalBooleanSchema,
  [ROUTERS.STORE_CONFIG]: optionalBooleanSchema,
  [ROUTERS.STORE_MANAGEMENT]: optionalBooleanSchema,
  [ROUTERS.STORE_EDIT]: optionalBooleanSchema,
  [ROUTERS.EMPLOYEE_MANAGEMENT]: optionalBooleanSchema,
  [ROUTERS.EMPLOYEE_DETAIL]: optionalBooleanSchema,
  [ROUTERS.EMPLOYEES_ADD]: optionalBooleanSchema,
  [ROUTERS.EMPLOYEE_EDIT]: optionalBooleanSchema,
  [ROUTERS.CUSTOMER_MANAGEMENT]: optionalBooleanSchema,
  [ROUTERS.CUSTOMER_DETAIL]: optionalBooleanSchema,
  [ROUTERS.CUSTOMER_ADD]: optionalBooleanSchema,
  [ROUTERS.CUSTOMER_EDIT]: optionalBooleanSchema,
  [ROUTERS.PRODUCT_MANAGEMENT]: trueBooleanSchema,
  [ROUTERS.PRODUCT_DETAIL]: trueBooleanSchema,
  [ROUTERS.PRODUCT_ADD]: trueBooleanSchema,
  [ROUTERS.PRODUCT_EDIT]: trueBooleanSchema,
  [ROUTERS.PO_MANAGEMENT]: optionalBooleanSchema,
  [ROUTERS.PO_DETAIL]: optionalBooleanSchema,
  [ROUTERS.PO_ADD]: optionalBooleanSchema,
  [ROUTERS.PO_EDIT]: optionalBooleanSchema,
  [ROUTERS.STAFF]: optionalBooleanSchema,
  [ROUTERS.STAFF_ADD]: optionalBooleanSchema,
  [ROUTERS.STAFF_EDIT]: optionalBooleanSchema,
  [ROUTERS.USER_MANAGEMENT]: optionalBooleanSchema,
  [ROUTERS.USER_DETAIL]: optionalBooleanSchema,
  [ROUTERS.ADD_USER]: optionalBooleanSchema,
  [ROUTERS.IMPORT_USERS]: optionalBooleanSchema,
  [ROUTERS.CONFIGURATION]: optionalBooleanSchema,
  [ROUTERS.SALARY_MANAGEMENT]: optionalBooleanSchema,
  [ROUTERS.ROLE_MANAGEMENT]: optionalBooleanSchema,
  [ROUTERS.PERMISSION_MANAGEMENT]: optionalBooleanSchema,
  [ROUTERS.ADMIN_LOGIN]: falseBooleanSchema,
  [ROUTERS.ADMIN_DASHBOARD]: falseBooleanSchema,
  [ROUTERS.ADMIN_CLIENTS]: falseBooleanSchema,
  [ROUTERS.ADMIN_CLIENTS_NEW]: falseBooleanSchema,
  [ROUTERS.ADMIN_CLIENT_DETAIL]: falseBooleanSchema,
  [ROUTERS.ADMIN_PERMISSIONS]: falseBooleanSchema,
  [ROUTERS.ADMIN_STORES]: falseBooleanSchema,
  [ROUTERS.ADMIN_MONITORING]: falseBooleanSchema,
  [ROUTERS.ADMIN_SETTINGS]: falseBooleanSchema,
  [ROUTERS.SAMPLE_ERRORS]: falseBooleanSchema,
});

// Types derived from schemas
export type NavigationItem = z.infer<typeof NavigationItemSchema>;
export type ClientConfig = z.infer<typeof ClientConfigSchema>;
export type RouteConfig = z.infer<typeof RouteConfigSchema>;

// Helper for route validation
function isValidRouteIdentifier(val?: string) {
  return Boolean(val && hasRoute(val));
}

// Helper for icon validation
function isValidIconIdentifier(val?: string) {
  return Boolean(val && hasIcon(val));
}
