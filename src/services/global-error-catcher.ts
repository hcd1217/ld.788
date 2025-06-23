import { useErrorStore } from '@/stores/error-store.ts';
import { AppError } from '@/domain/error/app-error.ts';

export default function registerGlobalErrorCatcher() {
  const { setError } = useErrorStore.getState();
  globalThis.addEventListener('error', (event) => {
    setError(
      new AppError({
        code: 'UNKNOWN_ERROR',
        message: 'Unknown error',
        error:
          event.error instanceof Error
            ? event.error
            : new Error('Unknown error'),
      }),
    );
  });

  globalThis.addEventListener('unhandledrejection', (event) => {
    setError(
      new AppError({
        code: 'UNHANDLED_REJECTION',
        message: 'Unhandled rejection',
        error:
          event.reason instanceof Error
            ? event.reason
            : new Error('Unhandled rejection'),
      }),
    );
  });
}
