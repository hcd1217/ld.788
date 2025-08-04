import { SimpleGrid, Button } from '@mantine/core';
import { Drawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { EMPLOYEE_STATUS } from '@/constants/employee';

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

  const handleStatusSelect = (status: (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS]) => {
    onStatusSelect(status);
    onClose();
  };

  // Fixed height for 3 status options
  const calculateDrawerHeight = () => {
    const itemCount = 3; // All, Active, Inactive
    const rows = Math.ceil(itemCount / 2);
    const buttonHeight = 36;
    const gapHeight = 8;
    const padding = 32;
    const headerHeight = 60;
    const calculatedHeight = headerHeight + padding + rows * buttonHeight + (rows - 1) * gapHeight;
    return `${calculatedHeight}px`;
  };

  return (
    <Drawer
      opened={opened}
      size={calculateDrawerHeight()}
      title={t('employee.status')}
      onClose={onClose}
    >
      <SimpleGrid cols={2} spacing="xs">
        <Button
          variant={selectedStatus === EMPLOYEE_STATUS.ALL ? 'filled' : 'light'}
          onClick={() => handleStatusSelect(EMPLOYEE_STATUS.ALL)}
        >
          {t('employee.all')}
        </Button>
        <Button
          variant={selectedStatus === EMPLOYEE_STATUS.ACTIVE ? 'filled' : 'light'}
          onClick={() => handleStatusSelect(EMPLOYEE_STATUS.ACTIVE)}
        >
          {t('employee.active')}
        </Button>
        <Button
          variant={selectedStatus === EMPLOYEE_STATUS.INACTIVE ? 'filled' : 'light'}
          onClick={() => handleStatusSelect(EMPLOYEE_STATUS.INACTIVE)}
        >
          {t('employee.inactive')}
        </Button>
      </SimpleGrid>
    </Drawer>
  );
}
