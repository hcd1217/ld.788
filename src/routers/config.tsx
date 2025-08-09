import { ROUTERS } from '@/config/routeConfig';
import {
  CustomerConfigPage,
  ProductConfigPage,
  EmployeeListPage,
  EmployeeCreatePage,
  EmployeeDetailPage,
  EditEmployeePage,
  BlankPage,
} from './components';

export const configRouteObjects = [
  // Customer & Product Config
  { path: ROUTERS.CUSTOMER_CONFIG, Component: CustomerConfigPage },
  { path: ROUTERS.PRODUCT_CONFIG, Component: ProductConfigPage },

  // Employee Management
  { path: ROUTERS.EMPLOYEE_MANAGEMENT, Component: EmployeeListPage },
  { path: ROUTERS.EMPLOYEE_DETAIL, Component: EmployeeDetailPage },
  { path: ROUTERS.EMPLOYEE_EDIT, Component: EditEmployeePage },
  { path: ROUTERS.EMPLOYEES_ADD, Component: EmployeeCreatePage },

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
