export const EMPLOYEE_STATUS = {
  ALL: 'all',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type EmployeeStatusType = (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];
