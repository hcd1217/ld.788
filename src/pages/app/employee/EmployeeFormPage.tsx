import { useMemo, useRef, useState } from 'react';

import { useNavigate, useParams } from 'react-router';

import { Center, Loader } from '@mantine/core';
import { IconFileSpreadsheet, IconUserPlus } from '@tabler/icons-react';

import { BulkImportForm, EmployeeFormLayout, SingleEmployeeForm } from '@/components/app/employee';
import { PermissionDeniedPage, Tabs } from '@/components/common';
import { ROUTERS } from '@/config/routeConfig';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useEmployeeForm } from '@/hooks/useEmployeeForm';
import { useOnce } from '@/hooks/useOnce';
import { useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import { employeeService } from '@/services/hr/employee';
import { useClientConfig, useDepartmentOptions, usePermissions } from '@/stores/useAppStore';
import { useHrActions, useHrError, useHrLoading } from '@/stores/useHrStore';
import { type SingleEmployeeFormValues, validateFileType } from '@/utils/employee.utils';
import { generateEmployeeExcelTemplate, parseEmployeeExcelFile } from '@/utils/excelParser';
import { logError } from '@/utils/logger';
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';
import { canCreateEmployee, canEditEmployee, canViewEmployee } from '@/utils/permission.utils';

type EmployeeFormPageProps = {
  readonly mode: 'create' | 'edit';
};

export function EmployeeFormPage({ mode }: EmployeeFormPageProps) {
  const { employeeId: id } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const { isMobile } = useDeviceType();
  const permissions = usePermissions();
  const isLoading = useHrLoading();
  const error = useHrError();
  const { clearError, addEmployee, addBulkEmployees } = useHrActions();
  const clientConfig = useClientConfig();
  const { canEdit, canCreate, canView } = useMemo(() => {
    return {
      canEdit: canEditEmployee(permissions),
      canCreate: canCreateEmployee(permissions),
      canView: canViewEmployee(permissions),
    };
  }, [permissions]);

  // Mode-specific state
  const isEditMode = mode === 'edit';
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(isEditMode);
  const [activeTab, setActiveTab] = useState<string | null>('single');

  // Single employee form state
  const [isSingleLoading, setIsSingleLoading] = useState(false);
  const [showSingleAlert, setShowSingleAlert] = useState(false);
  const [singleError, setSingleError] = useState<string | undefined>();

  // Bulk import state
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileRef = useRef<File | undefined>(undefined);
  const [file, setFile] = useState<File | undefined>();
  const [importResult, setImportResult] = useState<
    { summary: { total: number; success: number; failed: number }; errors?: string[] } | undefined
  >();

  const departmentOptions = useDepartmentOptions();

  // Use custom hook for form
  const form = useEmployeeForm({ isEditMode });

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
        departmentId: employee.departmentId,
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

  // Load departments and employee data on mount
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
      if (isEditMode && !canEdit) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (isEditMode && !id) {
        throw new Error(t('common.invalidFormData'));
      }
      if (!isEditMode && !canCreate) {
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
          departmentId: values.departmentId,
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
          departmentId: values.departmentId,
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

  const pageTitle = isEditMode ? t('employee.editEmployee') : t('employee.addEmployee');
  const navigateToList = () => navigate(ROUTERS.EMPLOYEE_MANAGEMENT);

  // Bulk import handlers
  const handleDownloadSample = async () => {
    setIsDownloading(true);
    try {
      generateEmployeeExcelTemplate(
        currentLanguage,
        departmentOptions.map((u) => u.label),
      );
      showSuccessNotification(t('common.success'), t('employee.sampleFileDownloaded'));
    } catch (error) {
      logError('Failed to download sample', error, {
        module: 'EmployeeFormPage',
        action: 'handleDownloadSample',
      });
      showErrorNotification(t('common.errors.notificationTitle'), t('common.download'));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    fileRef.current = selectedFile;
    setFile(selectedFile);
    setImportResult(undefined);
  };

  const handleFileRemove = () => {
    fileRef.current = undefined;
    setFile(undefined);
    setImportResult(undefined);
  };

  const handleBulkUpload = async () => {
    if (!fileRef.current) {
      return;
    }

    setIsBulkLoading(true);
    setImportResult(undefined);

    try {
      const employees = await parseEmployeeExcelFile(fileRef.current);

      if (employees.length === 0) {
        showErrorNotification(
          t('common.errors.notificationTitle'),
          t('employee.noValidEmployeesFound'),
        );
        return;
      }

      // Map employees to the format expected by addBulkEmployees
      const employeesData = employees.map((emp) => {
        const department = departmentOptions.find(
          (u) => u.label.toLowerCase() === emp.departmentName?.toLowerCase(),
        );
        return {
          firstName: emp.firstName,
          lastName: emp.lastName,
          departmentId: department?.id,
          email: emp.email,
          phone: emp.phone,
        };
      });

      // Use bulk import function
      await addBulkEmployees(employeesData);

      setImportResult({
        summary: {
          total: employees.length,
          success: employees.length,
          failed: 0,
        },
        errors: undefined,
      });

      showSuccessNotification(t('common.success'), t('employee.bulkImportEmployeesSuccess'));

      setTimeout(() => {
        navigate(ROUTERS.EMPLOYEE_MANAGEMENT);
      }, 2000);
    } catch (error) {
      logError('Failed to parse/upload file', error, {
        module: 'EmployeeFormPage',
        action: 'handleBulkUpload',
      });
      showErrorNotification(t('common.errors.notificationTitle'), t('auth.invalidFileType'));
    } finally {
      setIsBulkLoading(false);
    }
  };

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
    isLoading: isSingleLoading,
    showAlert: showSingleAlert,
    error: singleError,
    setShowAlert: setShowSingleAlert,
    onSubmit: handleSingleSubmit.trigger,
    onCancel: navigateToList,
    isEditMode,
  };

  if (!canView) {
    return <PermissionDeniedPage />;
  }
  if (isEditMode && !canEdit) {
    return <PermissionDeniedPage />;
  }
  if (!isEditMode && !canCreate) {
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
      {isEditMode ? (
        <SingleEmployeeForm
          {...formProps}
          hasWorkType={clientConfig.features?.employee?.workType ?? false}
        />
      ) : (
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="single" leftSection={<IconUserPlus size={16} />}>
              {t('employee.addSingleEmployee')}
            </Tabs.Tab>
            <Tabs.Tab value="bulk" leftSection={<IconFileSpreadsheet size={16} />}>
              {t('employee.bulkImportEmployees')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="single" pt="md">
            <SingleEmployeeForm
              {...formProps}
              hasWorkType={clientConfig.features?.employee?.workType ?? false}
            />
          </Tabs.Panel>

          <Tabs.Panel value="bulk" pt="md">
            <BulkImportForm
              isLoading={isBulkLoading}
              isDownloading={isDownloading}
              file={file}
              importResult={importResult}
              onDownloadSample={handleDownloadSample}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              onImport={handleBulkUpload}
              onCancel={navigateToList}
              validateFileType={(file) => validateFileType(file, t)}
            />
          </Tabs.Panel>
        </Tabs>
      )}
    </EmployeeFormLayout>
  );
}
