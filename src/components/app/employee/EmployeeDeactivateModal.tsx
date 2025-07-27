import {Modal, Stack, Text, Alert, Flex, Button} from '@mantine/core';
import {IconAlertTriangle} from '@tabler/icons-react';
import useTranslation from '@/hooks/useTranslation';
import type {Employee} from '@/lib/api/schemas/hr.schemas';
import {renderFullName} from '@/utils/string';

type EmployeeDeactivateModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly employee: Employee | undefined;
  readonly onConfirm: () => void;
};

export function EmployeeDeactivateModal({
  opened,
  onClose,
  employee,
  onConfirm,
}: EmployeeDeactivateModalProps) {
  const {t} = useTranslation();

  return (
    <Modal
      centered
      opened={opened}
      title={t('employee.confirmDeactivateTitle')}
      onClose={onClose}
    >
      <Stack gap="md">
        <Text>
          {t('employee.confirmDeactivateMessage', {
            name: employee ? renderFullName(employee) : '',
          })}
        </Text>

        <Alert
          icon={<IconAlertTriangle size={16} />}
          color="var(--app-danger-color)"
          variant="light"
        >
          {t('employee.deactivateWarning')}
        </Alert>

        <Flex gap="sm" justify="flex-end">
          <Button variant="light" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button color="var(--app-danger-color)" onClick={onConfirm}>
            {t('employee.deactivateEmployee')}
          </Button>
        </Flex>
      </Stack>
    </Modal>
  );
}
