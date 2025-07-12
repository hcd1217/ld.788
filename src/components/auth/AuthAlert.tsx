import {Alert, Transition} from '@mantine/core';
import {IconAlertCircle} from '@tabler/icons-react';

type AuthAlertProps = {
  readonly show: boolean;
  readonly message: string;
  readonly onClose: () => void;
};

export function AuthAlert({show, message, onClose}: AuthAlertProps) {
  return (
    <Transition
      mounted={show}
      transition="fade"
      duration={300}
      timingFunction="ease"
    >
      {(styles) => (
        <Alert
          withCloseButton
          style={styles}
          icon={<IconAlertCircle size={16} />}
          color="red"
          variant="light"
          onClose={onClose}
        >
          {message}
        </Alert>
      )}
    </Transition>
  );
}
