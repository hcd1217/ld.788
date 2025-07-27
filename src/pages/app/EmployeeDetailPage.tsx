import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import {useDisclosure} from '@mantine/hooks';
import {notifications} from '@mantine/notifications';
import useTranslation from '@/hooks/useTranslation';
import useIsDesktop from '@/hooks/useIsDesktop';
import {useEmployeeList, useHrActions, useHrLoading} from '@/stores/useHrStore';
import {ResourceNotFound, DetailPageLayout} from '@/components/common';
import {
  EmployeeDeactivateModal,
  EmployeeActivateModal,
  EmployeeDetailTabs,
  EmployeeDetailAccordion,
} from '@/components/app/employee';
import type {Employee} from '@/lib/api/schemas/hr.schemas';

export function EmployeeDetailPage() {
  const {employeeId} = useParams<{employeeId: string}>();
  const navigate = useNavigate();
  const {t} = useTranslation();
  const isDesktop = useIsDesktop();
  const employees = useEmployeeList();
  const isLoading = useHrLoading();
  const {
    loadEmployees,
    getDepartmentById,
    deactivateEmployee,
    activateEmployee,
  } = useHrActions();

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
      navigate(`/employees/${employee.id}`);
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

  const confirmDeactivateEmployee = async () => {
    if (!employeeToDeactivate) return;

    try {
      await deactivateEmployee(employeeToDeactivate.id);
      closeDeactivateModal();
      notifications.show({
        title: t('common.success'),
        message: t('employee.employeeDeactivated'),
        color: 'green',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('employee.deactivateEmployeeFailed');
      notifications.show({
        title: t('common.error'),
        message: errorMessage,
        color: 'red',
      });
    }
  };

  const confirmActivateEmployee = async () => {
    if (!employeeToActivate) return;

    try {
      await activateEmployee(employeeToActivate.id);
      closeActivateModal();
      notifications.show({
        title: t('common.success'),
        message: t('employee.employeeActivated'),
        color: 'green',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('employee.activateEmployeeFailed');
      notifications.show({
        title: t('common.error'),
        message: errorMessage,
        color: 'red',
      });
    }
  };

  useEffect(() => {
    void loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!employee && !isLoading) {
    return <ResourceNotFound message={t('employee.notFound')} />;
  }

  return (
    <DetailPageLayout
      titleAlign="center"
      title={t('employee.employeeDetails')}
      isLoading={isLoading}
    >
      {employee ? (
        <>
          {isDesktop ? (
            <EmployeeDetailTabs
              employee={employee}
              getDepartmentById={getDepartmentById}
              onEdit={handleEdit}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
            />
          ) : (
            <EmployeeDetailAccordion
              employee={employee}
              getDepartmentById={getDepartmentById}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
            />
          )}

          {/* Deactivate Confirmation Modal */}
          <EmployeeDeactivateModal
            opened={deactivateModalOpened}
            employee={employeeToDeactivate}
            onClose={closeDeactivateModal}
            onConfirm={confirmDeactivateEmployee}
          />

          {/* Activate Confirmation Modal */}
          <EmployeeActivateModal
            opened={activateModalOpened}
            employee={employeeToActivate}
            onClose={closeActivateModal}
            onConfirm={confirmActivateEmployee}
          />
        </>
      ) : null}
    </DetailPageLayout>
  );
}
