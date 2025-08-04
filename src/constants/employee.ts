export const EMPLOYEE_STATUS = {
  ALL: 'all',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const VIEW_MODE = {
  TABLE: 'table',
  GRID: 'grid',
} as const;

export type EmployeeStatusType = (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];
export type ViewModeType = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];
