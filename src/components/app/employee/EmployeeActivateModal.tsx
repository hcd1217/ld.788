import {Modal, Stack, Title, Text, Alert, Flex, Button} from '@mantine/core';
import {IconAlertTriangle} from '@tabler/icons-react';
import useTranslation from '@/hooks/useTranslation';
import type {Employee} from '@/lib/api/schemas/hr.schemas';
import {renderFullName} from '@/utils/string';

type EmployeeActivateModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly employee: Employee | undefined;
  readonly onConfirm: () => void;
};

export function EmployeeActivateModal({
  opened,
  onClose,
  employee,
  onConfirm,
}: EmployeeActivateModalProps) {
  const {t} = useTranslation();

  return (
    <Modal
      centered
      opened={opened}
      title={<Title order={3}>{t('employee.confirmActivateTitle')}</Title>}
      onClose={onClose}
    >
      <Stack gap="md">
        <Text>
          {t('employee.confirmActivateMessage', {
            name: employee ? renderFullName(employee) : '',
          })}
        </Text>

        <Alert
          icon={<IconAlertTriangle size={16} />}
          color="var(--app-active-color)"
          variant="light"
        >
          {t('employee.activateInfo')}
        </Alert>

        <Flex gap="sm" justify="flex-end">
          <Button variant="light" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button color="var(--app-active-color)" onClick={onConfirm}>
            {t('employee.activateEmployee')}
          </Button>
        </Flex>
      </Stack>
    </Modal>
  );
}
