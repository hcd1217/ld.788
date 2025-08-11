import { ROUTERS } from '@/config/routeConfig';
import { EmployeeListPage, EmployeeFormPage, EmployeeDetailPage, BlankPage } from './components';

export const managementRouteObjects = [
  // Employee Management
  { path: ROUTERS.EMPLOYEE_MANAGEMENT, Component: EmployeeListPage },
  { path: ROUTERS.EMPLOYEE_DETAIL, Component: EmployeeDetailPage },
  { path: ROUTERS.EMPLOYEE_EDIT, Component: () => <EmployeeFormPage mode="edit" /> },
  { path: ROUTERS.EMPLOYEES_ADD, Component: () => <EmployeeFormPage mode="create" /> },

  // Customer Management (placeholder)
  { path: ROUTERS.CUSTOMER_MANAGEMENT, Component: BlankPage },
  { path: ROUTERS.CUSTOMER_DETAIL, Component: BlankPage },
  { path: ROUTERS.CUSTOMER_ADD, Component: BlankPage },
  { path: ROUTERS.CUSTOMER_EDIT, Component: BlankPage },

  // Product Management (placeholder)
  { path: ROUTERS.PRODUCT_MANAGEMENT, Component: BlankPage },
  { path: ROUTERS.PRODUCT_DETAIL, Component: BlankPage },
  { path: ROUTERS.PRODUCT_ADD, Component: BlankPage },
  { path: ROUTERS.PRODUCT_EDIT, Component: BlankPage },
];
