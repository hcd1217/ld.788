// Re-export individual stores for optimized access
// Backward compatibility - legacy combined hook
import {useAuthStore} from './useAuthStore';
import {useFormStore} from './useFormStore';
import {useAppConfigStore} from './useAppConfigStore';

export {useAuthStore, authStoreSelectors} from './useAuthStore';
export {useFormStore, formStoreSelectors} from './useFormStore';
export {useAppConfigStore, appConfigStoreSelectors} from './useAppConfigStore';

// Combined hook for backward compatibility (deprecated)
export const useAppStore = () => {
  const authStore = useAuthStore();
  const formStore = useFormStore();
  const configStore = useAppConfigStore();

  return {
    // Auth state
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    login: authStore.login,
    logout: authStore.logout,
    checkAuth: authStore.checkAuth,
    setUser: authStore.setUser,

    // Form state
    isLoading: formStore.isLoading,

    // Config state
    clientCode: configStore.clientCode,
    theme: configStore.theme,
    setTheme: configStore.setTheme,
  };
};

// Legacy selectors for backward compatibility
export const appStoreSelectors = {
  auth: (state: any) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  }),
  loading: (state: any) => state.isLoading,
  theme: (state: any) => state.theme,
  clientCode: (state: any) => state.clientCode,
  loginState: (state: any) => ({
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login: state.login,
  }),
};
