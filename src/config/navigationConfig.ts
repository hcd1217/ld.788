import {
  IconAddressBook,
  IconBox,
  IconBuildingStore,
  IconCheckupList,
  IconLayoutDashboard,
  IconSettingsFilled,
  IconShoppingCart,
  IconUserCircle,
  IconUsers,
  IconUsersGroup,
  IconHome,
  IconDots,
} from '@tabler/icons-react';
import { ROUTERS } from './routeConfig';

// Static navigation structure with stable IDs
// This prevents regenerating IDs on every render
export const NAVIGATION_STRUCTURE = [
  {
    id: 'nav-home',
    translationKey: 'common.pages.home',
    icon: IconLayoutDashboard,
    path: ROUTERS.HOME,
  },
  {
    id: 'nav-store-management',
    translationKey: 'common.pages.storeManagement',
    icon: IconBuildingStore,
    path: ROUTERS.STORES,
    hidden: true,
    activePaths: [ROUTERS.STORES, ROUTERS.STORE_CONFIG],
  },
  {
    id: 'nav-employee-management',
    translationKey: 'common.pages.employeeManagement',
    icon: IconUsers,
    path: ROUTERS.EMPLOYEE_MANAGEMENT,
    activePaths: [ROUTERS.EMPLOYEE_MANAGEMENT, ROUTERS.EMPLOYEES_ADD, ROUTERS.EMPLOYEE_EDIT],
  },
  {
    id: 'nav-po-management',
    translationKey: 'common.pages.poManagement',
    icon: IconShoppingCart,
    path: ROUTERS.PO_MANAGEMENT,
    activePaths: [ROUTERS.PO_ADD, ROUTERS.PO_DETAIL, ROUTERS.PO_EDIT, ROUTERS.PO_MANAGEMENT],
  },
  {
    id: 'nav-master-data',
    translationKey: 'common.pages.masterData',
    icon: IconSettingsFilled,
    subs: [
      {
        id: 'nav-employee-config',
        translationKey: 'common.pages.employeeConfig',
        icon: IconUsers,
        path: ROUTERS.EMPLOYEE_MANAGEMENT,
        activePaths: [ROUTERS.EMPLOYEE_MANAGEMENT, ROUTERS.EMPLOYEES_ADD, ROUTERS.EMPLOYEE_EDIT],
      },
      {
        id: 'nav-customer-config',
        translationKey: 'common.pages.customerConfig',
        icon: IconAddressBook,
        path: ROUTERS.CUSTOMER_CONFIG,
      },
      {
        id: 'nav-product-config',
        translationKey: 'common.pages.productConfig',
        icon: IconBox,
        path: ROUTERS.PRODUCT_CONFIG,
      },
      {
        id: 'nav-role-management',
        translationKey: 'common.pages.roleManagement',
        icon: IconCheckupList,
      },
    ],
  },
  {
    id: 'nav-staff-management',
    translationKey: 'common.pages.staffManagement',
    icon: IconUsersGroup,
    path: ROUTERS.STAFF,
    hidden: true,
    activePaths: [ROUTERS.STAFF, ROUTERS.STAFF_ADD],
  },
  {
    id: 'nav-user-management',
    translationKey: 'common.pages.userManagement',
    icon: IconUsers,
    path: ROUTERS.USER_MANAGEMENT,
    hidden: true,
  },
  {
    id: 'nav-profile',
    translationKey: 'common.pages.profile',
    icon: IconUserCircle,
    path: ROUTERS.PROFILE,
  },
] as const;

// Mobile navigation structure for bottom navigation
// Limited to 4 items for optimal mobile UX
export const MOBILE_NAVIGATION_STRUCTURE = [
  {
    id: 'mobile-nav-home',
    translationKey: 'common.pages.home',
    icon: IconHome,
    path: ROUTERS.HOME,
  },
  {
    id: 'mobile-nav-employees',
    translationKey: 'common.pages.employeeManagementMobile',
    icon: IconAddressBook,
    path: ROUTERS.EMPLOYEE_MANAGEMENT,
  },
  {
    id: 'mobile-nav-po',
    translationKey: 'common.pages.poManagementMobile',
    icon: IconShoppingCart,
    path: ROUTERS.PO_MANAGEMENT,
  },
  {
    id: 'mobile-nav-more',
    translationKey: 'common.pages.more',
    icon: IconDots,
    path: ROUTERS.MORE,
  },
] as const;
