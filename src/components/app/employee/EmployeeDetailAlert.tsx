import { Alert } from '@mantine/core';
import { IconAlertTriangle, IconClock } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getEndDateStatus } from '@/utils/time';

type EmployeeDetailAlertProps = {
  readonly endDate: Date | undefined;
  readonly isActive: boolean;
};

export function EmployeeDetailAlert({ endDate, isActive }: EmployeeDetailAlertProps) {
  const { t } = useTranslation();

  const status = getEndDateStatus(endDate, isActive);

  if (status === 'none') {
    return null;
  }

  const getAlertProps = () => {
    switch (status) {
      case 'ending_soon':
        return {
          color: 'yellow',
          icon: <IconClock size={16} />,
          title: t('employee.endingSoon'),
          message: t('employee.endingSoonMessage'),
        };
      case 'ended_but_active':
        return {
          color: 'red',
          icon: <IconAlertTriangle size={16} />,
          title: t('employee.endedButActive'),
          message: t('employee.endedButActiveMessage'),
        };
      default:
        return null;
    }
  };

  const alertProps = getAlertProps();

  if (!alertProps) {
    return null;
  }

  return (
    <Alert
      variant="light"
      color={alertProps.color}
      icon={alertProps.icon}
      title={alertProps.title}
      radius="md"
      style={{ marginBottom: 'var(--mantine-spacing-md)' }}
    >
      {alertProps.message}
    </Alert>
  );
}
