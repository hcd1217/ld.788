import * as z from 'zod/v4';

import { hasRoute, RouteIdentifiers } from '@/config/routeConfig';
import type { RouteIdentifier } from '@/config/routeConfig';
import { hasIcon, IconIdentifiers } from '@/utils/iconRegistry';
import type { IconIdentifier } from '@/utils/iconRegistry';

import { numberSchema, optionalBooleanSchema, stringSchema } from './common.schemas';

// Default mobile navigation configuration for backend reference
export const DEFAULT_MOBILE_NAVIGATION_CONFIG: NavigationItem[] = [
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
export const DEFAULT_NAVIGATION_CONFIG: NavigationItem[] = [
  {
    id: 'nav-home',
    translationKey: 'common.pages.home',
    icon: IconIdentifiers.DASHBOARD,
    path: RouteIdentifiers.HOME,
    order: 1,
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
  disabled?: boolean;
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

export const NavigationItemSchema = BaseNavigationItemSchema.transform((item) => {
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

// Types derived from schemas
export type NavigationItem = z.infer<typeof NavigationItemSchema>;

// Helper for route validation
function isValidRouteIdentifier(val?: string) {
  return Boolean(val && hasRoute(val));
}

// Helper for icon validation
function isValidIconIdentifier(val?: string) {
  return Boolean(val && hasIcon(val));
}
