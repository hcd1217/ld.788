import {createOptimizedStore} from './createOptimizedStore';

type AppConfigState = {
  clientCode: string;
  theme: 'light' | 'dark';
  setClientCode: (clientCode: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
};

const appConfigStore = createOptimizedStore<AppConfigState>(
  (set) => ({
    clientCode: localStorage.getItem('clientCode') ?? 'ACME',
    theme: 'light',
    setClientCode(clientCode) {
      localStorage.setItem('clientCode', clientCode);
      set({clientCode});
    },
    setTheme(theme) {
      set({theme});
    },
  }),
  {
    name: 'app-config-store',
    enableDevtools: true,
  },
);

export const useAppConfigStore = appConfigStore;

// Optimized selectors for app config
export const appConfigStoreSelectors = {
  clientCode: (state: AppConfigState) => state.clientCode,
  theme: (state: AppConfigState) => state.theme,
  actions: (state: AppConfigState) => ({
    setClientCode: state.setClientCode,
    setTheme: state.setTheme,
  }),
};
