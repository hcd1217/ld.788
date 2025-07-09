import {createOptimizedStore} from './createOptimizedStore';
import {authService} from '@/services/auth';
import {delay} from '@/utils/time';

type User = {
  id: string;
  email: string;
  isRoot?: boolean;
};

type AuthState = {
  user: User | undefined;
  isAuthenticated: boolean;
  setUser: (user: User | undefined) => void;
  login: (params: {
    identifier: string;
    password: string;
    clientCode: string;
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
};

const authStore = createOptimizedStore<AuthState>(
  (set) => ({
    user: authService.getCurrentUser() ?? undefined,
    isAuthenticated: Boolean(authService.getCurrentUser()),
    setUser(user) {
      set({user, isAuthenticated: Boolean(user)});
    },
    async login(params) {
      const {user} = await authService.login({
        identifier: params.identifier,
        password: params.password,
        clientCode: params.clientCode,
      });
      set({
        user,
        isAuthenticated: true,
      });
    },
    logout() {
      authService.logout();
      set({user: undefined, isAuthenticated: false});
    },
    async checkAuth() {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        await delay(100);
        const user = authService.getCurrentUser();
        set({isAuthenticated, user: user ?? undefined});
      } else {
        set({user: undefined, isAuthenticated: false});
      }

      return isAuthenticated;
    },
  }),
  {
    name: 'auth-store',
    enableDevtools: true,
  },
);

export const useAuthStore = authStore;

// Optimized selectors for auth state
export const authStoreSelectors = {
  auth: (state: AuthState) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  }),
  user: (state: AuthState) => state.user,
  isAuthenticated: (state: AuthState) => state.isAuthenticated,
  actions: (state: AuthState) => ({
    login: state.login,
    logout: state.logout,
    checkAuth: state.checkAuth,
  }),
};
