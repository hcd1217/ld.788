import { useState } from 'react';

import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';

import type { UseFormReturnType } from '@mantine/form';

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
    showSuccessNotification: shouldShowSuccessNotification = true,
  } = options;

  const clearErrors = () => {
    setShowAlert(false);
  };

  const handleSubmit = (submitFn: (values: T) => Promise<void>) => async (values: T) => {
    try {
      setIsLoading(true);
      await submitFn(values);

      if (shouldShowSuccessNotification) {
        showSuccessNotification(successTitle, successMessage);
      }

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';

      const formFields = Object.keys(form.values);
      const errors = Object.fromEntries(formFields.map((field) => [field, ' ']));
      form.setErrors(errors);

      setShowAlert(true);

      showErrorNotification(errorTitle, errorMessage);
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
