import { useState } from 'react';

import {
  Alert,
  Button,
  Flex,
  LoadingOverlay,
  Modal,
  PasswordInput,
  Stack,
  Text,
} from '@mantine/core';
import { IconAlertTriangle, IconLock } from '@tabler/icons-react';

import { useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import { authService } from '@/services/auth/auth';
import { useMe } from '@/stores/useAppStore';
import { validateConfirmPassword, validatePassword } from '@/utils/validation';

type ChangePasswordModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
};

export function ChangePasswordModal({ opened, onClose }: ChangePasswordModalProps) {
  const { t } = useTranslation();
  const me = useMe();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const changePasswordAction = useSWRAction(
    'change-password',
    async () => {
      if (!me?.id) {
        throw new Error(t('common.invalidFormData'));
      }

      // Client-side validation
      const currentPasswordError = validatePassword(currentPassword, t);
      if (currentPasswordError) {
        throw new Error(currentPasswordError);
      }

      const newPasswordError = validatePassword(newPassword, t);
      if (newPasswordError) {
        throw new Error(newPasswordError);
      }

      const confirmPasswordError = validateConfirmPassword(confirmPassword, newPassword, t);
      if (confirmPasswordError) {
        throw new Error(confirmPasswordError);
      }

      if (currentPassword === newPassword) {
        throw new Error(t('common.invalidFormData')); // Using generic error for same password
      }

      await authService.changePassword(currentPassword, newPassword);
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('employee.passwordSetSuccessfully'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.errors.setPasswordFailed'),
      },
      onSuccess: () => {
        setTimeout(() => {
          authService.logout();
          window.location.reload();
          onClose();
        }, 3000);
      },
      onError: (error) => {
        // Handle specific error cases
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(errorMessage);
      },
    },
  );

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(undefined);
    onClose();
  };

  const handleSubmit = async () => {
    setError(undefined);
    await changePasswordAction.trigger();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('employee.setPassword')}
      centered
      size="md"
      trapFocus
      returnFocus
    >
      <LoadingOverlay visible={changePasswordAction.isMutating} />
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('profile.changePasswordDescription')}
        </Text>

        <PasswordInput
          label={t('auth.password')}
          placeholder={t('auth.password')}
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.currentTarget.value);
            setError(undefined);
          }}
          leftSection={<IconLock size={16} />}
          required
          disabled={changePasswordAction.isMutating}
        />

        <PasswordInput
          label={t('employee.newPassword')}
          placeholder={t('employee.enterNewPassword')}
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.currentTarget.value);
            setError(undefined);
          }}
          leftSection={<IconLock size={16} />}
          required
          disabled={changePasswordAction.isMutating}
          description={t('validation.passwordWeak')}
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
          disabled={changePasswordAction.isMutating}
        />

        {error && (
          <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        <Flex gap="sm" justify="flex-end">
          <Button variant="light" onClick={handleClose} disabled={changePasswordAction.isMutating}>
            {t('common.cancel')}
          </Button>
          <Button
            color="blue"
            onClick={handleSubmit}
            loading={changePasswordAction.isMutating}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            {t('employee.setPassword')}
          </Button>
        </Flex>
      </Stack>
    </Modal>
  );
}
