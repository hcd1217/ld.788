import { useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router';

import { Center, Loader, rem } from '@mantine/core';
import { IconFileSpreadsheet, IconUser } from '@tabler/icons-react';

import { BulkImportForm, EmployeeFormLayout, SingleEmployeeForm } from '@/components/app/employee';
import { PermissionDeniedPage, Tabs } from '@/components/common';
import { ROUTERS } from '@/config/routeConfig';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useEmployeeForm } from '@/hooks/useEmployeeForm';
import { useOnce } from '@/hooks/useOnce';
import { useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import { employeeService } from '@/services/hr/employee';
import { useAppStore, useClientConfig, usePermissions } from '@/stores/useAppStore';
import { useHrActions, useHrError, useHrLoading } from '@/stores/useHrStore';
import {
  generateSampleExcel,
  type ImportResult,
  parseExcelFile,
  type SingleEmployeeFormValues,
  validateFileType,
} from '@/utils/employee.utils';
import { logError } from '@/utils/logger';
import {
  showErrorNotification,
  showInfoNotification,
  showSuccessNotification,
} from '@/utils/notifications';
import { delay } from '@/utils/time';

type EmployeeFormPageProps = {
  readonly mode: 'create' | 'edit';
};

export function EmployeeFormPage({ mode }: EmployeeFormPageProps) {
  const { employeeId: id } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isMobile } = useDeviceType();
  const permissions = usePermissions();
  const isLoading = useHrLoading();
  const error = useHrError();
  const { clearError, addEmployee, addBulkEmployees } = useHrActions();
  const { overviewData } = useAppStore();
  const clientConfig = useClientConfig();

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

  const units = useMemo(() => {
    return overviewData?.departments ?? [];
  }, [overviewData]);

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
    if (isEditMode) {
      void loadEmployee();
    }
  });

  // Handle form submission (create or edit)
  const handleSingleSubmit = useSWRAction<SingleEmployeeFormValues>(
    isEditMode ? `update-employee-${id}` : 'create-employee',
    async (values) => {
      if (!values) {
        throw new Error(t('common.invalidFormData'));
      }
      if (isEditMode && !permissions.employee.canEdit) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (isEditMode && !id) {
        throw new Error(t('common.invalidFormData'));
      }
      if (!isEditMode && !permissions.employee.canCreate) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }

      setIsSingleLoading(true);
      setSingleError(undefined);
      setShowSingleAlert(false);

      if (isEditMode && id) {
        // Update existing employee
        const result = await employeeService.updateEmployee(id, {
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
        return result;
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
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: isEditMode ? t('employee.employeeUpdated') : t('employee.employeeAdded'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: isEditMode
          ? t('employee.updateEmployeeFailed')
          : t('employee.addEmployeeFailed'),
      },
      onSuccess: () => {
        navigate(ROUTERS.EMPLOYEE_MANAGEMENT);
      },
      onSettled: () => {
        setIsSingleLoading(false);
      },
    },
  );

  // Bulk import handlers (create mode only)
  const handleDownloadSample = useSWRAction(
    'download-employee-sample',
    async () => {
      setIsDownloading(true);
      showInfoNotification(t('common.downloading'), t('employee.creatingSampleFile'));
      await delay(1000);
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
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('employee.sampleFileDownloaded'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('employee.failedToDownloadSample'),
      },
      onSettled: () => {
        setIsDownloading(false);
      },
    },
  );

  const handleFileSelect = (selectedFile: File) => {
    try {
      if (validateFileType(selectedFile, t)) {
        setFile(selectedFile);
        setImportResult(undefined);
      }
    } catch (error) {
      showErrorNotification(
        t('common.errors.notificationTitle'),
        error instanceof Error ? error.message : t('common.file.pleaseSelectExcelFile'),
      );
    }
  };

  const handleFileRemove = () => {
    setFile(undefined);
    setImportResult(undefined);
  };

  const handleBulkUpload = useSWRAction(
    'bulk-upload-employees',
    async () => {
      if (!file) {
        throw new Error(t('common.file.pleaseSelectFileFirst'));
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
        t('common.bulkImport.importSuccess', { entity: t('common.entity.employee') }),
        t('employee.importedEmployees', {
          success: result.summary.success,
          total: result.summary.total,
        }),
      );

      return result;
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.bulkImport.importFailed', { entity: t('common.entity.employee') }),
      },
      onSuccess: () => {
        setTimeout(() => {
          navigate(ROUTERS.EMPLOYEE_MANAGEMENT);
        }, 2000);
      },
      onError: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t('common.bulkImport.importFailed', { entity: t('common.entity.employee') });

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
      onSettled: () => {
        setIsBulkLoading(false);
      },
    },
  );

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
    onSubmit: handleSingleSubmit.trigger,
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
        <SingleEmployeeForm
          {...formProps}
          hasWorkType={clientConfig.features?.employee?.workType ?? false}
        />
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
            <SingleEmployeeForm
              {...formProps}
              hasWorkType={clientConfig.features?.employee?.workType ?? false}
            />
          </Tabs.Panel>

          <Tabs.Panel value="bulk" pt="xl">
            <BulkImportForm
              isLoading={isBulkLoading}
              isDownloading={isDownloading}
              file={file}
              importResult={importResult}
              validateFileType={(file) => validateFileType(file, t)}
              onDownloadSample={handleDownloadSample.trigger}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              onImport={handleBulkUpload.trigger}
              onCancel={navigateToList}
            />
          </Tabs.Panel>
        </Tabs>
      )}
    </EmployeeFormLayout>
  );
}
