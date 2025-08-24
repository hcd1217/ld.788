import {
  IconArrowLeft,
  IconLayoutDashboard,
  IconUsers,
  IconAlertTriangle,
  IconBuildingStore,
  IconShoppingCart,
  IconSettingsFilled,
  IconUserCircle,
  IconQuestionMark,
  IconAddressBook,
  IconBox,
  IconCheckupList,
  IconUsersGroup,
  IconHome,
  IconDots,
  type Icon,
  IconError404,
  IconDatabaseCog,
  IconClipboardList,
  IconTruck,
} from '@tabler/icons-react';

// Type-safe icon component type from Tabler
export type TablerIconComponent = Icon;

// Type for icon identifiers - ensures type safety
export const IconIdentifiers = {
  DATABASE_COG: 'database-cog',
  ARROW_LEFT: 'arrow-left',
  ERROR_404: 'error-404',
  DASHBOARD: 'dashboard',
  USERS: 'users',
  STORE: 'store',
  SHOPPING_CART: 'shopping-cart',
  SETTINGS: 'settings',
  USER_CIRCLE: 'user-circle',
  ALERT_TRIANGLE: 'alert-triangle',
  ADDRESS_BOOK: 'address-book',
  BOX: 'box',
  CHECKLIST: 'checklist',
  USERS_GROUP: 'users-group',
  HOME: 'home',
  DOTS: 'dots',
  CLIPBOARD: 'clipboard',
  TRUCK: 'truck',
} as const;

export type IconIdentifier = (typeof IconIdentifiers)[keyof typeof IconIdentifiers];

// Icon registry with all navigation icons
const iconRegistry: Record<IconIdentifier, TablerIconComponent> = {
  [IconIdentifiers.ERROR_404]: IconError404,
  [IconIdentifiers.DATABASE_COG]: IconDatabaseCog,
  [IconIdentifiers.ARROW_LEFT]: IconArrowLeft,
  [IconIdentifiers.DASHBOARD]: IconLayoutDashboard,
  [IconIdentifiers.USERS]: IconUsers,
  [IconIdentifiers.ALERT_TRIANGLE]: IconAlertTriangle,
  [IconIdentifiers.STORE]: IconBuildingStore,
  [IconIdentifiers.SHOPPING_CART]: IconShoppingCart,
  [IconIdentifiers.SETTINGS]: IconSettingsFilled,
  [IconIdentifiers.USER_CIRCLE]: IconUserCircle,
  [IconIdentifiers.ADDRESS_BOOK]: IconAddressBook,
  [IconIdentifiers.BOX]: IconBox,
  [IconIdentifiers.CHECKLIST]: IconCheckupList,
  [IconIdentifiers.USERS_GROUP]: IconUsersGroup,
  [IconIdentifiers.HOME]: IconHome,
  [IconIdentifiers.DOTS]: IconDots,
  [IconIdentifiers.CLIPBOARD]: IconClipboardList,
  [IconIdentifiers.TRUCK]: IconTruck,
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
