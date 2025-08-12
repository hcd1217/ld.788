import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type POUIState = {
  // UI-specific state
  selectedPOId: string | undefined;
  isTableLoading: boolean;
  isActionLoading: boolean;
  searchQuery: string;
  viewMode: 'grid' | 'table';

  // Actions
  setSelectedPOId: (id: string | undefined) => void;
  setTableLoading: (loading: boolean) => void;
  setActionLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'grid' | 'table') => void;

  // UI helpers
  clearUIState: () => void;
};

export const usePOUIStore = create<POUIState>()(
  devtools(
    (set) => ({
      // Initial state
      selectedPOId: undefined,
      isTableLoading: false,
      isActionLoading: false,
      searchQuery: '',
      viewMode: 'table',

      // Actions
      setSelectedPOId(id) {
        set({ selectedPOId: id });
      },

      setTableLoading(loading) {
        set({ isTableLoading: loading });
      },

      setActionLoading(loading) {
        set({ isActionLoading: loading });
      },

      setSearchQuery(query) {
        set({ searchQuery: query });
      },

      setViewMode(mode) {
        set({ viewMode: mode });
      },

      clearUIState() {
        set({
          selectedPOId: undefined,
          isTableLoading: false,
          isActionLoading: false,
          searchQuery: '',
        });
      },
    }),
    {
      name: 'po-ui-store',
    },
  ),
);

// Convenience hooks for UI state
export const usePOSelectedId = () => usePOUIStore((state) => state.selectedPOId);
export const usePOTableLoading = () => usePOUIStore((state) => state.isTableLoading);
export const usePOActionLoading = () => usePOUIStore((state) => state.isActionLoading);
export const usePOSearchQuery = () => usePOUIStore((state) => state.searchQuery);
export const usePOViewMode = () => usePOUIStore((state) => state.viewMode);
