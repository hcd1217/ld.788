import { useMemo } from 'react';

import { EMPLOYEE_STATUS } from '@/constants/employee';
import { useTranslation } from '@/hooks/useTranslation';

import { SelectionDrawer, type SelectionItem } from './SelectionDrawer';

interface EmployeeStatusDrawerProps {
  readonly opened: boolean;
  readonly selectedStatus: (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];
  readonly onClose: () => void;
  readonly onStatusSelect: (status: (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS]) => void;
}

export function EmployeeStatusDrawer({
  opened,
  selectedStatus,
  onClose,
  onStatusSelect,
}: EmployeeStatusDrawerProps) {
  const { t } = useTranslation();

  const statusItems = useMemo<
    SelectionItem<(typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS]>[]
  >(
    () => [
      { id: EMPLOYEE_STATUS.ALL, label: t('employee.all') },
      { id: EMPLOYEE_STATUS.ACTIVE, label: t('employee.active') },
      { id: EMPLOYEE_STATUS.INACTIVE, label: t('employee.inactive') },
    ],
    [t],
  );

  const handleSelect = (status?: (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS]) => {
    if (status) {
      onStatusSelect(status);
    }
  };

  return (
    <SelectionDrawer
      opened={opened}
      title={t('employee.status')}
      items={statusItems}
      selectedId={selectedStatus}
      onClose={onClose}
      onSelect={handleSelect}
      showAllOption={false} // All option is already in items
    />
  );
}
