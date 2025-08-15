import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconInfoCircle } from '@tabler/icons-react';
import type { ReactNode } from 'react';

// Type-safe notification options that allow flexibility for special cases
interface NotificationOptions {
  readonly id?: string;
  readonly autoClose?: number | false;
  readonly withCloseButton?: boolean;
  readonly onClose?: () => void;
  readonly onOpen?: () => void;
}

/**
 * Shows a standardized success notification with green color and check icon.
 */
export function showSuccessNotification(
  title: string,
  message?: ReactNode,
  options?: NotificationOptions,
) {
  notifications.show({
    title,
    message,
    color: 'green',
    icon: <IconCheck size={16} />,
    autoClose: 3000,
    ...options,
  });
}

/**
 * Shows a standardized error notification with red color and alert icon.
 * Gives users slightly more time (7s) to read error messages.
 */
export function showErrorNotification(
  title: string,
  message?: ReactNode,
  options?: NotificationOptions,
) {
  notifications.show({
    title,
    message,
    color: 'red',
    icon: <IconAlertCircle size={16} />,
    autoClose: 4000,
    ...options,
  });
}

/**
 * Shows a standardized info notification with blue color and info icon.
 */
export function showInfoNotification(
  title: string,
  message?: ReactNode,
  options?: NotificationOptions,
) {
  notifications.show({
    title,
    message,
    color: 'blue',
    icon: <IconInfoCircle size={16} />,
    autoClose: 3000,
    ...options,
  });
}
