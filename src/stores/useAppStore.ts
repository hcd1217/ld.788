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
import {
  overviewService,
  type OverviewData,
  type EmployeeOverview,
  type CustomerOverview,
} from '@/services/client/overview';
import { cacheNavigationConfig, clearNavigationCache } from '@/utils/navigationCache';
import { logError } from '@/utils/logger';

type ClientPublicConfig = ClientPublicConfigResponse;
type User = GetMeResponse; // Unified user type from /auth/me

type AppState = {
  publicClientConfig?: ClientPublicConfig;
  clientCode: string;
  user: User | undefined; // Full user profile from /auth/me
  overviewData: OverviewData | undefined; // Combined overview data
  employeeMapByUserId: Map<string, EmployeeOverview>; // Stable Map for employee lookup
  customerMapByCustomerId: Map<string, CustomerOverview>; // Stable Map for customer lookup
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
  fetchUserProfile: () => Promise<void>;
  fetchOverviewData: () => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => void;
  setAdminAuth: (authenticated: boolean) => void;
  setAdminApiLoading: (loading: boolean, message?: string) => void;
  setPermissionError: (hasError: boolean) => void;
  fetchPublicClientConfig: (clientCode: string) => Promise<void>;
  login: (params: { identifier: string; password: string; clientCode: string }) => Promise<void>;
  loginWithMagicLink: (params: { clientCode: string; token: string }) => Promise<void>;
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
      const clientCode = localStorage.getItem('clientCode') ?? 'NKTU';
      clientApi
        .getPubicClientConfig(clientCode)
        .then((config) => {
          set({ publicClientConfig: config });
        })
        .catch((error) => {
          logError('Failed to fetch initial public client config:', error, {
            module: 'AppStore',
            action: 'useAppStore',
          });
        });

      return {
        clientCode,
        user: undefined, // User will be fetched from /auth/me
        overviewData: undefined, // Overview data will be fetched after login
        employeeMapByUserId: new Map(), // Initialize empty Map
        customerMapByCustomerId: new Map(), // Initialize empty Map
        isAuthenticated: authService.hasValidToken(),
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
                { value: '10', label: '10' },
                { value: '20', label: '20' },
                { value: '50', label: '50' },
                { value: '100', label: '100' },
              ],
            },
          },
        },
        setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
        async fetchUserProfile() {
          try {
            const user = await authApi.getMe();
            set({ user, permissionError: false });

            // Cache navigation config if available
            if (user.clientConfig?.navigation?.length) {
              cacheNavigationConfig(user?.clientConfig?.navigation);
            }

            // Apply client-specific translations if available
            if (user.clientConfig?.translations) {
              // Clear old client translation before add new one
              clearClientTranslations();
              updateClientTranslations(user.clientConfig.translations);
            }

            // Fetch overview data after getting user profile
            await get().fetchOverviewData();
          } catch (error: unknown) {
            logError('Failed to fetch user profile:', error, {
              module: 'AppStore',
              action: 'if',
            });

            // Check if it's a 401
            const isApiError = error && typeof error === 'object' && 'status' in error;
            const errorStatus = isApiError ? (error as { status: number }).status : 0;
            if (errorStatus === 401) {
              get().logout();
            }
          }
        },
        async fetchOverviewData() {
          try {
            const overviewData = await overviewService.getOverviewData();
            // Create employeeMapByUserId once when data is fetched
            const employeeMapByUserId = new Map(
              overviewData.employees.map((employee) => [employee.userId || employee.id, employee]),
            );
            const customerMapByCustomerId = new Map(
              overviewData.customers.map((customer) => [customer.id, customer]),
            );
            set({ overviewData, employeeMapByUserId, customerMapByCustomerId });
          } catch (error: unknown) {
            logError('Failed to fetch overview data:', error, {
              module: 'AppStore',
              action: 'fetchOverviewData',
            });
            // Don't throw - overview data is not critical for app functionality
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
            logError('Failed to fetch public client config:', error, {
              module: 'AppStore',
              action: 'fetchPublicClientConfig',
            });
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

            await authService.login({
              identifier: params.identifier,
              password: params.password,
              clientCode: params.clientCode ?? get().clientCode,
            });
            set({
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
        async loginWithMagicLink(params) {
          set({ isLoading: true });
          try {
            // Save client code and verify magic link token
            await authService.loginWithMagicToken(params.clientCode, params.token);

            // Important: Set isAuthenticated to true immediately after successful token verification
            set({
              clientCode: params.clientCode,
              isAuthenticated: true,
              isLoading: false,
            });

            // Fetch user profile after successful magic link login
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
            overviewData: undefined, // Clear overview data on logout
            employeeMapByUserId: new Map(), // Clear employee map on logout
            customerMapByCustomerId: new Map(), // Clear customer map on logout
            // Don't clear client-specific public config on logout
            // publicClientConfig: undefined,
            isAuthenticated: false,
            permissionError: false,
          });
          // Don't clear client-specific translations on logout
          // clearClientTranslations();
        },
        async checkAuth() {
          // Don't reset authInitialized if already authenticated (e.g., after magic link login)
          const currentState = get();
          if (!currentState.authInitialized) {
            set({ authInitialized: false });
          }

          const isAuthenticated = await authService.isAuthenticated();
          if (isAuthenticated) {
            set({ isAuthenticated });
            // Fetch user profile when checking auth
            await get().fetchUserProfile();
          } else {
            set({
              user: undefined,
              overviewData: undefined,
              employeeMapByUserId: new Map(),
              customerMapByCustomerId: new Map(),
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
export const useClientConfig = () => useAppStore((state) => state.user?.clientConfig);
export const usePublicClientConfig = () => useAppStore((state) => state.publicClientConfig);
// Return stable Map reference to avoid infinite re-renders
export const useEmployeeMapByUserId = () => useAppStore((state) => state.employeeMapByUserId);
export const useCustomerMapByCustomerId = () =>
  useAppStore((state) => state.customerMapByCustomerId);
// Customer selectors
export const useCustomers = () => useAppStore((state) => state.overviewData?.customers ?? []);
