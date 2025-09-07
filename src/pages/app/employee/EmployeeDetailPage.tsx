import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { LoadingOverlay, Stack } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useEmployeeList, useHrActions, useHrLoading } from '@/stores/useHrStore';
import { ResourceNotFound } from '@/components/common/layouts/ResourceNotFound';
import { DetailPageLayout } from '@/components/common/layouts/DetailPageLayout';
import { AppPageTitle, PermissionDeniedPage } from '@/components/common';
import { AppMobileLayout } from '@/components/common';
import {
  EmployeeStatusModal,
  EmployeePasswordModal,
  EmployeeDetailTabs,
  EmployeeDetailAccordion,
  EmployeeDetailAlert,
} from '@/components/app/employee';
import { getEmployeeEditRoute } from '@/config/routeConfig';
import { useOnce } from '@/hooks/useOnce';
import { useAction } from '@/hooks/useAction';
import { useEmployeeModal } from '@/hooks/useEmployeeModal';
import { usePermissions } from '@/stores/useAppStore';
import { userService } from '@/services/user/user';
import { showSuccessNotification, showErrorNotification } from '@/utils/notifications';

export function EmployeeDetailPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const permissions = usePermissions();
  const employees = useEmployeeList();
  const isLoading = useHrLoading();
  const { loadEmployees, deactivateEmployee, activateEmployee } = useHrActions();
  const { targetEmployee, deactivateModal, activateModal, passwordModal } = useEmployeeModal();

  // Memoize employee lookup for better performance
  const employee = useMemo(
    () => employees.find((emp) => emp.id === employeeId),
    [employees, employeeId],
  );

  const handleEdit = () => {
    if (employee && employee.isActive && permissions.employee.canEdit) {
      navigate(getEmployeeEditRoute(employee.id));
    }
  };

  const handleDeactivate = () => {
    if (employee && permissions.employee.canEdit) {
      deactivateModal.open(employee);
    }
  };

  const handleActivate = () => {
    if (employee && permissions.employee.canEdit) {
      activateModal.open(employee);
    }
  };

  const handleSetPassword = () => {
    if (employee && permissions.employee.actions?.canSetPassword) {
      passwordModal.open(employee);
    }
  };

  const confirmSetPassword = async (password: string) => {
    if (!targetEmployee) {
      return;
    }

    try {
      await userService.setPasswordForUser(targetEmployee.id, password);
      showSuccessNotification(t('common.success'), t('employee.passwordSetSuccessfully'));
      passwordModal.close();
    } catch (error) {
      showErrorNotification(
        t('common.error'),
        error instanceof Error ? error.message : t('employee.setPasswordFailed'),
      );
      console.error('Failed to set password:', error);
    }
  };

  const confirmDeactivateEmployee = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('employee.employeeDeactivated'),
      errorTitle: t('common.error'),
      errorMessage: t('employee.deactivateEmployeeFailed'),
    },
    async actionHandler() {
      if (!targetEmployee) {
        throw new Error(t('employee.deactivateEmployeeFailed'));
      }

      await deactivateEmployee(targetEmployee.id);
      deactivateModal.close();
    },
  });

  const confirmActivateEmployee = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('employee.employeeActivated'),
      errorTitle: t('common.error'),
      errorMessage: t('employee.activateEmployeeFailed'),
    },
    async actionHandler() {
      if (!targetEmployee) {
        throw new Error(t('employee.activateEmployeeFailed'));
      }

      await activateEmployee(targetEmployee.id);
      activateModal.close();
    },
  });

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
        onConfirm={confirmDeactivateEmployee}
      />
      <EmployeeStatusModal
        mode="activate"
        opened={activateModal.opened}
        employee={targetEmployee}
        onClose={activateModal.close}
        onConfirm={confirmActivateEmployee}
      />
      <EmployeePasswordModal
        opened={passwordModal.opened}
        employee={targetEmployee}
        onClose={passwordModal.close}
        onConfirm={confirmSetPassword}
      />
    </>
  );

  const title = employee ? employee.fullName : t('employee.employeeDetails');

  if (!permissions.employee.canView) {
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
            canEdit={permissions.employee.canEdit}
            canSetPassword={permissions.employee.actions?.canSetPassword}
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
            canEdit={permissions.employee.canEdit}
            canSetPassword={permissions.employee.actions?.canSetPassword}
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
