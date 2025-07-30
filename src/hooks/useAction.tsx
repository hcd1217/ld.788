import {notifications} from '@mantine/notifications';
import {IconAlertCircle, IconCheck} from '@tabler/icons-react';
import {useNavigate} from 'react-router';

type UseActionOptions = {
  readonly successTitle?: string;
  readonly successMessage?: string;
  readonly errorTitle: string;
  readonly errorMessage: string;
  readonly navigateTo?: string;
  readonly delay?: number;
};
type UseActionProps<T> = {
  options: UseActionOptions;
  actionHandler: (values?: T) => Promise<void>;
  errorHandler?: (error: unknown) => void;
  cleanupHandler?: () => void;
};

export function useAction<T extends Record<string, unknown>>({
  options,
  actionHandler,
  errorHandler,
  cleanupHandler,
}: UseActionProps<T>) {
  const navigate = useNavigate();

  const handleSubmit = async (values?: T) => {
    try {
      await actionHandler(values);

      if (options.successTitle) {
        notifications.show({
          title: options.successTitle,
          message: options.successMessage,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      }

      // Navigate after successful action
      if (options.navigateTo) {
        const destination = options.navigateTo;
        setTimeout(() => {
          navigate(destination);
        }, options.delay ?? 100);
      }
    } catch (error) {
      errorHandler?.(error);

      if (options.errorTitle) {
        notifications.show({
          title: options.errorTitle,
          message:
            error instanceof Error ? error.message : options.errorMessage,
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });
      }
    } finally {
      cleanupHandler?.();
    }
  };

  return handleSubmit;
}
