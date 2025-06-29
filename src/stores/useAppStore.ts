import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {authService} from '@/services/auth';

type User = {
  id: string;
  email: string;
};

type AppState = {
  clientCode: string;
  user: User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark';
  setUser: (user: User | undefined) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  login: (params: {
    identifier: string;
    password: string;
    clientCode: string;
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
};

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => {
      return {
        clientCode: localStorage.getItem('clientCode') ?? '',
        user: authService.getCurrentUser() ?? undefined,
        isAuthenticated: false,
        isLoading: false,
        theme: 'light',
        setUser: (user) => set({user, isAuthenticated: Boolean(user)}),
        setTheme: (theme) => set({theme}),
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
          const user = authService.getCurrentUser();
          set({isAuthenticated, user: user ?? undefined});
          return isAuthenticated;
        },
      };
    },
    {
      name: 'app-store',
    },
  ),
);
