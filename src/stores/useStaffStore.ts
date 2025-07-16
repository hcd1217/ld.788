import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {
  staffService,
  type Staff,
  type CreateStaffRequest,
  type UpdateStaffRequest,
  type StaffListRequest,
  type StaffListResponse,
} from '@/services/staff';

type StaffState = {
  // Staff data
  staff: Staff[];
  currentStaff: Staff | undefined;
  isLoading: boolean;
  error: string | undefined;

  // Pagination and filtering
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    storeId?: string;
    search: string;
    status: 'active' | 'inactive' | 'all';
    role: 'admin' | 'manager' | 'member' | 'all';
    sortBy: 'name' | 'email' | 'role' | 'createdAt';
    sortOrder: 'asc' | 'desc';
  };

  // Actions
  setCurrentStaff: (staff: Staff | undefined) => void;
  loadStaff: (params?: Partial<StaffListRequest>) => Promise<void>;
  createStaff: (data: CreateStaffRequest) => Promise<Staff>;
  updateStaff: (id: string, data: UpdateStaffRequest) => Promise<Staff>;
  deactivateStaff: (id: string) => Promise<void>;
  activateStaff: (id: string) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  hardDeleteStaff: (id: string) => Promise<void>;
  regenerateQRCode: (id: string) => Promise<string>;

  // Filter and pagination actions
  setFilters: (filters: Partial<StaffState['filters']>) => void;
  setPagination: (pagination: Partial<StaffState['pagination']>) => void;
  resetFilters: () => void;
  clearError: () => void;

  // Selectors
  getStaffById: (id: string) => Staff | undefined;
  getStaffByStore: (storeId: string) => Staff[];
  isEmailUnique: (email: string, excludeId?: string) => Promise<boolean>;
  isPhoneUnique: (phone: string, excludeId?: string) => Promise<boolean>;
};

const initialFilters: StaffState['filters'] = {
  search: '',
  status: 'all',
  role: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const initialPagination: StaffState['pagination'] = {
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 0,
};

export const useStaffStore = create<StaffState>()(
  devtools(
    (set, get) => ({
      // Initial state
      staff: [],
      currentStaff: undefined,
      isLoading: false,
      error: undefined,
      pagination: initialPagination,
      filters: initialFilters,

      // Actions
      setCurrentStaff(staff) {
        set({currentStaff: staff, error: undefined});
      },

      async loadStaff(params = {}) {
        set({isLoading: true, error: undefined});
        try {
          const currentFilters = get().filters;
          const currentPagination = get().pagination;

          const requestParams: StaffListRequest = {
            ...currentFilters,
            page: currentPagination.page,
            limit: currentPagination.limit,
            ...params, // Override with provided params
          };

          const response: StaffListResponse =
            await staffService.getAllStaff(requestParams);

          set({
            staff: response.staff,
            pagination: {
              page: response.page,
              limit: response.limit,
              total: response.total,
              totalPages: response.totalPages,
            },
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to load staff';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async createStaff(data) {
        set({isLoading: true, error: undefined});
        try {
          // Validate staff data first
          const validation = staffService.validateStaffData(data);
          if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
          }

          // Check email and phone uniqueness
          const [emailUnique, phoneUnique] = await Promise.all([
            staffService.isEmailUnique(data.email),
            staffService.isPhoneUnique(data.phoneNumber),
          ]);

          if (!emailUnique) {
            throw new Error('Email address is already in use');
          }

          if (!phoneUnique) {
            throw new Error('Phone number is already in use');
          }

          const newStaff = await staffService.createStaff(data);

          // Add to current staff list if it matches current filters
          const currentFilters = get().filters;
          const shouldIncludeInList =
            (!currentFilters.storeId ||
              currentFilters.storeId === newStaff.storeId) &&
            (currentFilters.status === 'all' ||
              currentFilters.status === newStaff.status) &&
            (currentFilters.role === 'all' ||
              currentFilters.role === newStaff.role);

          if (shouldIncludeInList) {
            set((state) => ({
              staff: [newStaff, ...state.staff],
              pagination: {
                ...state.pagination,
                total: state.pagination.total + 1,
                totalPages: Math.ceil(
                  (state.pagination.total + 1) / state.pagination.limit,
                ),
              },
              isLoading: false,
            }));
          } else {
            set({isLoading: false});
          }

          return newStaff;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to create staff member';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async updateStaff(id, data) {
        set({isLoading: true, error: undefined});
        try {
          // Validate staff data
          const validation = staffService.validateStaffData(data);
          if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
          }

          // Check email and phone uniqueness if they're being updated
          const promises: Array<Promise<boolean>> = [];
          if (data.email) {
            promises.push(staffService.isEmailUnique(data.email, id));
          }

          if (data.phoneNumber) {
            promises.push(staffService.isPhoneUnique(data.phoneNumber, id));
          }

          if (promises.length > 0) {
            const [emailUnique, phoneUnique] = await Promise.all(promises);
            if (data.email && !emailUnique) {
              throw new Error('Email address is already in use');
            }

            if (data.phoneNumber && !phoneUnique) {
              throw new Error('Phone number is already in use');
            }
          }

          const updatedStaff = await staffService.updateStaff(id, data);

          set((state) => ({
            staff: state.staff.map((staff) =>
              staff.id === id ? updatedStaff : staff,
            ),
            currentStaff:
              state.currentStaff?.id === id ? updatedStaff : state.currentStaff,
            isLoading: false,
          }));

          return updatedStaff;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to update staff member';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async deactivateStaff(id) {
        await get().updateStaff(id, {status: 'inactive'});
      },

      async activateStaff(id) {
        await get().updateStaff(id, {status: 'active'});
      },

      async deleteStaff(id) {
        set({isLoading: true, error: undefined});
        try {
          await staffService.deleteStaff(id);

          set((state) => ({
            staff: state.staff
              .map((staff) =>
                staff.id === id
                  ? {...staff, status: 'deleted' as const}
                  : staff,
              )
              .filter((staff) => staff.status !== 'deleted'), // Remove from list
            currentStaff:
              state.currentStaff?.id === id ? undefined : state.currentStaff,
            pagination: {
              ...state.pagination,
              total: Math.max(0, state.pagination.total - 1),
              totalPages: Math.ceil(
                Math.max(0, state.pagination.total - 1) /
                  state.pagination.limit,
              ),
            },
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to delete staff member';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async hardDeleteStaff(id) {
        set({isLoading: true, error: undefined});
        try {
          await staffService.hardDeleteStaff(id);

          set((state) => ({
            staff: state.staff.filter((staff) => staff.id !== id),
            currentStaff:
              state.currentStaff?.id === id ? undefined : state.currentStaff,
            pagination: {
              ...state.pagination,
              total: Math.max(0, state.pagination.total - 1),
              totalPages: Math.ceil(
                Math.max(0, state.pagination.total - 1) /
                  state.pagination.limit,
              ),
            },
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to permanently delete staff member';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async regenerateQRCode(id) {
        set({isLoading: true, error: undefined});
        try {
          const newQrCode = await staffService.regenerateQRCode(id);

          set((state) => ({
            staff: state.staff.map((staff) =>
              staff.id === id ? {...staff, clockInQrCode: newQrCode} : staff,
            ),
            currentStaff:
              state.currentStaff?.id === id
                ? {...state.currentStaff, clockInQrCode: newQrCode}
                : state.currentStaff,
            isLoading: false,
          }));

          return newQrCode;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to regenerate QR code';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Filter and pagination actions
      setFilters(newFilters) {
        set((state) => ({
          filters: {...state.filters, ...newFilters},
          pagination: {...state.pagination, page: 1}, // Reset to first page when filters change
        }));

        // Reload data with new filters
        get().loadStaff();
      },

      setPagination(newPagination) {
        set((state) => ({
          pagination: {...state.pagination, ...newPagination},
        }));

        // Reload data with new pagination
        get().loadStaff();
      },

      resetFilters() {
        set({
          filters: initialFilters,
          pagination: initialPagination,
        });

        // Reload data with reset filters
        get().loadStaff();
      },

      clearError() {
        set({error: undefined});
      },

      // Selectors
      getStaffById(id) {
        return get().staff.find((staff) => staff.id === id);
      },

      getStaffByStore(storeId) {
        return get().staff.filter((staff) => staff.storeId === storeId);
      },

      async isEmailUnique(email, excludeId) {
        try {
          return await staffService.isEmailUnique(email, excludeId);
        } catch (error) {
          console.error('Error checking email uniqueness:', error);
          return false;
        }
      },

      async isPhoneUnique(phone, excludeId) {
        try {
          return await staffService.isPhoneUnique(phone, excludeId);
        } catch (error) {
          console.error('Error checking phone uniqueness:', error);
          return false;
        }
      },
    }),
    {
      name: 'staff-store',
    },
  ),
);

// Computed selectors for convenience
export const useCurrentStaff = () =>
  useStaffStore((state) => state.currentStaff);
export const useStaffList = () => useStaffStore((state) => state.staff);
export const useStaffLoading = () => useStaffStore((state) => state.isLoading);
export const useStaffError = () => useStaffStore((state) => state.error);
export const useStaffPagination = () =>
  useStaffStore((state) => state.pagination);
export const useStaffFilters = () => useStaffStore((state) => state.filters);

// Helper hooks for staff operations
export const useStaffActions = () => {
  const store = useStaffStore();
  return {
    setCurrentStaff: store.setCurrentStaff,
    loadStaff: store.loadStaff,
    createStaff: store.createStaff,
    updateStaff: store.updateStaff,
    deactivateStaff: store.deactivateStaff,
    activateStaff: store.activateStaff,
    deleteStaff: store.deleteStaff,
    hardDeleteStaff: store.hardDeleteStaff,
    regenerateQRCode: store.regenerateQRCode,
    setFilters: store.setFilters,
    setPagination: store.setPagination,
    resetFilters: store.resetFilters,
    clearError: store.clearError,
    getStaffById: store.getStaffById,
    getStaffByStore: store.getStaffByStore,
    isEmailUnique: store.isEmailUnique,
    isPhoneUnique: store.isPhoneUnique,
  };
};
