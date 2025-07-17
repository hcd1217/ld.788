import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {adminApi, type AdminPermission} from '@/lib/api';

interface PermissionState {
  // State
  permissions: AdminPermission[];
  isLoading: boolean;
  error: string | undefined;
  searchQuery: string;
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  // Actions
  loadPermissions: (params?: {
    search?: string;
    offset?: number;
    limit?: number;
  }) => Promise<void>;
  createPermission: (data: {
    resource: string;
    action: string;
    scope: string;
    description: string;
  }) => Promise<void>;
  updatePermission: (id: string, data: {description: string}) => Promise<void>;
  deletePermission: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  reset: () => void;
}

// Using the pre-configured adminApi from @/lib/api

const initialState = {
  permissions: [],
  isLoading: false,
  error: undefined,
  searchQuery: '',
  pagination: {
    total: 0,
    offset: 0,
    limit: 20,
    hasNext: false,
    hasPrev: false,
  },
};

export const usePermissionStore = create<PermissionState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      async loadPermissions(params) {
        set({isLoading: true, error: undefined});
        try {
          const response = await adminApi.getAllAdminPermissions({
            search: params?.search ?? get().searchQuery,
            offset: params?.offset ?? 0,
            limit: params?.limit ?? 20,
          });

          set({
            permissions: response.permissions,
            pagination: {
              total: response.total,
              offset: response.offset,
              limit: response.limit,
              hasNext: response.hasNext ?? false,
              hasPrev: response.hasPrev ?? false,
            },
            isLoading: false,
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to load permissions';
          set({error: message, isLoading: false});
          throw error;
        }
      },

      async createPermission(data) {
        set({isLoading: true, error: undefined});
        try {
          await adminApi.createAdminPermission(data);
          // Reload permissions to get the updated list
          await get().loadPermissions();
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to create permission';
          set({error: message, isLoading: false});
          throw error;
        }
      },

      async updatePermission(id, data) {
        set({isLoading: true, error: undefined});
        try {
          await adminApi.updateAdminPermission(id, data);
          // Reload permissions to get the updated list
          await get().loadPermissions();
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to update permission';
          set({error: message, isLoading: false});
          throw error;
        }
      },

      async deletePermission(id) {
        set({isLoading: true, error: undefined});
        try {
          await adminApi.deleteAdminPermission(id);
          // Reload permissions to get the updated list
          await get().loadPermissions();
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to delete permission';
          set({error: message, isLoading: false});
          throw error;
        }
      },

      setSearchQuery(query) {
        set({searchQuery: query});
      },

      clearError() {
        set({error: undefined});
      },

      reset() {
        set(initialState);
      },
    }),
    {
      name: 'permission-store',
    },
  ),
);

// Selector hooks
export const usePermissions = () =>
  usePermissionStore((state) => state.permissions);
export const usePermissionLoading = () =>
  usePermissionStore((state) => state.isLoading);
export const usePermissionError = () =>
  usePermissionStore((state) => state.error);
export const usePermissionPagination = () =>
  usePermissionStore((state) => state.pagination);
export const usePermissionActions = () => ({
  loadPermissions: usePermissionStore((state) => state.loadPermissions),
  createPermission: usePermissionStore((state) => state.createPermission),
  updatePermission: usePermissionStore((state) => state.updatePermission),
  deletePermission: usePermissionStore((state) => state.deletePermission),
  setSearchQuery: usePermissionStore((state) => state.setSearchQuery),
  clearError: usePermissionStore((state) => state.clearError),
  reset: usePermissionStore((state) => state.reset),
});
