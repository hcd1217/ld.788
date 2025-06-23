import { create } from 'zustand';
import { type AppError } from '@/domain/error/app-error.ts';

type ErrorState = {
  error: AppError | undefined;
  setError: (error: AppError, autoClear?: boolean) => void;
  clearError: () => void;
};

export const useErrorStore = create<ErrorState>((set) => ({
  error: undefined,
  setError(error, autoClear = false, timeout = 3000) {
    set({ error });

    if (autoClear && error) {
      setTimeout(() => {
        set({ error: undefined });
      }, timeout);
    }
  },
  clearError() {
    set({ error: undefined });
  },
}));
