import * as XLSX from 'xlsx';
import { type TFunction } from 'i18next';
import { firstName, lastName } from '@/utils/fake';
import type { Unit } from '@/services/hr/employee';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type SingleEmployeeFormValues = {
  firstName: string;
  lastName: string;
  unitId?: string;
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

type GenerateSampleExcelParams = {
  isVietnamese: boolean;
  unitOptions: Array<{ value: string; label: string }>;
  keyMap: Record<string, string>;
};

export function generateSampleExcel({
  isVietnamese,
  unitOptions,
  keyMap,
}: GenerateSampleExcelParams) {
  let sampleData: Array<[string, string, string]>;

  if (isVietnamese) {
    sampleData = unitOptions.map((option) => {
      return [lastName(), firstName(), option.label];
    });
    sampleData.unshift([lastName(), firstName(), '']);
    // Cspell:disable
    sampleData.unshift(['Họ', 'Tên', 'Bộ phận']);
  } else {
    sampleData = [
      [keyMap.firstName, keyMap.lastName, keyMap.unit],
      ['John', 'Doe', unitOptions[0]?.label ?? ''],
      ['Jane', 'Smith', unitOptions[1]?.label ?? ''],
      ['Mike', 'Johnson', unitOptions[1]?.label ?? ''],
      ['Sarah', 'Wilson', ''],
    ];
  }
  // Cspell:enable

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
  // Cspell:disable-next-line
  XLSX.writeFile(workbook, 'Danh_sách_mẫu.xlsx');
}

export function validateFileType(file: File, t: TFunction): boolean {
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const fileExtension = file.name.toLowerCase().slice(Math.max(0, file.name.lastIndexOf('.')));
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(t('employee.fileTooLarge'));
  }

  return allowedTypes.includes(fileExtension);
}

export async function parseExcelFile(
  file: File,
  units: Unit[],
  t: TFunction,
  keyMap: Record<string, string>,
): Promise<SingleEmployeeFormValues[]> {
  const unitMap = new Map(units.map((unit) => [unit.name, unit.id]));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', (event) => {
      try {
        const data = event.target?.result;
        if (!data) {
          reject(new Error(t('common.failedToReadFile')));
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const sheetData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        }) as string[][];

        if (sheetData.length < 2) {
          reject(new Error(t('employee.fileRequiresHeaderAndData')));
          return;
        }

        const headers = sheetData[0].map((h) => String(h).trim());
        const employees: SingleEmployeeFormValues[] = [];

        for (let index = 1; index < sheetData.length; index++) {
          const values = sheetData[index].map((v) => String(v).trim());

          if (values.every((v) => !v)) continue;

          const employee: SingleEmployeeFormValues = {
            firstName: '',
            lastName: '',
          };
          for (const [headerIndex, header] of headers.entries()) {
            const value = values[headerIndex];
            if (!value || !keyMap[header]) continue;
            switch (keyMap[header]) {
              case 'firstName': {
                employee.firstName = value;
                break;
              }

              case 'lastName': {
                employee.lastName = value;
                break;
              }

              case 'unit': {
                employee.unitId = unitMap.get(value) ?? undefined;
                break;
              }

              default: {
                // Ignore unknown headers
                break;
              }
            }
          }

          if (employee.firstName && employee.lastName) {
            employees.push(employee);
          }
        }

        resolve(employees);
      } catch (error) {
        reject(
          new Error(
            `${t('common.failedToParseExcel')}: ${
              error instanceof Error ? error.message : t('common.unknownError')
            }`,
          ),
        );
      }
    });

    reader.addEventListener('error', () => {
      reject(new Error(t('common.failedToReadFile')));
    });

    reader.readAsArrayBuffer(file);
  });
}
