import { useCallback, useMemo } from 'react';

import { useNavigate, useParams } from 'react-router';

import { LoadingOverlay, Stack } from '@mantine/core';

import {
  EmployeeDetailAccordion,
  EmployeeDetailAlert,
  EmployeeDetailTabs,
  EmployeePasswordModal,
  EmployeeStatusModal,
} from '@/components/app/employee';
import { AppPageTitle, PermissionDeniedPage } from '@/components/common';
import { AppMobileLayout } from '@/components/common';
import { DetailPageLayout } from '@/components/common/layouts/DetailPageLayout';
import { ResourceNotFound } from '@/components/common/layouts/ResourceNotFound';
import { getEmployeeEditRoute } from '@/config/routeConfig';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useEmployeeModal } from '@/hooks/useEmployeeModal';
import { useOnce } from '@/hooks/useOnce';
import { useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import { userService } from '@/services/user/user';
import { usePermissions } from '@/stores/useAppStore';
import { useEmployeeList, useHrActions, useHrLoading } from '@/stores/useHrStore';
import {
  canEditEmployee,
  canSetPasswordForEmployee,
  canViewEmployee,
} from '@/utils/permission.utils';

export function EmployeeDetailPage() {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();
  const { isMobile } = useDeviceType();
  const { t } = useTranslation();
  const permissions = usePermissions();
  const employees = useEmployeeList();
  const isLoading = useHrLoading();
  const { loadEmployees, deactivateEmployee, activateEmployee } = useHrActions();
  const { canView, canEdit, canSetPassword } = useMemo(() => {
    return {
      canView: canViewEmployee(permissions),
      canEdit: canEditEmployee(permissions),
      canSetPassword: canSetPasswordForEmployee(permissions),
    };
  }, [permissions]);

  const { targetEmployee, deactivateModal, activateModal, passwordModal } = useEmployeeModal();

  // Memoize employee lookup for better performance
  const employee = useMemo(
    () => employees.find((emp) => emp.id === employeeId),
    [employees, employeeId],
  );

  const handleEdit = useCallback(() => {
    if (employee && employee.isActive && canEdit) {
      navigate(getEmployeeEditRoute(employee.id));
    }
  }, [employee, canEdit, navigate]);

  const handleDeactivate = useCallback(() => {
    if (employee && canEdit) {
      deactivateModal.open(employee);
    }
  }, [employee, canEdit, deactivateModal]);

  const handleActivate = useCallback(() => {
    if (employee && canEdit) {
      activateModal.open(employee);
    }
  }, [employee, canEdit, activateModal]);

  const handleSetPassword = useCallback(() => {
    if (employee && canSetPassword) {
      passwordModal.open(employee);
    }
  }, [employee, canSetPassword, passwordModal]);

  const confirmSetPassword = useSWRAction(
    'confirm-set-password',
    async (password: string) => {
      if (!targetEmployee?.userId) {
        return;
      }
      if (!canSetPassword) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      await userService.setPasswordForUser(targetEmployee.userId, password);
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('employee.passwordSetSuccessfully'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.errors.setPasswordFailed'),
      },
      onSuccess: () => {
        passwordModal.close();
      },
    },
  );

  const confirmDeactivateEmployee = useSWRAction(
    'deactivate-employee',
    async () => {
      if (!targetEmployee) {
        throw new Error(t('common.invalidFormData'));
      }
      if (!canEdit) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }

      await deactivateEmployee(targetEmployee.id);
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('employee.employeeDeactivated'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('employee.deactivateEmployeeFailed'),
      },
      onSuccess: () => {
        deactivateModal.close();
      },
    },
  );

  const confirmActivateEmployee = useSWRAction(
    'activate-employee',
    async () => {
      if (!targetEmployee) {
        throw new Error(t('common.invalidFormData'));
      }
      if (!canEdit) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }

      await activateEmployee(targetEmployee.id);
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('employee.employeeActivated'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('employee.activateEmployeeFailed'),
      },
      onSuccess: () => {
        activateModal.close();
      },
    },
  );

  useOnce(() => {
    void loadEmployees();
  });

  // Modal components
  const modals = (
    <>
      <EmployeeStatusModal
        mode="deactivate"
        opened={deactivateModal.opened}
        employee={targetEmployee}
        onClose={deactivateModal.close}
        onConfirm={confirmDeactivateEmployee.trigger}
      />
      <EmployeeStatusModal
        mode="activate"
        opened={activateModal.opened}
        employee={targetEmployee}
        onClose={activateModal.close}
        onConfirm={confirmActivateEmployee.trigger}
      />
      <EmployeePasswordModal
        opened={passwordModal.opened}
        employee={targetEmployee}
        onClose={passwordModal.close}
        onConfirm={confirmSetPassword.trigger}
      />
    </>
  );

  const title = employee ? employee.fullName : t('employee.employeeDetails');

  if (!canView) {
    return <PermissionDeniedPage />;
  }

  if (isMobile) {
    if (isLoading || !employee) {
      return (
        <AppMobileLayout showLogo isLoading={isLoading} header={<AppPageTitle title={title} />}>
          {isLoading ? (
            <LoadingOverlay visible />
          ) : (
            <ResourceNotFound withGoBack message={t('employee.notFound')} />
          )}
        </AppMobileLayout>
      );
    }

    return (
      <AppMobileLayout
        withGoBack
        noFooter
        isLoading={isLoading}
        header={<AppPageTitle title={title} />}
      >
        <Stack gap="md">
          <EmployeeDetailAlert endDate={employee.endDate} isActive={employee.isActive} />
          <EmployeeDetailAccordion
            employee={employee}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            onEdit={handleEdit}
            onSetPassword={handleSetPassword}
          />
        </Stack>
        {modals}
      </AppMobileLayout>
    );
  }

  return (
    <DetailPageLayout titleAlign="center" title={title} isLoading={isLoading}>
      {employee ? (
        <Stack gap="md">
          <EmployeeDetailAlert endDate={employee.endDate} isActive={employee.isActive} />
          <EmployeeDetailTabs
            employee={employee}
            onEdit={handleEdit}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            onSetPassword={handleSetPassword}
          />
        </Stack>
      ) : (
        <ResourceNotFound message={t('employee.notFound')} />
      )}
      {modals}
    </DetailPageLayout>
  );
}
