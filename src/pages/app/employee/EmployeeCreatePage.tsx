import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import * as XLSX from 'xlsx';
import { Container, rem, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconFileSpreadsheet, IconUser } from '@tabler/icons-react';
import { type TFunction } from 'i18next';
import {
  showErrorNotification,
  showSuccessNotification,
  showInfoNotification,
} from '@/utils/notifications';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { getFormValidators } from '@/utils/validation';
import { AppPageTitle, AppMobileLayout, AppDesktopLayout, GoBack, Tabs } from '@/components/common';
import { SingleEmployeeForm, BulkImportForm } from '@/components/app/employee';
import { useHrActions, useUnitList, useHrLoading, useHrError } from '@/stores/useHrStore';
import { firstName, lastName, randomElement } from '@/utils/fake';
import { ROUTERS } from '@/config/routeConfig';
import { useAction } from '@/hooks/useAction';
import { isDevelopment } from '@/utils/env';
import type { Unit } from '@/services/hr/unit';
import { useOnce } from '@/hooks/useOnce';

type SingleEmployeeFormValues = {
  firstName: string;
  lastName: string;
  unitId?: string;
  email?: string;
  phone?: string;
  workType?: 'FULL_TIME' | 'PART_TIME';
  monthlySalary?: number;
  hourlyRate?: number;
  startDate?: Date;
};

type ImportResult = {
  summary: {
    total: number;
    success: number;
    failed: number;
  };
  errors?: string[];
};

// Utility functions
type GenerateSampleExcelParams = {
  isVietnamese: boolean;
  unitOptions: Array<{ value: string; label: string }>;
  keyMap: Record<string, string>;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function EmployeeCreatePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isDesktop = useIsDesktop();
  const units = useUnitList();
  const isLoading = useHrLoading();
  const error = useHrError();
  const { loadUnits, clearError, addEmployee, addBulkEmployees } = useHrActions();
  const [activeTab, setActiveTab] = useState<string | undefined>('single');

  // Single employee form state
  const [isSingleLoading, setIsSingleLoading] = useState(false);
  const [showSingleAlert, setShowSingleAlert] = useState(false);
  const [singleError, setSingleError] = useState<string | undefined>();

  // Bulk import state
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [importResult, setImportResult] = useState<ImportResult | undefined>(undefined);

  const keyMap = useMemo(
    () => ({
      firstName: t('common.firstName'),
      lastName: t('common.lastName'),
      unit: t('employee.unit'),
      [t('common.firstName')]: 'firstName',
      [t('common.lastName')]: 'lastName',
      [t('employee.unit')]: 'unit',
    }),
    [t],
  );

  const form = useForm<SingleEmployeeFormValues>({
    initialValues: isDevelopment
      ? {
          firstName: firstName(),
          lastName: lastName(),
          unitId: randomElement(units)?.id,
          email: `${firstName().toLowerCase()}.${lastName().toLowerCase()}@example.com`,
          phone: `0901-${Math.floor(Math.random() * 1e3)}-${Math.floor(Math.random() * 1e3)}`,
          workType: Math.random() > 0.5 ? 'FULL_TIME' : 'PART_TIME',
          monthlySalary: 12000000,
          hourlyRate: 25000,
          startDate: new Date(),
        }
      : {
          firstName: '',
          lastName: '',
          unitId: undefined,
          email: undefined,
          phone: undefined,
          workType: undefined,
          monthlySalary: undefined,
          hourlyRate: undefined,
          startDate: undefined,
        },
    validate: {
      ...getFormValidators(t, ['firstName', 'lastName']),
      email: (value) =>
        value && !value.match(/^\S+@\S+\.\S+$/) ? t('validation.invalidEmail') : undefined,
      phone: (value) => (value && value.length < 10 ? t('validation.phoneTooShort') : undefined),
      monthlySalary: (value, values) => {
        if (values.workType === 'FULL_TIME' && !value) {
          return t('validation.fieldRequired');
        }
        return undefined;
      },
      hourlyRate: (value, values) => {
        if (values.workType === 'PART_TIME' && !value) {
          return t('validation.fieldRequired');
        }
        return undefined;
      },
    },
  });

  // Load units on mount
  useOnce(() => {
    void loadUnits();
  });

  // Single employee handlers
  const handleSingleSubmit = useAction<SingleEmployeeFormValues>({
    options: {
      successTitle: t('common.success'),
      successMessage: t('employee.employeeAdded'),
      errorTitle: t('common.error'),
      errorMessage: t('employee.addEmployeeFailed'),
      navigateTo: ROUTERS.EMPLOYEE_MANAGEMENT,
    },
    async actionHandler(values) {
      if (!values) {
        throw new Error(t('employee.addEmployeeFailed'));
      }

      setIsSingleLoading(true);
      setSingleError(undefined);
      setShowSingleAlert(false);

      await addEmployee({
        firstName: values.firstName,
        lastName: values.lastName,
        unitId: values.unitId,
        email: values.email,
        phone: values.phone,
        workType: values.workType,
        monthlySalary: values.monthlySalary,
        hourlyRate: values.hourlyRate,
        startDate: values.startDate,
      });
    },
    errorHandler(error) {
      const errorMessage = error instanceof Error ? error.message : t('employee.addEmployeeFailed');

      setSingleError(errorMessage);
      setShowSingleAlert(true);
    },
    cleanupHandler() {
      setIsSingleLoading(false);
    },
  });

  const handleDownloadSample = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('employee.sampleFileDownloaded'),
      errorTitle: t('common.error'),
      errorMessage: t('employee.failedToDownloadSample'),
    },
    async actionHandler() {
      setIsDownloading(true);
      showInfoNotification(t('common.downloading'), t('employee.creatingSampleFile'));
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      const unitOptions = units.map((unit) => ({
        value: unit.id,
        label: unit.name,
      }));

      generateSampleExcel({
        keyMap,
        unitOptions,
        isVietnamese: i18n.language === 'vi',
      });
    },
    cleanupHandler() {
      setIsDownloading(false);
    },
  });

  // File selection handlers
  const handleFileSelect = (selectedFile: File) => {
    if (validateFileType(selectedFile, t)) {
      setFile(selectedFile);
      setImportResult(undefined);
    } else {
      showErrorNotification(t('auth.invalidFileType'), t('employee.pleaseSelectExcelFile'));
    }
  };

  const handleFileRemove = () => {
    setFile(undefined);
    setImportResult(undefined);
  };

  const handleBulkUpload = useAction({
    options: {
      errorTitle: t('auth.importFailed'),
      errorMessage: t('auth.importFailed'),
      navigateTo: ROUTERS.EMPLOYEE_MANAGEMENT,
      delay: 2000,
    },
    async actionHandler() {
      if (!file) {
        throw new Error(t('employee.pleaseSelectFileFirst'));
      }

      setIsBulkLoading(true);
      setImportResult(undefined);
      const employees = await parseExcelFile(file, units, t, keyMap);

      if (employees.length === 0) {
        throw new Error(t('employee.noValidEmployeesFound'));
      }

      // Use bulk API for multiple employees
      await addBulkEmployees(employees);

      const result: ImportResult = {
        summary: {
          total: employees.length,
          success: employees.length,
          failed: 0,
        },
      };

      setImportResult(result);

      showSuccessNotification(
        t('auth.importSuccess'),
        t('employee.importedEmployees', {
          success: result.summary.success,
          total: result.summary.total,
        }),
      );
    },
    errorHandler(error) {
      const errorMessage = error instanceof Error ? error.message : t('auth.importFailed');

      const result: ImportResult = {
        summary: {
          total: 0,
          success: 0,
          failed: 0,
        },
        errors: [String(errorMessage)],
      };

      setImportResult(result);
    },
    cleanupHandler() {
      setIsBulkLoading(false);
    },
  });

  const iconStyle = { width: rem(12), height: rem(12) };

  if (!isDesktop) {
    return (
      <AppMobileLayout
        showLogo
        withGoBack
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={t('employee.addEmployee')} />}
      >
        <SingleEmployeeForm
          form={form}
          units={units}
          isLoading={isSingleLoading}
          showAlert={showSingleAlert}
          error={singleError}
          setShowAlert={setShowSingleAlert}
          onSubmit={handleSingleSubmit}
          onCancel={() => navigate(ROUTERS.EMPLOYEE_MANAGEMENT)}
        />
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout isLoading={isLoading} error={error} clearError={clearError}>
      <Group justify="space-between" mb="md">
        <GoBack />
      </Group>
      <AppPageTitle title={t('employee.addEmployee')} />

      <Container fluid w="100%">
        <Tabs
          value={activeTab}
          onChange={(value) => {
            if (value) {
              setActiveTab(value);
            }
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="single" leftSection={<IconUser style={iconStyle} />}>
              {t('employee.addSingleEmployee')}
            </Tabs.Tab>
            <Tabs.Tab value="bulk" leftSection={<IconFileSpreadsheet style={iconStyle} />}>
              {t('employee.bulkImportEmployees')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="single" pt="xl">
            <SingleEmployeeForm
              form={form}
              units={units}
              isLoading={isSingleLoading}
              showAlert={showSingleAlert}
              error={singleError}
              setShowAlert={setShowSingleAlert}
              onSubmit={handleSingleSubmit}
              onCancel={() => navigate(ROUTERS.EMPLOYEE_MANAGEMENT)}
            />
          </Tabs.Panel>

          <Tabs.Panel value="bulk" pt="xl">
            <BulkImportForm
              isLoading={isBulkLoading}
              isDownloading={isDownloading}
              file={file}
              importResult={importResult}
              validateFileType={(file) => validateFileType(file, t)}
              onDownloadSample={handleDownloadSample}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              onImport={handleBulkUpload}
              onCancel={() => navigate(ROUTERS.EMPLOYEE_MANAGEMENT)}
            />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </AppDesktopLayout>
  );
}

function generateSampleExcel({ isVietnamese, unitOptions, keyMap }: GenerateSampleExcelParams) {
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

function validateFileType(file: File, t: TFunction): boolean {
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const fileExtension = file.name.toLowerCase().slice(Math.max(0, file.name.lastIndexOf('.')));
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(t('employee.fileTooLarge'));
  }

  return allowedTypes.includes(fileExtension);
}

async function parseExcelFile(
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
