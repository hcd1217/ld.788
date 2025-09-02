import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { rem, Loader, Center } from '@mantine/core';
import { IconFileSpreadsheet, IconUser } from '@tabler/icons-react';
import {
  showErrorNotification,
  showSuccessNotification,
  showInfoNotification,
} from '@/utils/notifications';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useEmployeeForm } from '@/hooks/useEmployeeForm';
import { Tabs, PermissionDeniedPage } from '@/components/common';
import { SingleEmployeeForm, BulkImportForm, EmployeeFormLayout } from '@/components/app/employee';
import { useHrActions, useUnitList, useHrLoading, useHrError } from '@/stores/useHrStore';
import { employeeService } from '@/services/hr/employee';
import { ROUTERS } from '@/config/routeConfig';
import { useAction } from '@/hooks/useAction';
import { useOnce } from '@/hooks/useOnce';
import { logError } from '@/utils/logger';
import {
  type SingleEmployeeFormValues,
  type ImportResult,
  generateSampleExcel,
  validateFileType,
  parseExcelFile,
} from '@/utils/employee.utils';
import { usePermissions } from '@/stores/useAppStore';

type EmployeeFormPageProps = {
  readonly mode: 'create' | 'edit';
};

export function EmployeeFormPage({ mode }: EmployeeFormPageProps) {
  const { employeeId: id } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isMobile } = useDeviceType();
  const permissions = usePermissions();
  const units = useUnitList();
  const isLoading = useHrLoading();
  const error = useHrError();
  const { loadUnits, clearError, addEmployee, addBulkEmployees } = useHrActions();
  // Mode-specific state
  const isEditMode = mode === 'edit';
  const [activeTab, setActiveTab] = useState<string | undefined>('single');
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(isEditMode);

  // Single employee form state
  const [isSingleLoading, setIsSingleLoading] = useState(false);
  const [showSingleAlert, setShowSingleAlert] = useState(false);
  const [singleError, setSingleError] = useState<string | undefined>();

  // Bulk import state (create mode only)
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

  // Use custom hook for form
  const form = useEmployeeForm({ isEditMode, units });

  // Load employee data for edit mode
  const loadEmployee = async () => {
    if (!isEditMode || !id) {
      return;
    }

    try {
      setIsLoadingEmployee(true);
      const employee = await employeeService.getEmployee(id);

      if (!employee) {
        navigate(ROUTERS.EMPLOYEE_MANAGEMENT);
        return;
      }

      form.setValues({
        firstName: employee.firstName,
        lastName: employee.lastName,
        unitId: employee.unitId,
        email: employee.email,
        phone: employee.phone,
        workType: employee.workType,
        monthlySalary: employee.monthlySalary,
        hourlyRate: employee.hourlyRate,
        startDate: employee.startDate,
        endDate: employee.endDate,
        isEndDateEnabled: false,
        displayOrder: employee.displayOrder,
      });
    } catch (error) {
      logError('Failed to load employee', error, {
        module: 'EmployeeFormPage',
        action: 'loadEmployee',
      });
      setSingleError(t('employee.notFound'));
      setShowSingleAlert(true);
    } finally {
      setIsLoadingEmployee(false);
    }
  };

  // Load units and employee data on mount
  useOnce(() => {
    void loadUnits();
    if (isEditMode) {
      void loadEmployee();
    }
  });

  // Handle form submission (create or edit)
  const handleSingleSubmit = useAction<SingleEmployeeFormValues>({
    options: {
      successTitle: t('common.success'),
      successMessage: isEditMode ? t('employee.employeeUpdated') : t('employee.employeeAdded'),
      errorTitle: t('common.error'),
      errorMessage: isEditMode
        ? t('employee.updateEmployeeFailed')
        : t('employee.addEmployeeFailed'),
      navigateTo: ROUTERS.EMPLOYEE_MANAGEMENT,
    },
    async actionHandler(values) {
      if (!values) {
        throw new Error(
          isEditMode ? t('employee.updateEmployeeFailed') : t('employee.addEmployeeFailed'),
        );
      }

      setIsSingleLoading(true);
      setSingleError(undefined);
      setShowSingleAlert(false);

      if (isEditMode && id) {
        // Update existing employee
        await employeeService.updateEmployee(id, {
          firstName: values.firstName,
          lastName: values.lastName,
          unitId: values.unitId,
          email: values.email,
          phone: values.phone,
          workType: values.workType,
          monthlySalary: values.monthlySalary,
          hourlyRate: values.hourlyRate,
          startDate: values.startDate ?? new Date(),
          displayOrder: values.displayOrder,
          ...(values.isEndDateEnabled && { endDate: values.endDate }),
        });
      } else {
        // Create new employee
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
      }
    },
    errorHandler(error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : isEditMode
            ? t('employee.updateEmployeeFailed')
            : t('employee.addEmployeeFailed');

      setSingleError(errorMessage);
      setShowSingleAlert(true);
    },
    cleanupHandler() {
      setIsSingleLoading(false);
    },
  });

  // Bulk import handlers (create mode only)
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

  const handleFileSelect = (selectedFile: File) => {
    try {
      if (validateFileType(selectedFile, t)) {
        setFile(selectedFile);
        setImportResult(undefined);
      }
    } catch (error) {
      showErrorNotification(
        t('common.error'),
        error instanceof Error ? error.message : t('employee.pleaseSelectExcelFile'),
      );
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

  const iconStyle = useMemo(() => ({ width: rem(12), height: rem(12) }), []);
  const pageTitle = isEditMode ? t('employee.editEmployee') : t('employee.addEmployee');
  const navigateToList = () => navigate(ROUTERS.EMPLOYEE_MANAGEMENT);

  // Show loader while loading employee data in edit mode
  if (isLoadingEmployee) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  // Common form props
  const formProps = {
    form,
    units,
    isLoading: isSingleLoading,
    showAlert: showSingleAlert,
    error: singleError,
    setShowAlert: setShowSingleAlert,
    onSubmit: handleSingleSubmit,
    onCancel: navigateToList,
    isEditMode,
  };

  if (!permissions.employee.canView) {
    return <PermissionDeniedPage />;
  }
  if (isEditMode && !permissions.employee.canEdit) {
    return <PermissionDeniedPage />;
  }
  if (!isEditMode && !permissions.employee.canCreate) {
    return <PermissionDeniedPage />;
  }

  return (
    <EmployeeFormLayout
      isLoading={isLoading}
      error={error}
      clearError={clearError}
      pageTitle={pageTitle}
      isEditMode={isEditMode}
      isMobile={isMobile}
    >
      {isMobile || isEditMode ? (
        <SingleEmployeeForm {...formProps} />
      ) : (
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
            <SingleEmployeeForm {...formProps} />
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
              onCancel={navigateToList}
            />
          </Tabs.Panel>
        </Tabs>
      )}
    </EmployeeFormLayout>
  );
}
