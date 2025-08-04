import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { storeApi, ApiError } from '@/lib/api';
import {
  type Staff,
  type CreateStaffRequest,
  type UpdateStaffRequest,
  type StaffFormData,
} from '@/lib/api/schemas/staff.schemas';

type StaffState = {
  // Staff data
  staffs: Staff[];
  currentStaff: Staff | undefined;
  isLoading: boolean;
  error: string | undefined;

  // Pagination (cursor-based for API)
  pagination:
    | {
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
        nextCursor: string | undefined;
        prevCursor: string | undefined;
      }
    | undefined;

  // Current store context
  currentStoreId: string | undefined;

  // Actions
  setCurrentStaff: (staff: Staff | undefined) => void;
  loadStaff: (storeId: string, cursor?: string) => Promise<void>;
  createStaff: (storeId: string, data: StaffFormData) => Promise<Staff>;
  updateStaff: (storeId: string, staffId: string, data: StaffFormData) => Promise<Staff>;
  deleteStaff: (storeId: string, staffId: string) => Promise<void>;
  refreshStaff: (storeId: string) => Promise<void>;
  clearError: () => void;
  setCurrentStoreId: (storeId: string | undefined) => void;

  // Selectors
  getStaffById: (id: string) => Staff | undefined;
};

export const useStaffStore = create<StaffState>()(
  devtools(
    (set, get) => ({
      // Initial state
      staffs: [],
      currentStaff: undefined,
      isLoading: false,
      error: undefined,
      pagination: undefined,
      currentStoreId: undefined,

      // Actions
      setCurrentStaff(staffs) {
        set({ currentStaff: staffs, error: undefined });
      },

      setCurrentStoreId(storeId) {
        set({ currentStoreId: storeId });
      },

      async loadStaff(storeId) {
        set({ isLoading: true, error: undefined, currentStoreId: storeId });
        try {
          const { staffs } = await storeApi.getStoreStaff(storeId);

          set({
            staffs,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof ApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : 'Failed to load staff';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async createStaff(storeId, data) {
        set({ isLoading: true, error: undefined });
        try {
          // Extract only the field that API accepts
          const apiRequest: CreateStaffRequest = {
            fullName: data.fullName,
          };

          const newStaff = await storeApi.createStoreStaff(storeId, apiRequest);

          // Add to current staff list
          set((state) => ({
            staff: [newStaff, ...state.staffs],
            isLoading: false,
          }));

          return newStaff;
        } catch (error) {
          const errorMessage =
            error instanceof ApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : 'Failed to create staff member';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async updateStaff(storeId, staffId, data) {
        set({ isLoading: true, error: undefined });
        try {
          // Extract only the field that API accepts
          const apiRequest: UpdateStaffRequest = {
            isActive: data.status === 'active',
          };

          const response = await storeApi.updateStoreStaff(storeId, staffId, apiRequest);
          const updatedStaff = response.staff;

          set((state) => ({
            staffs: state.staffs.map((staff) => (staff.id === staffId ? updatedStaff : staff)),
            currentStaff: state.currentStaff?.id === staffId ? updatedStaff : state.currentStaff,
            isLoading: false,
          }));

          return updatedStaff;
        } catch (error) {
          const errorMessage =
            error instanceof ApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : 'Failed to update staff member';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async deleteStaff(storeId, staffId) {
        set({ isLoading: true, error: undefined });
        try {
          await storeApi.deleteStoreStaff(storeId, staffId);

          set((state) => ({
            staff: state.staffs.filter((staff) => staff.id !== staffId),
            currentStaff: state.currentStaff?.id === staffId ? undefined : state.currentStaff,
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof ApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : 'Failed to delete staff member';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async refreshStaff(storeId) {
        return get().loadStaff(storeId);
      },

      clearError() {
        set({ error: undefined });
      },

      // Selectors
      getStaffById(id) {
        return get().staffs.find((staff) => staff.id === id);
      },
    }),
    {
      name: 'staff-store',
    },
  ),
);

// Computed selectors for convenience
export const useCurrentStaff = () => useStaffStore((state) => state.currentStaff);
export const useStaffList = () => useStaffStore((state) => state.staffs);
export const useStaffLoading = () => useStaffStore((state) => state.isLoading);
export const useStaffError = () => useStaffStore((state) => state.error);
export const useStaffPagination = () => useStaffStore((state) => state.pagination);

// Helper hooks for staff operations
export const useStaffActions = () => {
  const store = useStaffStore();
  return {
    setCurrentStaff: store.setCurrentStaff,
    loadStaff: store.loadStaff,
    createStaff: store.createStaff,
    updateStaff: store.updateStaff,
    deleteStaff: store.deleteStaff,
    refreshStaff: store.refreshStaff,
    clearError: store.clearError,
    setCurrentStoreId: store.setCurrentStoreId,

    // Legacy actions for compatibility
    async deactivateStaff(id: string) {
      const storeId = store.currentStoreId;
      if (!storeId) throw new Error('No store selected');
      const staff = store.getStaffById(id);
      if (!staff) throw new Error('Staff not found');
      return store.updateStaff(storeId, id, {
        ...staff,
        status: 'inactive',
      } as StaffFormData);
    },
    async activateStaff(id: string) {
      const storeId = store.currentStoreId;
      if (!storeId) throw new Error('No store selected');
      const staff = store.getStaffById(id);
      if (!staff) throw new Error('Staff not found');
      return store.updateStaff(storeId, id, {
        ...staff,
        status: 'active',
      } as StaffFormData);
    },
    setPagination() {
      // No-op for compatibility - API uses cursor-based pagination
    },
  };
};
