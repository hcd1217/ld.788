import { useNavigate } from 'react-router';
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';

type UseActionOptions = {
  readonly successTitle?: string;
  readonly successMessage?: string;
  readonly errorTitle?: string;
  readonly errorMessage?: string;
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
        showSuccessNotification(options.successTitle, options.successMessage);
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
        showErrorNotification(
          options.errorTitle,
          error instanceof Error ? error.message : options.errorMessage,
        );
      }
    } finally {
      cleanupHandler?.();
    }
  };

  return handleSubmit;
}
