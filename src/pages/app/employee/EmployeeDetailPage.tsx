import {useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import {useDisclosure} from '@mantine/hooks';
import {LoadingOverlay} from '@mantine/core';
import {useTranslation} from '@/hooks/useTranslation';
import useIsDesktop from '@/hooks/useIsDesktop';
import {useEmployeeList, useHrActions, useHrLoading} from '@/stores/useHrStore';
import {
  ResourceNotFound,
  DetailPageLayout,
  AppPageTitle,
  AppMobileLayout,
} from '@/components/common';
import {
  EmployeeDeactivateModal,
  EmployeeActivateModal,
  EmployeeDetailTabs,
  EmployeeDetailAccordion,
} from '@/components/app/employee';
import type {Employee} from '@/services/hr/employee';
import {getEmployeeDetailRoute} from '@/config/routeConfig';
import {useOnce} from '@/hooks/useOnce';
import {useAction} from '@/hooks/useAction';

export function EmployeeDetailPage() {
  const {employeeId} = useParams<{employeeId: string}>();
  const navigate = useNavigate();
  const {t} = useTranslation();
  const isDesktop = useIsDesktop();
  const employees = useEmployeeList();
  const isLoading = useHrLoading();
  const {loadEmployees, deactivateEmployee, activateEmployee} = useHrActions();

  const employee = employees.find((emp) => emp.id === employeeId);

  const [employeeToDeactivate, setEmployeeToDeactivate] = useState<
    Employee | undefined
  >(undefined);
  const [employeeToActivate, setEmployeeToActivate] = useState<
    Employee | undefined
  >(undefined);

  const [
    deactivateModalOpened,
    {open: openDeactivateModal, close: closeDeactivateModal},
  ] = useDisclosure(false);
  const [
    activateModalOpened,
    {open: openActivateModal, close: closeActivateModal},
  ] = useDisclosure(false);

  const handleEdit = () => {
    if (employee) {
      navigate(getEmployeeDetailRoute(employee.id));
    }
  };

  const handleDeactivate = () => {
    if (employee) {
      setEmployeeToDeactivate(employee);
      openDeactivateModal();
    }
  };

  const handleActivate = () => {
    if (employee) {
      setEmployeeToActivate(employee);
      openActivateModal();
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
      if (!employeeToDeactivate) {
        throw new Error(t('employee.deactivateEmployeeFailed'));
      }

      await deactivateEmployee(employeeToDeactivate.id);
      closeDeactivateModal();
    },
    cleanupHandler() {
      setEmployeeToDeactivate(undefined);
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
      if (!employeeToActivate) {
        throw new Error(t('employee.activateEmployeeFailed'));
      }

      await activateEmployee(employeeToActivate.id);
      closeActivateModal();
    },
    cleanupHandler() {
      setEmployeeToActivate(undefined);
    },
  });

  useOnce(() => {
    void loadEmployees();
  });

  const deactivateComponent = (
    <EmployeeDeactivateModal
      opened={deactivateModalOpened}
      employee={employeeToDeactivate}
      onClose={closeDeactivateModal}
      onConfirm={confirmDeactivateEmployee}
    />
  );
  const activateComponent = (
    <EmployeeActivateModal
      opened={activateModalOpened}
      employee={employeeToActivate}
      onClose={closeActivateModal}
      onConfirm={confirmActivateEmployee}
    />
  );
  const title = employee
    ? (employee.fullNameWithPosition ?? employee.fullName)
    : t('employee.employeeDetails');

  if (!isDesktop) {
    if (isLoading || !employee) {
      return (
        <AppMobileLayout
          withLogo
          isLoading={isLoading}
          header={<AppPageTitle title={title} />}
        >
          {isLoading ? (
            <LoadingOverlay visible />
          ) : (
            <ResourceNotFound withGoBack message={t('employee.notFound')} />
          )}
          ;
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
        <EmployeeDetailAccordion
          employee={employee}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
        />
        {deactivateComponent}
        {activateComponent}
      </AppMobileLayout>
    );
  }

  return (
    <DetailPageLayout titleAlign="center" title={title} isLoading={isLoading}>
      {employee ? (
        <EmployeeDetailTabs
          employee={employee}
          onEdit={handleEdit}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
        />
      ) : (
        <ResourceNotFound message={t('employee.notFound')} />
      )}
      {deactivateComponent}
      {activateComponent}
    </DetailPageLayout>
  );
}
