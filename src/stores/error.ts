import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ErrorType = 'error' | 'unhandledRejection' | 'apiError' | 'componentError';
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ErrorRecord = {
  id: string;
  timestamp: Date;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  source?: string;
  context?: Record<string, unknown>;
  count: number;
};

type ErrorInput = Omit<ErrorRecord, 'id' | 'timestamp' | 'count' | 'severity'> & {
  severity?: ErrorSeverity;
};

type ErrorState = {
  errors: ErrorRecord[];
  maxErrors: number;
  addError: (error: ErrorInput) => void;
  clearErrors: () => void;
  clearError: (id: string) => void;
  getRecentErrors: (count: number) => ErrorRecord[];
  getErrorsByType: (type: ErrorType) => ErrorRecord[];
  getErrorCount: () => number;
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getErrorSeverity(
  error: Omit<ErrorRecord, 'id' | 'timestamp' | 'count' | 'severity'>,
): ErrorSeverity {
  // API errors are usually high severity
  if (error.type === 'apiError') {
    const status = error.context?.status as number | undefined;
    if (status !== undefined && status >= 500) return 'critical';
    if (status !== undefined && status >= 400) return 'high';
    return 'medium';
  }

  // Component errors are high severity
  if (error.type === 'componentError') return 'high';

  // Unhandled rejections are medium by default
  if (error.type === 'unhandledRejection') return 'medium';

  // Regular errors default to low
  return 'low';
}

function isDuplicateError(newError: ErrorInput, existingError: ErrorRecord): boolean {
  return (
    newError.type === existingError.type &&
    newError.message === existingError.message &&
    newError.source === existingError.source
  );
}

export const useErrorStore = create<ErrorState>()(
  devtools(
    (set, get) => ({
      errors: [] as ErrorRecord[],
      maxErrors: 50,

      addError(error: ErrorInput) {
        set((state) => {
          const existingErrorIndex = state.errors.findIndex((e: ErrorRecord) => {
            return isDuplicateError(error, e);
          });

          // If duplicate found, increment count
          if (existingErrorIndex !== -1) {
            const updatedErrors = [...state.errors];
            const existingError = updatedErrors[existingErrorIndex];
            if (existingError) {
              updatedErrors[existingErrorIndex] = {
                ...existingError,
                count: Number(existingError.count ?? 0) + 1,
                timestamp: new Date(),
              };
            }

            return { errors: updatedErrors };
          }

          // Add new error
          const newError: ErrorRecord = {
            ...error,
            id: generateId(),
            timestamp: new Date(),
            count: 1,
            severity: error.severity ?? getErrorSeverity(error),
          };

          // Maintain max errors limit (remove oldest)
          const errors = [newError, ...state.errors].slice(0, Number(state.maxErrors));

          return { errors };
        });
      },

      clearErrors() {
        set({ errors: [] });
      },

      clearError(id: string) {
        set((state) => ({
          errors: state.errors.filter((error) => error.id !== id),
        }));
      },

      getRecentErrors(count: number) {
        const { errors } = get();
        return errors.slice(0, count);
      },

      getErrorsByType(type: ErrorType) {
        const { errors } = get();
        return errors.filter((error) => error.type === type);
      },

      getErrorCount() {
        const { errors } = get();
        return errors.reduce((total, error) => {
          return Number(total) + Number(error.count ?? 0);
        }, 0);
      },
    }),
    {
      name: 'error-store',
    },
  ),
);

// Helper function for adding API errors
export function addApiError(
  message: string,
  status: number,
  endpoint: string,
  data?: unknown,
): void {
  useErrorStore.getState().addError({
    type: 'apiError',
    message,
    context: {
      status,
      endpoint,
      data,
    },
  });
}

// Helper function for adding component errors
export function addComponentError(message: string, componentName: string, error?: Error): void {
  useErrorStore.getState().addError({
    type: 'componentError',
    message,
    stack: error?.stack,
    context: {
      componentName,
    },
  });
}
