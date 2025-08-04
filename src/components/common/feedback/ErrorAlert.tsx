import { Alert } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

type ErrorAlertProps = {
  readonly error?: string;
  readonly clearError?: () => void;
};
export function ErrorAlert({ error, clearError }: ErrorAlertProps) {
  if (!error) {
    return null;
  }

  return (
    <Alert
      withCloseButton
      icon={<IconAlertTriangle size={16} />}
      color="red"
      variant="light"
      onClose={clearError}
    >
      {error}
    </Alert>
  );
}
