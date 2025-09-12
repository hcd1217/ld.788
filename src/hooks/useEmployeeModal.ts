import { useCallback, useState } from 'react';

import { useDisclosure } from '@mantine/hooks';

import type { Employee } from '@/services/hr/employee';

export type ModalType = 'activate' | 'deactivate' | 'password';

export function useEmployeeModal() {
  const [targetEmployee, setTargetEmployee] = useState<Employee | undefined>(undefined);
  const [deactivateOpened, deactivateHandlers] = useDisclosure(false);
  const [activateOpened, activateHandlers] = useDisclosure(false);
  const [passwordOpened, passwordHandlers] = useDisclosure(false);

  const openDeactivateModal = useCallback(
    (employee: Employee) => {
      setTargetEmployee(employee);
      deactivateHandlers.open();
    },
    [deactivateHandlers],
  );

  const openActivateModal = useCallback(
    (employee: Employee) => {
      setTargetEmployee(employee);
      activateHandlers.open();
    },
    [activateHandlers],
  );

  const openPasswordModal = useCallback(
    (employee: Employee) => {
      setTargetEmployee(employee);
      passwordHandlers.open();
    },
    [passwordHandlers],
  );

  const closeDeactivateModal = useCallback(() => {
    deactivateHandlers.close();
    setTargetEmployee(undefined);
  }, [deactivateHandlers]);

  const closeActivateModal = useCallback(() => {
    activateHandlers.close();
    setTargetEmployee(undefined);
  }, [activateHandlers]);

  const closePasswordModal = useCallback(() => {
    passwordHandlers.close();
    setTargetEmployee(undefined);
  }, [passwordHandlers]);

  return {
    targetEmployee,
    deactivateModal: {
      opened: deactivateOpened,
      open: openDeactivateModal,
      close: closeDeactivateModal,
    },
    activateModal: {
      opened: activateOpened,
      open: openActivateModal,
      close: closeActivateModal,
    },
    passwordModal: {
      opened: passwordOpened,
      open: openPasswordModal,
      close: closePasswordModal,
    },
  };
}
