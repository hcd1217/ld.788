import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';

type ConfirmActionOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmColor?: string;
  onConfirm: () => void;
};

/**
 * Opens a confirmation modal for critical actions like activate/deactivate
 * @param options Configuration for the confirmation modal
 */
export function confirmAction({
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirmColor,
  onConfirm,
}: ConfirmActionOptions) {
  modals.openConfirmModal({
    title,
    children: <Text size="sm">{message}</Text>,
    labels: {
      confirm: confirmLabel,
      cancel: cancelLabel,
    },
    confirmProps: {
      color: confirmColor,
    },
    onConfirm,
  });
}
