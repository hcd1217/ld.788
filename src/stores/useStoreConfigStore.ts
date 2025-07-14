import {create} from 'zustand';
import {devtools, persist} from 'zustand/middleware';
import {
  storeService,
  type Store,
  type CreateStoreRequest,
} from '@/services/store';

type StoreConfigState = {
  // Store data
  stores: Store[];
  currentStore: Store | undefined;
  isLoading: boolean;
  error: string | undefined;

  // Actions
  setCurrentStore: (store: Store | undefined) => void;
  loadStores: () => Promise<void>;
  createStore: (data: CreateStoreRequest) => Promise<Store>;
  deleteStore: (id: string) => Promise<void>;
  refreshStores: () => Promise<void>;
  clearError: () => void;

  // Selectors
  getStoreById: (id: string) => Store | undefined;
  isStoreNameUnique: (name: string, excludeId?: string) => Promise<boolean>;
};

export const useStoreConfigStore = create<StoreConfigState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        stores: [],
        currentStore: undefined,
        isLoading: false,
        error: undefined,

        // Actions
        setCurrentStore(store) {
          set({currentStore: store, error: undefined});
        },

        async loadStores() {
          set({isLoading: true, error: undefined});
          try {
            const stores = await storeService.getAllStores();
            set({
              stores,
              isLoading: false,
              // Set first store as current if none selected
              currentStore: get().currentStore ?? stores[0],
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to load stores';
            set({
              isLoading: false,
              error: errorMessage,
            });
            throw error;
          }
        },

        async createStore(data) {
          set({isLoading: true, error: undefined});
          try {
            // Validate store data first
            const validation = storeService.validateStoreData(data);
            if (!validation.isValid) {
              throw new Error(validation.errors.join(', '));
            }

            // Check name uniqueness
            const isUnique = await storeService.isStoreNameUnique(data.name);
            if (!isUnique) {
              throw new Error('A store with this name already exists');
            }

            const newStore = await storeService.createStore(data);
            const updatedStores = [...get().stores, newStore];

            set({
              stores: updatedStores,
              currentStore: newStore, // Set new store as current
              isLoading: false,
            });

            return newStore;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to create store';
            set({
              isLoading: false,
              error: errorMessage,
            });
            throw error;
          }
        },

        async deleteStore(id) {
          set({isLoading: true, error: undefined});
          try {
            await storeService.deleteStore(id);
            const updatedStores = get().stores.filter(
              (store) => store.id !== id,
            );
            const {currentStore} = get();

            set({
              stores: updatedStores,
              // Clear current store if it was deleted
              currentStore:
                currentStore?.id === id ? updatedStores[0] : currentStore,
              isLoading: false,
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to delete store';
            set({
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
            const refreshedCurrentStore = get().stores.find(
              (store) => store.id === currentStoreId,
            );
            if (refreshedCurrentStore) {
              set({currentStore: refreshedCurrentStore});
            }
          }
        },

        clearError() {
          set({error: undefined});
        },

        // Selectors
        getStoreById(id) {
          return get().stores.find((store) => store.id === id);
        },

        async isStoreNameUnique(name, excludeId) {
          try {
            return await storeService.isStoreNameUnique(name, excludeId);
          } catch (error) {
            console.error('Error checking store name uniqueness:', error);
            return false;
          }
        },
      }),
      {
        name: 'store-config-store',
        // Only persist specific fields
        partialize: (state) => ({
          stores: state.stores,
          currentStore: state.currentStore,
        }),
        // Custom merge function to handle store updates
        merge: (persistedState, currentState) => ({
          ...currentState,
          ...persistedState,
          // Always start with clean loading/error state
          isLoading: false,
          error: undefined,
        }),
      },
    ),
    {
      name: 'store-config-store',
    },
  ),
);

// Computed selectors for convenience
export const useCurrentStore = () =>
  useStoreConfigStore((state) => state.currentStore);
export const useStores = () => useStoreConfigStore((state) => state.stores);
export const useStoreLoading = () =>
  useStoreConfigStore((state) => state.isLoading);
export const useStoreError = () => useStoreConfigStore((state) => state.error);

// Helper hooks for store operations
export const useStoreActions = () => {
  const store = useStoreConfigStore();
  return {
    setCurrentStore: store.setCurrentStore,
    loadStores: store.loadStores,
    createStore: store.createStore,
    deleteStore: store.deleteStore,
    refreshStores: store.refreshStores,
    clearError: store.clearError,
    getStoreById: store.getStoreById,
    isStoreNameUnique: store.isStoreNameUnique,
  };
};
