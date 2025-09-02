import { ROUTERS } from '@/config/routeConfig';
import { lazy } from 'react';

const EmployeeListPage = lazy(async () => {
  const module = await import('@/pages/app/employee/EmployeeListPage');
  return { default: module.EmployeeListPage };
});

const EmployeeFormPage = lazy(async () => {
  const module = await import('@/pages/app/employee/EmployeeFormPage');
  return { default: module.EmployeeFormPage };
});

const EmployeeDetailPage = lazy(async () => {
  const module = await import('@/pages/app/employee/EmployeeDetailPage');
  return { default: module.EmployeeDetailPage };
});

export const managementRouteObjects = [
  // Employee Management
  { path: ROUTERS.EMPLOYEE_MANAGEMENT, Component: EmployeeListPage },
  { path: ROUTERS.EMPLOYEE_DETAIL, Component: EmployeeDetailPage },
  { path: ROUTERS.EMPLOYEE_EDIT, Component: () => <EmployeeFormPage mode="edit" /> },
  { path: ROUTERS.EMPLOYEES_ADD, Component: () => <EmployeeFormPage mode="create" /> },
];
