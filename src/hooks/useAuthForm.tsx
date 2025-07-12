import {useState} from 'react';
import {notifications} from '@mantine/notifications';
import {IconAlertCircle, IconCheck} from '@tabler/icons-react';
import type {UseFormReturnType} from '@mantine/form';

type UseAuthFormOptions = {
  readonly onSuccess?: () => void;
  readonly successTitle?: string;
  readonly successMessage?: string;
  readonly errorTitle?: string;
  readonly showSuccessNotification?: boolean;
};

export function useAuthForm<T extends Record<string, unknown>>(
  form: UseFormReturnType<T>,
  options: UseAuthFormOptions = {},
) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const {
    onSuccess,
    successTitle = 'Success',
    successMessage = 'Operation completed successfully',
    errorTitle = 'Error',
    showSuccessNotification = true,
  } = options;

  const clearErrors = () => {
    setShowAlert(false);
  };

  const handleSubmit =
    (submitFn: (values: T) => Promise<void>) => async (values: T) => {
      try {
        setIsLoading(true);
        await submitFn(values);

        if (showSuccessNotification) {
          notifications.show({
            title: successTitle,
            message: successMessage,
            color: 'green',
            icon: <IconCheck size={16} />,
          });
        }

        onSuccess?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred';

        const formFields = Object.keys(form.values);
        const errors = Object.fromEntries(
          formFields.map((field) => [field, ' ']),
        );
        form.setErrors(errors);

        setShowAlert(true);

        notifications.show({
          title: errorTitle,
          message: errorMessage,
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });
      } finally {
        setIsLoading(false);
      }
    };

  return {
    isLoading,
    showAlert,
    clearErrors,
    handleSubmit,
  };
}
