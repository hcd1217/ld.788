import { Alert, Transition } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

type ErrorAlertProps = {
  readonly error?: string | null | undefined;
  readonly clearError?: () => void;
};
export function ErrorAlert({ error, clearError }: ErrorAlertProps) {
  if (!error) {
    return null;
  }

  return (
    <Transition mounted={Boolean(error)} transition="fade">
      {(styles) => (
        <Alert
          withCloseButton={Boolean(clearError)}
          style={styles}
          icon={<IconAlertTriangle size={16} />}
          color="red"
          variant="light"
          onClose={clearError}
        >
          {error}
        </Alert>
      )}
    </Transition>
  );
}
