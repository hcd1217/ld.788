import { useCallback, useState } from 'react';

import useSWRMutation from 'swr/mutation';

import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';

type NotificationOptions = {
  readonly successTitle?: string;
  readonly successMessage?: string;
  readonly errorTitle?: string;
  readonly errorMessage?: string;
};

type UseSWRActionOptions<TData = any, TError = any> = {
  readonly notifications?: NotificationOptions;
  readonly onSuccess?: (data: TData) => void | Promise<void>;
  readonly onError?: (error: TError) => void;
  readonly onSettled?: () => void;
};

type UseSWRActionReturn<TArgs, TData> = {
  readonly trigger: (args?: TArgs) => Promise<TData>;
  readonly isMutating: boolean;
  readonly error: Error | undefined;
  readonly data: TData | undefined;
  readonly reset: () => void;
};

/**
 * A hook that wraps SWR mutation for handling async actions with proper state management
 *
 * @param key - Unique key for the mutation (used for deduplication)
 * @param handler - The async function to execute
 * @param options - Configuration options for notifications and callbacks
 * @returns Object with trigger function, loading state, error, and data
 *
 * @example
 * const uploadPhotos = useSWRAction(
 *   'upload-photos',
 *   async (photoUrls: string[]) => {
 *     return await api.uploadPhotos(deliveryId, photoUrls);
 *   },
 *   {
 *     notifications: {
 *       successTitle: 'Success',
 *       successMessage: 'Photos uploaded successfully',
 *       errorTitle: 'Error',
 *       errorMessage: 'Failed to upload photos'
 *     },
 *     onSuccess: (data) => {
 *       console.log('Uploaded:', data);
 *     }
 *   }
 * );
 *
 * // Usage
 * await uploadPhotos.trigger(['photo1.jpg', 'photo2.jpg']);
 */
export function useSWRAction<TArgs = any, TData = any, TError = Error>(
  key: string,
  handler: (args: TArgs) => Promise<TData>,
  options?: UseSWRActionOptions<TData, TError>,
): UseSWRActionReturn<TArgs, TData> {
  const [localError, setLocalError] = useState<Error | undefined>();

  // Use SWR mutation for proper request deduplication and state management
  const {
    trigger: swrTrigger,
    isMutating,
    data,
    error: swrError,
    reset: swrReset,
  } = useSWRMutation(
    key,
    async (_key: string, { arg }: { arg: TArgs }) => {
      try {
        setLocalError(undefined);
        const result = await handler(arg);

        // Show success notification if configured
        if (options?.notifications?.successTitle) {
          showSuccessNotification(
            options.notifications.successTitle,
            options.notifications.successMessage,
          );
        }

        // Call onSuccess callback if provided
        await options?.onSuccess?.(result);

        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setLocalError(errorObj);

        // Call onError callback if provided
        options?.onError?.(error as TError);

        // Show error notification if configured
        if (options?.notifications?.errorTitle) {
          const isDevelopment = import.meta.env.DEV;
          const errorMessage =
            isDevelopment && errorObj.message
              ? errorObj.message
              : options.notifications.errorMessage || 'An error occurred';

          showErrorNotification(options.notifications.errorTitle, errorMessage);
        }

        throw error;
      } finally {
        // Call onSettled callback if provided
        options?.onSettled?.();
      }
    },
    {
      // Prevent automatic revalidation on window focus
      revalidate: false,
      // Don't populate the error field automatically (we handle it in the handler)
      throwOnError: false,
    },
  );

  // Wrapper trigger function that properly types the arguments
  const trigger = useCallback(
    async (args?: TArgs): Promise<TData> => {
      // @ts-expect-error - SWR mutation typing is complex, but this works correctly
      return await swrTrigger(args);
    },
    [swrTrigger],
  );

  // Reset function to clear error and data states
  const reset = useCallback(() => {
    setLocalError(undefined);
    swrReset();
  }, [swrReset]);

  return {
    trigger,
    isMutating,
    error: localError || swrError,
    data,
    reset,
  };
}

/**
 * Hook for simple async actions without arguments
 *
 * @example
 * const refreshData = useSimpleSWRAction(
 *   'refresh-data',
 *   async () => {
 *     return await api.refreshData();
 *   },
 *   {
 *     notifications: {
 *       successTitle: 'Data refreshed'
 *     }
 *   }
 * );
 *
 * await refreshData.trigger();
 */
export function useSimpleSWRAction<TData = any, TError = Error>(
  key: string,
  handler: () => Promise<TData>,
  options?: UseSWRActionOptions<TData, TError>,
): UseSWRActionReturn<void, TData> {
  return useSWRAction<void, TData, TError>(key, handler, options);
}
