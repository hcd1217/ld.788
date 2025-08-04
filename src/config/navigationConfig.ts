import {
  IconAddressBook,
  IconBuildingStore,
  IconCash,
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
    translationKey: 'common.home',
    icon: IconLayoutDashboard,
    path: ROUTERS.HOME,
  },
  {
    id: 'nav-store-management',
    translationKey: 'common.storeManagement',
    icon: IconBuildingStore,
    path: ROUTERS.STORES,
    hidden: true,
    activePaths: [ROUTERS.STORES, ROUTERS.STORE_CONFIG],
  },
  {
    id: 'nav-employee-management',
    translationKey: 'common.employeeManagement',
    icon: IconUsers,
    path: ROUTERS.EMPLOYEE_MANAGEMENT,
    activePaths: [ROUTERS.EMPLOYEE_MANAGEMENT, ROUTERS.EMPLOYEES_ADD, ROUTERS.EMPLOYEE_EDIT],
  },
  {
    id: 'nav-po-management',
    translationKey: 'common.poManagement',
    icon: IconShoppingCart,
    path: ROUTERS.PO_MANAGEMENT,
    activePaths: [ROUTERS.PO_ADD, ROUTERS.PO_DETAIL, ROUTERS.PO_EDIT, ROUTERS.PO_MANAGEMENT],
  },
  {
    id: 'nav-configuration',
    translationKey: 'common.configuration',
    icon: IconSettingsFilled,
    subs: [
      {
        id: 'nav-customer-management',
        translationKey: 'common.customerManagement',
        icon: IconAddressBook,
        path: ROUTERS.CUSTOMER_MANAGEMENT,
        activePaths: [ROUTERS.CUSTOMER_MANAGEMENT, ROUTERS.CUSTOMER_ADD, ROUTERS.CUSTOMER_EDIT],
      },
      {
        id: 'nav-store-management-sub',
        translationKey: 'common.storeManagement',
        icon: IconBuildingStore,
        path: ROUTERS.STORE_MANAGEMENT,
      },
      {
        id: 'nav-salary-management',
        translationKey: 'common.salaryManagement',
        icon: IconCash,
        path: ROUTERS.SALARY_MANAGEMENT,
      },
    ],
  },
  {
    id: 'nav-staff-management',
    translationKey: 'common.staffManagement',
    icon: IconUsersGroup,
    path: ROUTERS.STAFF,
    dummy: true,
    hidden: true,
    activePaths: [ROUTERS.STAFF, ROUTERS.STAFF_ADD],
  },
  {
    id: 'nav-user-management',
    translationKey: 'common.userManagement',
    icon: IconUsers,
    path: ROUTERS.USER_MANAGEMENT,
    hidden: true,
  },
  {
    id: 'nav-profile',
    translationKey: 'common.profile',
    icon: IconUserCircle,
    path: ROUTERS.PROFILE,
  },
] as const;
