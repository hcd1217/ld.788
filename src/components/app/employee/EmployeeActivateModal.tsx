import {Stack, Text, Alert, Flex, Button} from '@mantine/core';
import {IconAlertTriangle} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import type {Employee} from '@/services/hr/employee';
import {renderFullName} from '@/utils/string';
import {ModalOrDrawer} from '@/components/common';

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
    <ModalOrDrawer drawerSize="350px" opened={opened} onClose={onClose}>
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
    </ModalOrDrawer>
  );
}
