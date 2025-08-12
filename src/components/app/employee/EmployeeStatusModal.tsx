import { Stack, Text, Alert, Flex, Button } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import type { Employee } from '@/services/hr/employee';
import { renderFullName } from '@/utils/string';
import { ModalOrDrawer } from '@/components/common';
import { getIcon, IconIdentifiers } from '@/utils/iconRegistry';

const IconAlertTriangle = getIcon(IconIdentifiers.ALERT_TRIANGLE);

type EmployeeStatusModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly employee: Employee | undefined;
  readonly onConfirm: () => void;
  readonly mode: 'activate' | 'deactivate';
};

export function EmployeeStatusModal({
  opened,
  onClose,
  employee,
  onConfirm,
  mode,
}: EmployeeStatusModalProps) {
  const { t } = useTranslation();
  const isActivate = mode === 'activate';

  const config = {
    title: isActivate ? t('employee.confirmActivateTitle') : t('employee.confirmDeactivateTitle'),
    message: isActivate
      ? t('employee.confirmActivateMessage', { name: employee ? renderFullName(employee) : '' })
      : t('employee.confirmDeactivateMessage', { name: employee ? renderFullName(employee) : '' }),
    alertText: isActivate ? t('employee.activateInfo') : t('employee.deactivateWarning'),
    buttonText: isActivate ? t('employee.activateEmployee') : t('employee.deactivateEmployee'),
    color: isActivate ? 'var(--app-active-color)' : 'var(--app-danger-color)',
  };

  return (
    <ModalOrDrawer title={config.title} drawerSize="350px" opened={opened} onClose={onClose}>
      <Stack gap="md">
        <Text>{config.message}</Text>

        <Alert icon={<IconAlertTriangle size={16} />} color={config.color} variant="light">
          {config.alertText}
        </Alert>

        <Flex gap="sm" justify="flex-end">
          <Button variant="light" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button color={config.color} onClick={onConfirm}>
            {config.buttonText}
          </Button>
        </Flex>
      </Stack>
    </ModalOrDrawer>
  );
}
