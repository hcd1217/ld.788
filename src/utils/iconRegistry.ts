import {
  type Icon,
  IconAddressBook,
  IconAlertTriangle,
  IconArrowLeft,
  IconBox,
  IconBuilding,
  IconBuildingStore,
  IconCalendar,
  IconCheckupList,
  IconClipboardList,
  IconDatabaseCog,
  IconDots,
  IconError404,
  IconHome,
  IconLayoutDashboard,
  IconQuestionMark,
  IconSettingsFilled,
  IconShoppingCart,
  IconTruck,
  IconUser,
  IconUserCircle,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';

// Type-safe icon component type from Tabler
export type TablerIconComponent = Icon;

// Type for icon identifiers - ensures type safety
export const IconIdentifiers = {
  ADDRESS_BOOK: 'address-book',
  ALERT_TRIANGLE: 'alert-triangle',
  ARROW_LEFT: 'arrow-left',
  BOX: 'box',
  BUILDING: 'building',
  CALENDAR: 'calendar',
  CHECKLIST: 'checklist',
  CLIPBOARD: 'clipboard',
  DASHBOARD: 'dashboard',
  DATABASE_COG: 'database-cog',
  DOTS: 'dots',
  ERROR_404: 'error-404',
  HOME: 'home',
  SETTINGS: 'settings',
  SHOPPING_CART: 'shopping-cart',
  STORE: 'store',
  TRUCK: 'truck',
  USER_CIRCLE: 'user-circle',
  USER: 'user',
  USERS_GROUP: 'users-group',
  USERS: 'users',
} as const;

export type IconIdentifier = (typeof IconIdentifiers)[keyof typeof IconIdentifiers];

// Icon registry with all navigation icons
const iconRegistry: Record<IconIdentifier, TablerIconComponent> = {
  [IconIdentifiers.ADDRESS_BOOK]: IconAddressBook,
  [IconIdentifiers.ALERT_TRIANGLE]: IconAlertTriangle,
  [IconIdentifiers.ARROW_LEFT]: IconArrowLeft,
  [IconIdentifiers.BOX]: IconBox,
  [IconIdentifiers.BUILDING]: IconBuilding,
  [IconIdentifiers.CALENDAR]: IconCalendar,
  [IconIdentifiers.CHECKLIST]: IconCheckupList,
  [IconIdentifiers.CLIPBOARD]: IconClipboardList,
  [IconIdentifiers.DASHBOARD]: IconLayoutDashboard,
  [IconIdentifiers.DATABASE_COG]: IconDatabaseCog,
  [IconIdentifiers.DOTS]: IconDots,
  [IconIdentifiers.ERROR_404]: IconError404,
  [IconIdentifiers.HOME]: IconHome,
  [IconIdentifiers.SETTINGS]: IconSettingsFilled,
  [IconIdentifiers.SHOPPING_CART]: IconShoppingCart,
  [IconIdentifiers.STORE]: IconBuildingStore,
  [IconIdentifiers.TRUCK]: IconTruck,
  [IconIdentifiers.USER_CIRCLE]: IconUserCircle,
  [IconIdentifiers.USER]: IconUser,
  [IconIdentifiers.USERS_GROUP]: IconUsersGroup,
  [IconIdentifiers.USERS]: IconUsers,
};

// Default fallback icon
const defaultIcon: TablerIconComponent = IconQuestionMark;

/**
 * Retrieves an icon component by its identifier
 * @param identifier - IconIdentifier or string
 * @returns The corresponding Tabler icon component or default icon
 */
export function getIcon(identifier?: IconIdentifier): TablerIconComponent {
  return identifier ? iconRegistry[identifier] : defaultIcon;
}

/**
 * Check if an icon identifier exists in the registry
 * @param identifier - Icon identifier to check
 * @returns boolean indicating if the icon exists
 */
export function hasIcon(identifier: string): boolean {
  return identifier.toLowerCase() in iconRegistry;
}
