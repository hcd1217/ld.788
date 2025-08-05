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
    id: 'nav-configuration',
    translationKey: 'common.pages.configuration',
    icon: IconSettingsFilled,
    subs: [
      {
        id: 'nav-employee-management',
        translationKey: 'common.pages.employeeConfig',
        icon: IconUsers,
        path: ROUTERS.EMPLOYEE_MANAGEMENT,
        activePaths: [ROUTERS.EMPLOYEE_MANAGEMENT, ROUTERS.EMPLOYEES_ADD, ROUTERS.EMPLOYEE_EDIT],
      },
      {
        id: 'nav-customer-management',
        translationKey: 'common.pages.customerConfig',
        icon: IconAddressBook,
      },
      {
        id: 'nav-product-management',
        translationKey: 'common.pages.productConfig',
        icon: IconBox,
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
