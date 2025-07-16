import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {authService} from '@/services/auth';
import {adminService} from '@/services/admin';
import {delay} from '@/utils/time';
import {
  storeAdminSession,
  clearAdminSession,
  isAdminAuthenticated,
  restoreAdminSession,
} from '@/utils/adminSessionManager';

type User = {
  id: string;
  email: string;
  isRoot?: boolean;
};

type AppState = {
  clientCode: string;
  user: User | undefined;
  isAuthenticated: boolean;
  adminAuthenticated: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark';
  setUser: (user: User | undefined) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setAdminAuth: (authenticated: boolean) => void;
  login: (params: {
    identifier: string;
    password: string;
    clientCode: string;
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  adminLogin: (accessKey: string) => Promise<void>;
  adminLogout: () => void;
};

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => {
      // Restore admin session on initialization
      restoreAdminSession();

      return {
        clientCode: localStorage.getItem('clientCode') ?? 'ACME',
        user: authService.getCurrentUser() ?? undefined,
        isAuthenticated: true,
        adminAuthenticated: isAdminAuthenticated(),
        isLoading: false,
        theme: 'light',
        setUser: (user) => set({user, isAuthenticated: Boolean(user)}),
        setTheme: (theme) => set({theme}),
        setAdminAuth: (authenticated) =>
          set({adminAuthenticated: authenticated}),
        async login(params) {
          set({isLoading: true, clientCode: params.clientCode});
          try {
            const {user} = await authService.login({
              identifier: params.identifier,
              password: params.password,
              clientCode: params.clientCode ?? get().clientCode,
            });
            set({
              user,
              clientCode: params.clientCode,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            set({isLoading: false});
            throw error;
          }
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
        async adminLogin(accessKey: string) {
          set({isLoading: true});
          try {
            const response = await adminService.login({accessKey});
            if (response.success) {
              storeAdminSession(accessKey);
              set({adminAuthenticated: true, isLoading: false});
            } else {
              set({isLoading: false});
              throw new Error('Invalid access key');
            }
          } catch (error) {
            set({isLoading: false});
            clearAdminSession();
            throw error;
          }
        },
        adminLogout() {
          clearAdminSession();
          adminService.logout();
          set({adminAuthenticated: false});
        },
      };
    },
    {
      name: 'app-store',
    },
  ),
);
