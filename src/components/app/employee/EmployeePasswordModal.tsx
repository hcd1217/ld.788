import { useState } from 'react';

import { Alert, Button, Flex, PasswordInput, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconLock } from '@tabler/icons-react';

import { ModalOrDrawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { Employee } from '@/services/hr/employee';
import { renderFullName } from '@/utils/string';

type EmployeePasswordModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly employee: Employee | undefined;
  readonly onConfirm: (password: string) => void;
};

export function EmployeePasswordModal({
  opened,
  onClose,
  employee,
  onConfirm,
}: EmployeePasswordModalProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setError(undefined);
    onClose();
  };

  const handleConfirm = () => {
    // Validation
    if (!password) {
      setError(t('employee.passwordRequired'));
      return;
    }

    if (password.length < 8) {
      setError(t('employee.passwordMinLength'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('employee.passwordMismatch'));
      return;
    }

    onConfirm(password);
    handleClose();
  };

  return (
    <ModalOrDrawer
      title={t('employee.setPasswordTitle')}
      drawerSize="350px"
      opened={opened}
      onClose={handleClose}
    >
      <Stack gap="md">
        <Text>
          {t('employee.setPasswordMessage', {
            name: employee ? renderFullName(employee) : '',
          })}
          {employee?.loginIdentifier ? ` (${employee.loginIdentifier})` : ''}
        </Text>

        <PasswordInput
          label={t('employee.newPassword')}
          placeholder={t('employee.enterNewPassword')}
          value={password}
          onChange={(e) => {
            setPassword(e.currentTarget.value);
            setError(undefined);
          }}
          leftSection={<IconLock size={16} />}
          required
        />

        <PasswordInput
          label={t('employee.confirmPassword')}
          placeholder={t('employee.enterConfirmPassword')}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.currentTarget.value);
            setError(undefined);
          }}
          leftSection={<IconLock size={16} />}
          required
        />

        {error && (
          <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        <Alert icon={<IconAlertTriangle size={16} />} color="yellow" variant="light">
          {t('employee.setPasswordWarning')}
        </Alert>

        <Flex gap="sm" justify="flex-end">
          <Button variant="light" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button color="blue" onClick={handleConfirm}>
            {t('employee.setPassword')}
          </Button>
        </Flex>
      </Stack>
    </ModalOrDrawer>
  );
}
