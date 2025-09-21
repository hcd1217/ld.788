import { useTranslation } from '@/hooks/useTranslation';
import { useDepartmentOptions } from '@/stores/useAppStore';

import { SelectionDrawer } from './SelectionDrawer';

interface EmployeeDepartmentDrawerProps {
  readonly opened: boolean;
  readonly selectedDepartmentId?: string;
  readonly onClose: () => void;
  readonly onDepartmentSelect: (departmentId?: string) => void;
}

export function EmployeeDepartmentDrawer({
  opened,
  selectedDepartmentId,
  onClose,
  onDepartmentSelect,
}: EmployeeDepartmentDrawerProps) {
  const { t } = useTranslation();
  const departmentOptions = useDepartmentOptions();

  return (
    <SelectionDrawer
      opened={opened}
      title={t('employee.selectDepartment')}
      items={departmentOptions}
      selectedId={selectedDepartmentId}
      onClose={onClose}
      onSelect={onDepartmentSelect}
      allOptionLabel={t('employee.allDepartment')}
    />
  );
}
