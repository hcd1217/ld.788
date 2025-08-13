import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { authService } from '@/services/auth';
import { adminService } from '@/services/admin';
import {
  storeAdminSession,
  clearAdminSession,
  isAdminAuthenticated,
  restoreAdminSession,
} from '@/utils/adminSessionManager';
import { authApi, clientApi, type ClientPublicConfigResponse } from '@/lib/api';
import { updateClientTranslations, clearClientTranslations } from '@/lib/i18n';
import type { GetMeResponse } from '@/lib/api/schemas/auth.schemas';
import { cacheNavigationConfig, clearNavigationCache } from '@/utils/navigationCache';
import { isDevelopment } from '@/utils/env';

type User = {
  id: string;
  email: string;
  isRoot?: boolean;
};

type ClientPublicConfig = ClientPublicConfigResponse;
type UserProfile = GetMeResponse;

type AppState = {
  publicClientConfig?: ClientPublicConfig;
  clientCode: string;
  user: User | undefined;
  userProfile: UserProfile | undefined;
  isAuthenticated: boolean;
  authInitialized: boolean;
  adminAuthenticated: boolean;
  isLoading: boolean;
  adminApiLoading: boolean;
  adminApiLoadingMessage: string;
  permissionError: boolean;
  theme: 'light' | 'dark';
  config: {
    pagination: {
      mobile: {
        defaultPageSize: number;
        pagingOptions: Array<{ value: string; label: string }>;
      };
      desktop: {
        defaultPageSize: number;
        pagingOptions: Array<{ value: string; label: string }>;
      };
    };
  };
  setUser: (user: User | undefined) => void;
  setUserProfile: (profile: UserProfile | undefined) => void;
  fetchUserProfile: () => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => void;
  setAdminAuth: (authenticated: boolean) => void;
  setAdminApiLoading: (loading: boolean, message?: string) => void;
  setPermissionError: (hasError: boolean) => void;
  fetchPublicClientConfig: (clientCode: string) => Promise<void>;
  login: (params: { identifier: string; password: string; clientCode: string }) => Promise<void>;
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

      // Load public client config on initialization
      const clientCode = localStorage.getItem('clientCode') ?? 'ACME';
      clientApi
        .getPubicClientConfig(clientCode)
        .then((config) => {
          set({ publicClientConfig: config });
        })
        .catch((error) => {
          if (isDevelopment) {
            console.error('Failed to fetch initial public client config:', error);
          }
        });

      return {
        clientCode,
        user: authService.getCurrentUser() ?? undefined,
        userProfile: undefined,
        isAuthenticated: Boolean(authService.getCurrentUser()),
        authInitialized: false,
        adminAuthenticated: isAdminAuthenticated(),
        isLoading: false,
        adminApiLoading: false,
        adminApiLoadingMessage: '',
        permissionError: false,
        theme: 'light',
        config: {
          pagination: {
            mobile: {
              defaultPageSize: 1000,
              PagingOptions: [{ value: '1000', label: '1000' }],
            },
            desktop: {
              defaultPageSize: 12,
              pagingOptions: [
                { value: '6', label: '6' },
                { value: '12', label: '12' },
                { value: '24', label: '24' },
                { value: '48', label: '48' },
              ],
            },
          },
        },
        setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
        setUserProfile: (profile) => set({ userProfile: profile }),
        async fetchUserProfile() {
          try {
            const profile = await authApi.getMe();
            set({ userProfile: profile, permissionError: false });

            // Cache navigation config if available
            if (profile.clientConfig?.navigation?.length) {
              cacheNavigationConfig(profile?.clientConfig?.navigation);
            }

            // Apply client-specific translations if available
            if (profile.clientConfig?.translations) {
              // Clear old client translation before add new one
              clearClientTranslations();
              updateClientTranslations(profile.clientConfig.translations);
            }
          } catch (error: unknown) {
            if (isDevelopment) {
              console.error('Failed to fetch user profile:', error);
            }

            // Check if it's a 401
            const isApiError = error && typeof error === 'object' && 'status' in error;
            const errorStatus = isApiError ? (error as { status: number }).status : 0;
            if (errorStatus === 401) {
              get().logout();
            }
          }
        },
        setTheme: (theme) => set({ theme }),
        setAdminAuth: (authenticated) => set({ adminAuthenticated: authenticated }),
        setAdminApiLoading: (loading, message = '') =>
          set({ adminApiLoading: loading, adminApiLoadingMessage: message }),
        setPermissionError: (hasError) => set({ permissionError: hasError }),
        async fetchPublicClientConfig(clientCode: string) {
          try {
            const config = await clientApi.getPubicClientConfig(clientCode);
            set({ publicClientConfig: config });
          } catch (error) {
            if (isDevelopment) {
              console.error('Failed to fetch public client config:', error);
            }
            // Don't throw the error, just log it
            // The UI can handle the undefined publicClientConfig state
          }
        },
        async login(params) {
          set({ isLoading: true, clientCode: params.clientCode });
          try {
            // Fetch public client config if clientCode has changed
            const currentClientCode = get().clientCode;
            if (params.clientCode !== currentClientCode) {
              await get().fetchPublicClientConfig(params.clientCode);
            }

            const { user } = await authService.login({
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
            // Fetch user profile after successful login
            await get().fetchUserProfile();
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },
        logout() {
          authService.logout();
          clearNavigationCache(); // Clear cached navigation on logout
          set({
            user: undefined,
            userProfile: undefined,
            // Don't clear client-specific public config on logout
            // publicClientConfig: undefined,
            isAuthenticated: false,
            permissionError: false,
          });
          // Don't clear client-specific translations on logout
          // clearClientTranslations();
        },
        async checkAuth() {
          set({ authInitialized: false });
          const isAuthenticated = await authService.isAuthenticated();
          if (isAuthenticated) {
            const user = authService.getCurrentUser();
            set({ isAuthenticated, user: user ?? undefined });
            // Fetch user profile when checking auth
            await get().fetchUserProfile();
          } else {
            set({
              user: undefined,
              userProfile: undefined,
              isAuthenticated: false,
              permissionError: false,
            });
          }
          set({ authInitialized: true });
          return isAuthenticated;
        },
        async adminLogin(accessKey: string) {
          set({ isLoading: true });
          try {
            const response = await adminService.login({ accessKey });
            if (response.success) {
              storeAdminSession(accessKey);
              set({ adminAuthenticated: true, isLoading: false });
            } else {
              set({ isLoading: false });
              throw new Error('Invalid access key');
            }
          } catch (error) {
            set({ isLoading: false });
            clearAdminSession();
            throw error;
          }
        },
        adminLogout() {
          clearAdminSession();
          adminService.logout();
          set({ adminAuthenticated: false });
        },
      };
    },
    {
      name: 'app-store',
    },
  ),
);

// Computed selectors for convenience
export const useClientConfig = () => useAppStore((state) => state.userProfile?.clientConfig);
export const usePublicClientConfig = () => useAppStore((state) => state.publicClientConfig);
