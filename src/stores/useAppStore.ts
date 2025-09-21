import React from 'react';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { clientApi, type ClientConfig, type ClientPublicConfigResponse } from '@/lib/api';
import { clearClientTranslations, updateClientTranslations } from '@/lib/i18n';
import { authService } from '@/services/auth/auth';
import type { Permission, User } from '@/services/auth/auth';
import {
  type CustomerOverview,
  type EmployeeOverview,
  type OverviewData,
  overviewService,
} from '@/services/client/overview';
import { logError } from '@/utils/logger';
import { cacheNavigationConfig, clearNavigationCache } from '@/utils/navigationCache';
import { STORAGE_KEYS } from '@/utils/storageKeys';

type ClientPublicConfig = ClientPublicConfigResponse;
type AppState = {
  publicClientConfig?: ClientPublicConfig;
  clientCode: string;
  user: User | undefined; // Full user profile from /auth/me
  overviewData: OverviewData | undefined; // Combined overview data
  employeeMapByUserId: Map<string, EmployeeOverview>; // Stable Map for employee lookup
  customerMapByCustomerId: Map<string, CustomerOverview>; // Stable Map for customer lookup
  isAuthenticated: boolean;
  authInitialized: boolean;
  isLoading: boolean;
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
  setPermissionError: (hasError: boolean) => void;
  fetchPublicClientConfig: (clientCode: string) => Promise<void>;
  login: (params: { identifier: string; password: string; clientCode: string }) => Promise<void>;
  loginWithMagicLink: (params: { clientCode: string; token: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
};

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => {
      // Load public client config on initialization
      const clientCode = localStorage.getItem(STORAGE_KEYS.AUTH.CLIENT_CODE) ?? 'ACME';
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
        isLoading: false,
        permissionError: false,
        theme: 'light',
        config: {
          pagination: {
            mobile: {
              defaultPageSize: 1000,
              pagingOptions: [{ value: '1000', label: '1000' }],
            },
            desktop: {
              defaultPageSize: 20,
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
            const user = await authService.getMe();
            const DEFAULT_DELAY = 500;
            let delay = Number(user.clientConfig?.features?.apiCall?.delay ?? DEFAULT_DELAY);
            if (!Number.isNaN(delay)) {
              delay = Math.max(delay, 0) || DEFAULT_DELAY;
              localStorage.setItem(STORAGE_KEYS.CLIENT.API_DELAY, delay.toString());
            }
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
            set({
              overviewData,
              employeeMapByUserId,
              customerMapByCustomerId,
            });
          } catch (error: unknown) {
            logError('Failed to fetch overview data:', error, {
              module: 'AppStore',
              action: 'fetchOverviewData',
            });
            // Don't throw - overview data is not critical for app functionality
          }
        },
        setTheme: (theme) => set({ theme }),
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
      };
    },
    {
      name: 'app-store',
    },
  ),
);

// Stable empty arrays to avoid infinite re-renders (as per CLAUDE.md line 52)
const EMPTY_CUSTOMERS_ARRAY: readonly CustomerOverview[] = [];
const EMPTY_EMPLOYEES_ARRAY: readonly EmployeeOverview[] = [];
const EMPTY_CUSTOMER_OPTIONS_ARRAY: readonly { id: string; value: string; label: string }[] = [];
const EMPTY_DEPARTMENT_OPTIONS_ARRAY: readonly { id: string; value: string; label: string }[] = [];
const EMPTY_PERMISSIONS: Permission = Object.freeze({
  customer: {
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  },
  product: {
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  },
  employee: {
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  },
  purchaseOrder: {
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    query: {
      canFilter: false,
      canViewAll: false,
    },
    actions: {
      canTakePhoto: false,
      canConfirm: false,
      canProcess: false,
      canShip: false,
      canMarkReady: false,
      canDeliver: false,
      canRefund: false,
      canCancel: false,
    },
  },
  deliveryRequest: {
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    query: {
      canFilter: false,
      canViewAll: false,
      canViewDeliverFromMyPO: false,
    },
    actions: {
      canUpdateDeliveryOrderInDay: false,
      canStartTransit: false,
      canComplete: false,
      canTakePhoto: false,
    },
  },
});

const EMPTY_CLIENT_CONFIG: ClientConfig = {
  navigation: [],
  mobileNavigation: [],
  translations: {},
  publicConfig: {
    features: {
      language: false,
      darkMode: false,
    },
    clientCode: '',
    clientName: '',
    logoUrl: '',
  },
};

// Return stable Map reference to avoid infinite re-renders
export const useEmployeeMapByUserId = () => useAppStore((state) => state.employeeMapByUserId);
export const useCustomerMapByCustomerId = () =>
  useAppStore((state) => state.customerMapByCustomerId);
// Customer selectors - use stable empty array reference
export const useCustomers = () =>
  useAppStore((state) => state.overviewData?.customers ?? EMPTY_CUSTOMERS_ARRAY);

export const useCustomerOptions = () => {
  const customers = useAppStore((state) => state.overviewData?.customers);
  // Use useMemo to create stable reference (as per CLAUDE.md line 52)
  return React.useMemo(() => {
    if (!customers) return EMPTY_CUSTOMER_OPTIONS_ARRAY;
    return customers
      .filter((customer) => customer.isActive)
      .map((customer) => ({
        id: customer.id,
        value: customer.id,
        label: customer.name,
      }));
  }, [customers]);
};

// Employee selectors - use stable empty array reference
export const useEmployees = () =>
  useAppStore((state) => state.overviewData?.employees ?? EMPTY_EMPLOYEES_ARRAY);

export const usePermissions = () =>
  useAppStore((state) => state.user?.permissions ?? EMPTY_PERMISSIONS);

export const useClientConfig = () =>
  useAppStore((state) => state.user?.clientConfig ?? EMPTY_CLIENT_CONFIG);

// Current logged in user
export const useMe = () => useAppStore((state) => state.user);

export const useLogout = () => useAppStore((state) => state.logout);

// Department data - memoized selector to prevent infinite re-renders
export const useDepartmentOptions = () => {
  const departments = useAppStore((state) => state.overviewData?.departments);

  // Use useMemo to create stable reference (as per CLAUDE.md line 52)
  return React.useMemo(() => {
    if (!departments) return EMPTY_DEPARTMENT_OPTIONS_ARRAY;
    return departments.map((department) => ({
      id: department.id,
      value: department.id,
      label: department.name,
    }));
  }, [departments]);
};
