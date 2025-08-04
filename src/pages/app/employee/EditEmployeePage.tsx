import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Container, Group, Loader, Center } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { getFormValidators } from '@/utils/validation';
import { AppPageTitle, AppMobileLayout, AppDesktopLayout, GoBack } from '@/components/common';
import { SingleEmployeeForm } from '@/components/app/employee';
import { useHrActions, useUnitList, useHrLoading, useHrError } from '@/stores/useHrStore';
import { employeeService } from '@/services/hr/employee';
import { ROUTERS } from '@/config/routeConfig';
import { useAction } from '@/hooks/useAction';
import { useOnce } from '@/hooks/useOnce';
import { isDevelopment } from '@/utils/env';

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
  endDate?: Date;
  isEndDateEnabled?: boolean;
  displayOrder?: number;
};

export function EditEmployeePage() {
  const { employeeId: id } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const units = useUnitList();
  const isLoading = useHrLoading();
  const error = useHrError();
  const { loadUnits, clearError } = useHrActions();

  const [isLoadingEmployee, setIsLoadingEmployee] = useState(true);
  const [isSingleLoading, setIsSingleLoading] = useState(false);
  const [showSingleAlert, setShowSingleAlert] = useState(false);
  const [singleError, setSingleError] = useState<string | undefined>();

  const form = useForm<SingleEmployeeFormValues>({
    initialValues: {
      firstName: '',
      lastName: '',
      unitId: undefined,
      email: undefined,
      phone: undefined,
      workType: undefined,
      monthlySalary: undefined,
      hourlyRate: undefined,
      startDate: undefined,
      endDate: undefined,
      isEndDateEnabled: false,
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

  // Load units and employee data on mount
  useOnce(() => {
    void loadUnits();
    void loadEmployee();
  });

  const loadEmployee = async () => {
    if (!id) {
      navigate(ROUTERS.EMPLOYEE_MANAGEMENT);
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
        isEndDateEnabled: false, // By default, don't update endDate
        displayOrder: employee.displayOrder,
      });
    } catch (error) {
      if (isDevelopment) {
        console.error(error);
      }
      setSingleError(t('employee.notFound'));
      setShowSingleAlert(true);
    } finally {
      setIsLoadingEmployee(false);
    }
  };

  const handleSingleSubmit = useAction<SingleEmployeeFormValues>({
    options: {
      successTitle: t('common.success'),
      successMessage: t('employee.employeeUpdated'),
      errorTitle: t('common.error'),
      errorMessage: t('employee.updateEmployeeFailed'),
      navigateTo: ROUTERS.EMPLOYEE_MANAGEMENT,
    },
    async actionHandler(values) {
      if (!values || !id) {
        throw new Error(t('employee.updateEmployeeFailed'));
      }

      setIsSingleLoading(true);
      setSingleError(undefined);
      setShowSingleAlert(false);

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
    },
    errorHandler(error) {
      const errorMessage =
        error instanceof Error ? error.message : t('employee.updateEmployeeFailed');

      setSingleError(errorMessage);
      setShowSingleAlert(true);
    },
    cleanupHandler() {
      setIsSingleLoading(false);
    },
  });

  if (isLoadingEmployee) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!isDesktop) {
    return (
      <AppMobileLayout
        withGoBack
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle fz="h4" title={t('employee.editEmployee')} />}
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
          isEditMode
        />
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout isLoading={isLoading} error={error} clearError={clearError}>
      <Group justify="space-between" mb="md">
        <GoBack />
      </Group>
      <AppPageTitle title={t('employee.editEmployee')} />

      <Container fluid w="100%">
        <SingleEmployeeForm
          form={form}
          units={units}
          isLoading={isSingleLoading}
          showAlert={showSingleAlert}
          error={singleError}
          setShowAlert={setShowSingleAlert}
          onSubmit={handleSingleSubmit}
          onCancel={() => navigate(ROUTERS.EMPLOYEE_MANAGEMENT)}
          isEditMode
        />
      </Container>
    </AppDesktopLayout>
  );
}
