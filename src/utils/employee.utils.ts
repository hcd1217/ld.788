import { type TFunction } from 'i18next';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type SingleEmployeeFormValues = {
  firstName: string;
  lastName: string;
  departmentId?: string;
  email?: string;
  phone?: string;
  workType?: 'FULL_TIME' | 'PART_TIME';
  monthlySalary?: number;
  hourlyRate?: number;
  startDate?: Date;
  endDate?: Date;
  isEndDateEnabled?: boolean;
  displayOrder?: number;
};

export type ImportResult = {
  summary: {
    total: number;
    success: number;
    failed: number;
  };
  errors?: string[];
};

export function validateFileType(file: File, t: TFunction): boolean {
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const fileExtension = file.name.toLowerCase().slice(Math.max(0, file.name.lastIndexOf('.')));
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(t('employee.fileTooLarge'));
  }

  return allowedTypes.includes(fileExtension);
}
