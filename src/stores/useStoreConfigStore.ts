import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { storeApi, ApiError } from '@/lib/api';
import type {
  Store,
  CreateStoreRequest,
  UpdateStoreRequest,
  StoreOperatingHours,
  UpdateStoreOperatingHoursRequest,
} from '@/lib/api/schemas/store.schemas';
import { getErrorMessage } from '@/utils/errorUtils';

type StoreConfigState = {
  // Store data
  stores: Store[];
  currentStore: Store | undefined;
  operatingHoursCache: Record<string, StoreOperatingHours[]>;
  isLoading: boolean;
  error: string | undefined;

  // Actions
  setCurrentStore: (store: Store | undefined) => void;
  loadStores: () => Promise<void>;
  createStore: (data: CreateStoreRequest) => Promise<Store>;
  updateStore: (id: string, data: UpdateStoreRequest) => Promise<Store>;
  deleteStore: (id: string) => Promise<void>;
  refreshStores: () => Promise<void>;
  clearError: () => void;
  loadOperatingHours: (storeId: string) => Promise<StoreOperatingHours[]>;
  updateOperatingHours: (storeId: string, hours: UpdateStoreOperatingHoursRequest) => Promise<void>;

  // Selectors
  getStoreById: (id: string) => Store | undefined;
  isStoreCodeUnique: (code: string, excludeId?: string) => Promise<boolean>;
};

export const useStoreConfigStore = create<StoreConfigState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        stores: [],
        currentStore: undefined,
        operatingHoursCache: {},
        isLoading: false,
        error: undefined,

        // Actions
        setCurrentStore(store) {
          set({ currentStore: store, error: undefined });
        },

        async loadStores() {
          set({ isLoading: true, error: undefined });
          try {
            const response = await storeApi.getStores();

            set({
              stores: response.stores,
              isLoading: false,
              // Set first store as current if none selected
              currentStore: get().currentStore ?? response.stores[0],
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load stores';
            set({
              isLoading: false,
              error: errorMessage,
            });
            throw error;
          }
        },

        async createStore(data) {
          set({ isLoading: true, error: undefined });
          try {
            const newStore = await storeApi.createStore(data);

            // Optimistic update: add new store to the list immediately
            const currentStores = get().stores;
            const updatedStores = [newStore, ...currentStores];

            set({
              stores: updatedStores,
              currentStore: newStore,
              isLoading: false,
            });

            // Refresh in background to sync with server state
            get()
              .loadStores()
              .catch((error) => {
                console.error('Background refresh failed:', error);
              });

            return newStore;
          } catch (error) {
            let errorMessage = getErrorMessage(error, 'Failed to create store');
            // Handle specific API errors
            if (error instanceof ApiError && error.status === 409) {
              errorMessage = 'A store with this code already exists';
            }

            set({
              isLoading: false,
              error: errorMessage,
            });
            throw new Error(errorMessage);
          }
        },

        async updateStore(id, data) {
          set({ isLoading: true, error: undefined });
          try {
            const response = await storeApi.updateStore(id, data);
            const updatedStore = response.store;

            // Update the store in the list
            const currentStores = get().stores;
            const updatedStores = currentStores.map((s) => (s.id === id ? updatedStore : s));

            set({
              stores: updatedStores,
              currentStore: get().currentStore?.id === id ? updatedStore : get().currentStore,
              isLoading: false,
            });

            return updatedStore;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update store';
            set({
              isLoading: false,
              error: errorMessage,
            });
            throw new Error(errorMessage);
          }
        },

        async deleteStore(id) {
          // Optimistic update: remove store immediately
          const { stores, currentStore, operatingHoursCache } = get();
          const storeToDelete = stores.find((s) => s.id === id);

          if (!storeToDelete) {
            throw new Error('Store not found');
          }

          // Save current state for rollback
          const previousStores = stores;
          const previousCurrentStore = currentStore;
          const previousCache = operatingHoursCache;

          // Optimistically update state
          const updatedStores = stores.filter((s) => s.id !== id);
          const newCache = { ...operatingHoursCache };
          delete newCache[id];

          set({
            stores: updatedStores,
            currentStore: currentStore?.id === id ? updatedStores[0] : currentStore,
            operatingHoursCache: newCache,
            isLoading: true,
            error: undefined,
          });

          try {
            // Actually delete on server
            await storeApi.deleteStore(id);

            set({ isLoading: false });

            // Refresh in background to sync with server state
            get()
              .loadStores()
              .catch((error) => {
                console.error('Background refresh failed:', error);
              });
          } catch (error) {
            // Rollback on error
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete store';

            set({
              stores: previousStores,
              currentStore: previousCurrentStore,
              operatingHoursCache: previousCache,
              isLoading: false,
              error: errorMessage,
            });

            throw error;
          }
        },

        async refreshStores() {
          const currentStoreId = get().currentStore?.id;
          await get().loadStores();

          // Restore current store selection after refresh
          if (currentStoreId) {
            const refreshedCurrentStore = get().stores.find((store) => store.id === currentStoreId);
            if (refreshedCurrentStore) {
              set({ currentStore: refreshedCurrentStore });
            }
          }
        },

        clearError() {
          set({ error: undefined });
        },

        // Selectors
        getStoreById(id) {
          return get().stores.find((store) => store.id === id);
        },

        async isStoreCodeUnique(code, excludeId) {
          try {
            // First check local state for immediate feedback
            const { stores } = get();
            const existsLocally = stores.some(
              (store) => store.code === code && store.id !== excludeId,
            );

            if (existsLocally) {
              return false;
            }

            // Then check server to prevent race conditions
            try {
              const response = await storeApi.getStores();

              // If we find any stores with this code that aren't the excluded one
              const existsOnServer = response.stores.some(
                (store) => store.code === code && store.id !== excludeId,
              );

              return !existsOnServer;
            } catch (apiError) {
              // If API check fails, fall back to local check only
              console.error('API check failed, using local validation only:', apiError);
              return true; // Assume it's unique if we can't verify
            }
          } catch (error) {
            console.error('Error checking store code uniqueness:', error);
            return false;
          }
        },

        async loadOperatingHours(storeId) {
          const cached = get().operatingHoursCache[storeId];
          if (cached) {
            return cached;
          }

          try {
            const hours = await storeApi.getStoreOperatingHours(storeId);

            // Update cache
            const newCache = { ...get().operatingHoursCache };
            newCache[storeId] = hours;
            set({ operatingHoursCache: newCache });

            return hours;
          } catch (error) {
            console.error('Error loading operating hours:', error);
            return [];
          }
        },

        async updateOperatingHours(storeId, hours) {
          try {
            const updatedHours = await storeApi.updateStoreOperatingHours(storeId, hours);

            // Update cache
            const newCache = { ...get().operatingHoursCache };
            newCache[storeId] = updatedHours;
            set({ operatingHoursCache: newCache });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to update operating hours';
            throw new Error(errorMessage);
          }
        },
      }),
      {
        name: 'store-config-store',
        // Only persist specific fields
        partialize: (state) => ({
          stores: state.stores,
          currentStore: state.currentStore,
          operatingHoursCache: state.operatingHoursCache,
        }),
        // // Custom merge function to handle store updates
        // merge: (persistedState: Partial<StoreConfigState>, currentState) => ({
        //   ...currentState,
        //   ...persistedState,
        //   // Always start with clean loading/error state
        //   isLoading: false,
        //   error: undefined,
        // }),
      },
    ),
    {
      name: 'store-config-store',
    },
  ),
);

// Computed selectors for convenience
export const useCurrentStore = () => useStoreConfigStore((state) => state.currentStore);
export const useStores = () => useStoreConfigStore((state) => state.stores);
export const useStoreLoading = () => useStoreConfigStore((state) => state.isLoading);
export const useStoreError = () => useStoreConfigStore((state) => state.error);

// Helper hooks for store operations
export const useStoreActions = () => {
  const store = useStoreConfigStore();
  return {
    setCurrentStore: store.setCurrentStore,
    loadStores: store.loadStores,
    createStore: store.createStore,
    updateStore: store.updateStore,
    deleteStore: store.deleteStore,
    refreshStores: store.refreshStores,
    clearError: store.clearError,
    getStoreById: store.getStoreById,
    isStoreCodeUnique: store.isStoreCodeUnique,
    loadOperatingHours: store.loadOperatingHours,
    updateOperatingHours: store.updateOperatingHours,
  };
};
