import {isDevelopment, isProduction} from './env';
import {useErrorStore, type ErrorType} from '@/stores/error';

type ErrorEventDetails = {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
};

type UnhandledRejectionDetails = {
  reason: unknown;
  promise: Promise<unknown>;
};

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Unknown error occurred';
}

function extractErrorStack(error: unknown): string | undefined {
  if (error instanceof Error && error.stack) {
    return error.stack;
  }

  if (error && typeof error === 'object' && 'stack' in error) {
    return String(error.stack);
  }

  return undefined;
}

function createErrorSource(
  filename?: string,
  lineno?: number,
  colno?: number,
): string | undefined {
  if (!filename) {
    return undefined;
  }

  let source = filename;
  if (lineno !== undefined) {
    source += `:${lineno}`;
    if (colno !== undefined) {
      source += `:${colno}`;
    }
  }

  return source;
}

export default function registerGlobalErrorCatcher(): () => void {
  // Global error handler
  const errorHandler = (event: ErrorEvent): void => {
    // Prevent default error handling
    event.preventDefault();

    const details: ErrorEventDetails = {
      message: event.message || 'Unknown error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error as Error | undefined,
    };

    const errorType: ErrorType = 'error';
    const message = details.error
      ? extractErrorMessage(details.error)
      : details.message;
    const stack = details.error ? extractErrorStack(details.error) : undefined;
    const source = createErrorSource(
      details.filename,
      details.lineno,
      details.colno,
    );

    // Add to error store
    useErrorStore.getState().addError({
      type: errorType,
      message,
      stack,
      source,
      context: {
        isDevelopment,
        isProduction,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: globalThis.location.href,
      },
    });

    // In production, you might want to send to an external service
    if (isProduction) {
      // Future: Integrate with error tracking service (e.g., Sentry)
      // For now, log to console in production
      console.error('Production error:', {message, stack, source});
    }
  };

  // Unhandled promise rejection handler
  const unhandledRejectionHandler = (event: PromiseRejectionEvent): void => {
    // Prevent default rejection handling
    event.preventDefault();

    const details: UnhandledRejectionDetails = {
      reason: event.reason,
      promise: event.promise,
    };

    const errorType: ErrorType = 'unhandledRejection';
    const message = extractErrorMessage(details.reason);
    const stack = extractErrorStack(details.reason);

    // Add to error store
    useErrorStore.getState().addError({
      type: errorType,
      message,
      stack,
      context: {
        isDevelopment,
        isProduction,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: globalThis.location.href,
        promiseReason: details.reason,
      },
    });

    // In production, you might want to send to an external service
    if (isProduction) {
      // Future: Integrate with error tracking service (e.g., Sentry)
      // For now, log to console in production
      console.error('Unhandled promise rejection:', {
        message,
        stack,
        reason: details.reason,
      });
    }
  };

  // Register event listeners
  globalThis.addEventListener('error', errorHandler);
  globalThis.addEventListener('unhandledrejection', unhandledRejectionHandler);

  // Return cleanup function
  return () => {
    globalThis.removeEventListener('error', errorHandler);
    globalThis.removeEventListener(
      'unhandledrejection',
      unhandledRejectionHandler,
    );
  };
}

// Optional: Rate limiting wrapper to prevent error spam
export function registerGlobalErrorCatcherWithRateLimit(
  maxErrorsPerMinute = 30,
): () => void {
  const errorTimestamps: number[] = [];
  const oneMinute = 60 * 1000;

  const originalRegister = registerGlobalErrorCatcher();

  // Wrap the error store's addError method
  const originalAddError = useErrorStore.getState().addError;

  useErrorStore.setState({
    addError(error) {
      const now = Date.now();

      // Remove timestamps older than one minute
      while (
        errorTimestamps.length > 0 &&
        errorTimestamps[0] < now - oneMinute
      ) {
        errorTimestamps.shift();
      }

      // Check if we've exceeded the rate limit
      if (errorTimestamps.length >= maxErrorsPerMinute) {
        console.warn(
          'Error rate limit exceeded, dropping error:',
          error.message,
        );
        return;
      }

      // Add current timestamp and proceed with original addError
      errorTimestamps.push(now);
      originalAddError(error);
    },
  });

  // Return cleanup function that also restores the original addError
  return () => {
    originalRegister();
    useErrorStore.setState({addError: originalAddError});
  };
}
