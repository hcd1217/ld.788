import {createOptimizedStore} from './createOptimizedStore';

type FormState = {
  isLoading: boolean;
  formErrors: Record<string, string>;
  setLoading: (isLoading: boolean) => void;
  setFormErrors: (errors: Record<string, string>) => void;
  clearFormErrors: () => void;
  clearError: (field: string) => void;
};

const formStore = createOptimizedStore<FormState>(
  (set, get) => ({
    isLoading: false,
    formErrors: {},
    setLoading(isLoading) {
      set({isLoading});
    },
    setFormErrors(errors) {
      set({formErrors: errors});
    },
    clearFormErrors() {
      set({formErrors: {}});
    },
    clearError(field) {
      const currentErrors = get().formErrors;
      const {[field]: _, ...newErrors} = currentErrors;
      set({formErrors: newErrors});
    },
  }),
  {
    name: 'form-store',
    enableDevtools: true,
  },
);

export const useFormStore = formStore;

// Optimized selectors for form state
export const formStoreSelectors = {
  loading: (state: FormState) => state.isLoading,
  errors: (state: FormState) => state.formErrors,
  hasErrors: (state: FormState) => Object.keys(state.formErrors).length > 0,
  getFieldError: (field: string) => (state: FormState) =>
    state.formErrors[field],
  actions: (state: FormState) => ({
    setLoading: state.setLoading,
    setFormErrors: state.setFormErrors,
    clearFormErrors: state.clearFormErrors,
    clearError: state.clearError,
  }),
};
