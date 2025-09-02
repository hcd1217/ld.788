import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  purchaseOrderService,
  type PurchaseOrder,
  type UpdatePOStatusRequest,
  type POFilterParams,
  type POStatus,
} from '@/services/sales';
import { getErrorMessage } from '@/utils/errorUtils';

type POState = {
  // PO data
  purchaseOrders: PurchaseOrder[];
  currentPO: PurchaseOrder | undefined;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | undefined;

  // Pagination state
  currentCursor: string | undefined;
  previousCursors: string[]; // Stack of previous cursors for page navigation
  hasMorePOs: boolean;
  hasPreviousPage: boolean;
  activeFilters: POFilterParams;
  currentPage: number;

  // Simplified request tracking - just track pending IDs
  pendingActions: Set<string>;

  // Internal helpers (not exposed to consumers)
  _markPending: (id: string) => void;
  _forceReload: (id: string) => Promise<void>;
  _rollback: (
    id: string,
    previousPO: PurchaseOrder | undefined,
    previousCurrentPO: PurchaseOrder | undefined,
    error?: string,
  ) => void;
  _removePending: (id: string) => void;
  _optimisticUpdate: (id: string, data: { status?: POStatus } & Partial<PurchaseOrder>) => void;
  _updatePOStatus: (
    id: string,
    status: POStatus,
    serviceMethod: (id: string, data?: UpdatePOStatusRequest) => Promise<void>,
    data?: UpdatePOStatusRequest,
    errorMessage?: string,
  ) => Promise<void>;

  // Actions
  setCurrentPO: (po: PurchaseOrder | undefined) => void;
  loadPOsWithFilter: (filters?: POFilterParams, reset?: boolean) => Promise<void>;
  loadMorePOs: () => Promise<void>;
  loadNextPage: () => Promise<void>;
  loadPreviousPage: () => Promise<void>;
  refreshPOs: () => Promise<void>;
  resetPagination: () => void;
  loadPO: (id: string) => Promise<void>;
  createPO: (
    po: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'clientId' | 'poNumber'>,
  ) => Promise<void>;
  updatePO: (id: string, data: Partial<PurchaseOrder>) => Promise<void>;
  confirmPO: (id: string) => Promise<void>;
  processPO: (id: string) => Promise<void>;
  markPOReady: (id: string, data?: UpdatePOStatusRequest) => Promise<void>;
  shipPO: (id: string, data?: UpdatePOStatusRequest) => Promise<void>;
  deliverPO: (id: string, data?: { deliveryNotes?: string }) => Promise<void>;
  cancelPO: (id: string, data?: { cancelReason?: string }) => Promise<void>;
  refundPO: (id: string, data?: { refundReason?: string }) => Promise<void>;
  clearError: () => void;

  // Selectors
  getPOById: (id: string) => PurchaseOrder | undefined;
};

export const usePOStore = create<POState>()(
  devtools(
    (set, get) => ({
      // Initial state
      purchaseOrders: [],
      currentPO: undefined,
      isLoading: false,
      isLoadingMore: false,
      error: undefined,
      currentCursor: undefined,
      previousCursors: [],
      hasMorePOs: true,
      hasPreviousPage: false,
      activeFilters: {},
      currentPage: 1,
      pendingActions: new Set(),

      // Actions
      setCurrentPO(po) {
        set({ currentPO: po, error: undefined });
      },

      async loadPOsWithFilter(filters?: POFilterParams, reset = true) {
        const state = get();

        // If resetting, clear existing data and cursor
        if (reset) {
          set({
            purchaseOrders: [],
            currentCursor: undefined,
            previousCursors: [],
            hasMorePOs: true,
            hasPreviousPage: false,
            currentPage: 1,
            activeFilters: filters || {},
            isLoading: true,
            error: undefined,
          });
        } else {
          set({ isLoadingMore: true, error: undefined });
        }

        try {
          const params = {
            ...filters,
            cursor: reset ? undefined : state.currentCursor,
            limit: 20, // Default page size
          };

          const response = await purchaseOrderService.getPOsWithFilter(params);

          set({
            isLoading: false,
            isLoadingMore: false,
            purchaseOrders: reset
              ? response.purchaseOrders
              : [...state.purchaseOrders, ...response.purchaseOrders],
            currentCursor: response.pagination.nextCursor,
            hasMorePOs: response.pagination.hasNext,
          });
        } catch (error) {
          set({
            isLoading: false,
            isLoadingMore: false,
            error: getErrorMessage(error, 'Failed to load purchase orders'),
          });
        }
      },

      async loadMorePOs() {
        const state = get();
        if (!state.hasMorePOs || state.isLoadingMore) {
          return;
        }

        await get().loadPOsWithFilter(state.activeFilters, false);
      },

      async loadNextPage() {
        const state = get();
        if (!state.hasMorePOs || state.isLoading) {
          return;
        }

        // Save current cursor to previous cursors stack before loading next page
        if (state.currentCursor) {
          set({
            previousCursors: [...state.previousCursors, state.currentCursor],
            hasPreviousPage: true,
          });
        }

        set({ isLoading: true, error: undefined });

        try {
          const params = {
            ...state.activeFilters,
            cursor: state.currentCursor,
            limit: 20,
          };

          const response = await purchaseOrderService.getPOsWithFilter(params);

          set({
            isLoading: false,
            purchaseOrders: response.purchaseOrders,
            currentCursor: response.pagination.nextCursor,
            hasMorePOs: response.pagination.hasNext,
            currentPage: state.currentPage + 1,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Failed to load next page'),
          });
        }
      },

      async loadPreviousPage() {
        const state = get();
        if (!state.hasPreviousPage || state.isLoading) {
          return;
        }

        set({ isLoading: true, error: undefined });

        const previousCursors = [...state.previousCursors];
        const previousCursor = previousCursors.pop(); // Get the last cursor

        try {
          const params = {
            ...state.activeFilters,
            cursor: previousCursor || undefined,
            limit: 20,
          };

          const response = await purchaseOrderService.getPOsWithFilter(params);

          set({
            isLoading: false,
            purchaseOrders: response.purchaseOrders,
            currentCursor: response.pagination.nextCursor,
            previousCursors,
            hasPreviousPage: previousCursors.length > 0,
            hasMorePOs: response.pagination.hasNext,
            currentPage: Math.max(1, state.currentPage - 1),
          });
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Failed to load previous page'),
          });
        }
      },

      async refreshPOs() {
        const state = get();
        await get().loadPOsWithFilter(state.activeFilters, true);
      },

      resetPagination() {
        set({
          currentCursor: undefined,
          previousCursors: [],
          hasMorePOs: true,
          hasPreviousPage: false,
          currentPage: 1,
          purchaseOrders: [],
        });
      },

      async loadPO(id: string) {
        set({ isLoading: true, error: undefined });
        try {
          const po = await purchaseOrderService.getPOById(id);
          if (po) {
            set({ currentPO: po });
            // Update in the list if exists
            const purchaseOrders = get().purchaseOrders;
            const index = purchaseOrders.findIndex((p) => p.id === id);
            if (index !== -1) {
              purchaseOrders[index] = po;
              set({ purchaseOrders: [...purchaseOrders] });
            }
          }
        } catch (error) {
          set({
            error: getErrorMessage(error, 'Failed to load purchase order'),
          });
        } finally {
          set({ isLoading: false });
        }
      },

      async createPO(poData) {
        set({ isLoading: true, error: undefined });
        try {
          // Convert the PurchaseOrder type to what the service expects
          const createData = {
            customerId: poData.customerId,
            items: poData.items.map((item) => ({
              productCode: item.productCode,
              description: item.description,
              color: item.color,
              quantity: item.quantity,
              category: item.category,
            })),
            metadata: {
              shippingAddress: {
                oneLineAddress: poData.address,
                googleMapsUrl: poData.googleMapsUrl,
              },
            },
            address: poData.address,
            googleMapsUrl: poData.googleMapsUrl,
            notes: poData.notes,
            orderDate:
              poData.orderDate instanceof Date
                ? poData.orderDate
                : poData.orderDate
                  ? new Date(poData.orderDate)
                  : undefined,
            deliveryDate:
              poData.deliveryDate instanceof Date
                ? poData.deliveryDate
                : poData.deliveryDate
                  ? new Date(poData.deliveryDate)
                  : undefined,
          };

          // Call service and get created PO (ignore response, we'll refresh)
          await purchaseOrderService.createPO(createData);

          // Force refresh to get the latest list with the new PO
          await get().refreshPOs();

          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Failed to create purchase order'),
          });
          throw error; // Re-throw for form handling
        }
      },

      async updatePO(id, data) {
        const state = get();

        // Check if action is already pending
        if (state.pendingActions.has(id)) {
          return;
        }

        // Mark as pending
        get()._markPending(id);

        // Save previous state for rollback
        const previousPO = state.purchaseOrders.find((po) => po.id === id);
        const previousCurrentPO = state.currentPO;

        // Apply optimistic update
        get()._optimisticUpdate(id, {
          ...data,
        });

        try {
          // Call service (ignore response - we'll force reload)
          await purchaseOrderService.updatePO(id, data);

          // Force reload to get latest data
          get()._forceReload(id);
        } catch (error) {
          // Rollback on failure
          get()._rollback(
            id,
            previousPO,
            previousCurrentPO,
            getErrorMessage(error, 'Failed to update purchase order'),
          );
          throw error;
        } finally {
          get()._removePending(id);
        }
      },

      async confirmPO(id) {
        return get()._updatePOStatus(
          id,
          'CONFIRMED',
          purchaseOrderService.confirmPO,
          undefined,
          'Failed to confirm purchase order',
        );
      },

      async processPO(id) {
        return get()._updatePOStatus(
          id,
          'PROCESSING',
          purchaseOrderService.processPO,
          undefined,
          'Failed to process purchase order',
        );
      },

      async markPOReady(id, data) {
        return get()._updatePOStatus(
          id,
          'READY_FOR_PICKUP',
          purchaseOrderService.markPOReady,
          data,
          'Failed to mark purchase order as ready for pickup',
        );
      },

      async shipPO(id, data) {
        return get()._updatePOStatus(
          id,
          'SHIPPED',
          purchaseOrderService.shipPO,
          data,
          'Failed to ship purchase order',
        );
      },

      async deliverPO(id, data) {
        return get()._updatePOStatus(
          id,
          'DELIVERED',
          purchaseOrderService.deliverPO,
          data,
          'Failed to deliver purchase order',
        );
      },

      async cancelPO(id, data) {
        return get()._updatePOStatus(
          id,
          'CANCELLED',
          purchaseOrderService.cancelPO,
          data,
          'Failed to cancel purchase order',
        );
      },

      async refundPO(id, data) {
        return get()._updatePOStatus(
          id,
          'REFUNDED',
          purchaseOrderService.refundPO,
          data,
          'Failed to refund purchase order',
        );
      },

      clearError() {
        set({ error: undefined });
      },

      // Selectors
      getPOById(id) {
        return get().purchaseOrders.find((po) => po.id === id);
      },

      // Generic status update helper - simplified and DRY
      async _updatePOStatus(
        id: string,
        status: PurchaseOrder['status'],
        serviceMethod: (id: string, data?: UpdatePOStatusRequest) => Promise<void>,
        data?: UpdatePOStatusRequest,
        errorMessage?: string,
      ) {
        const state = get();

        // Check if action is already pending
        if (state.pendingActions.has(id)) {
          return; // Simply return, no need to throw
        }

        // Mark as pending
        get()._markPending(id);

        // Save previous state for rollback
        const previousPO = state.purchaseOrders.find((po) => po.id === id);
        const previousCurrentPO = state.currentPO;

        // Apply optimistic update immediately
        get()._optimisticUpdate(id, { status });

        try {
          // Call service (ignore response - we'll force reload)
          await serviceMethod(id, data);

          // Force reload to get latest data from server
          await get()._forceReload(id);
        } catch (error) {
          // Rollback to previous state on failure
          get()._rollback(
            id,
            previousPO,
            previousCurrentPO,
            getErrorMessage(error, errorMessage || 'Failed to update purchase order status'),
          );
          throw error;
        } finally {
          get()._removePending(id);
        }
      },

      _optimisticUpdate(
        id: string,
        data: {
          status?: POStatus;
        } & Partial<PurchaseOrder>,
      ) {
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((po) =>
            po.id === id ? { ...po, ...data, status: data.status ?? po.status } : po,
          ),
          currentPO:
            state.currentPO?.id === id
              ? { ...state.currentPO, ...data, status: data.status ?? state.currentPO.status }
              : state.currentPO,
        }));
      },

      async _forceReload(id: string) {
        const updatedPO = await purchaseOrderService.getPOById(id);
        if (updatedPO) {
          set((state) => ({
            purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updatedPO : po)),
            currentPO: state.currentPO?.id === id ? updatedPO : state.currentPO,
          }));
        } else {
          set((state) => ({
            purchaseOrders: state.purchaseOrders.filter((po) => po.id !== id),
            currentPO: state.currentPO?.id === id ? undefined : state.currentPO,
          }));
        }
      },

      _rollback(
        id: string,
        previousPO: PurchaseOrder | undefined,
        previousCurrentPO: PurchaseOrder | undefined,
        error?: string,
      ) {
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((po) =>
            po.id === id && previousPO ? previousPO : po,
          ),
          currentPO: state.currentPO?.id === id ? previousCurrentPO : state.currentPO,
          error: error,
        }));
      },

      _markPending(id: string) {
        set((state) => {
          if (state.pendingActions.has(id)) {
            return {};
          }
          const pendingActions = new Set(state.pendingActions);
          pendingActions.add(id);
          return {
            pendingActions,
          };
        });
      },

      _removePending(id: string) {
        set((state) => {
          const pendingActions = new Set(state.pendingActions);
          pendingActions.delete(id);
          return {
            pendingActions,
          };
        });
      },
    }),
    {
      name: 'po-store',
    },
  ),
);

// Empty constants to prevent re-renders when data is undefined
const EMPTY_ARRAY: PurchaseOrder[] = [];

// Convenience hooks with stable references
export const usePurchaseOrderList = () =>
  usePOStore((state) => state.purchaseOrders) || EMPTY_ARRAY;
export const usePOLoading = () => usePOStore((state) => state.isLoading);
export const usePOError = () => usePOStore((state) => state.error);

// Export hook with stable reference by calling the store multiple times
// This pattern prevents infinite re-renders as each function reference is stable
export const usePOActions = () => {
  const loadPOsWithFilter = usePOStore((state) => state.loadPOsWithFilter);
  const loadMorePOs = usePOStore((state) => state.loadMorePOs);
  const loadNextPage = usePOStore((state) => state.loadNextPage);
  const loadPreviousPage = usePOStore((state) => state.loadPreviousPage);
  const resetPagination = usePOStore((state) => state.resetPagination);
  const loadPO = usePOStore((state) => state.loadPO);
  const createPO = usePOStore((state) => state.createPO);
  const updatePO = usePOStore((state) => state.updatePO);
  const confirmPO = usePOStore((state) => state.confirmPO);
  const processPO = usePOStore((state) => state.processPO);
  const markPOReady = usePOStore((state) => state.markPOReady);
  const shipPO = usePOStore((state) => state.shipPO);
  const deliverPO = usePOStore((state) => state.deliverPO);
  const cancelPO = usePOStore((state) => state.cancelPO);
  const refundPO = usePOStore((state) => state.refundPO);
  const clearError = usePOStore((state) => state.clearError);

  return {
    loadPOsWithFilter,
    loadMorePOs,
    loadNextPage,
    loadPreviousPage,
    resetPagination,
    loadPO,
    clearError,
    // Longer names for better readability in components
    createPurchaseOrder: createPO,
    updatePurchaseOrder: updatePO,
    confirmPurchaseOrder: confirmPO,
    processPurchaseOrder: processPO,
    markPurchaseOrderReady: markPOReady,
    shipPurchaseOrder: shipPO,
    deliverPurchaseOrder: deliverPO,
    cancelPurchaseOrder: cancelPO,
    refundPurchaseOrder: refundPO,
  };
};

// Current PO hook
export const useCurrentPO = () => usePOStore((state) => state.currentPO);

// Pagination state hooks
export const usePOPaginationState = () => {
  const currentCursor = usePOStore((state) => state.currentCursor);
  const hasMorePOs = usePOStore((state) => state.hasMorePOs);
  const hasPreviousPage = usePOStore((state) => state.hasPreviousPage);
  const isLoadingMore = usePOStore((state) => state.isLoadingMore);
  const activeFilters = usePOStore((state) => state.activeFilters);
  const currentPage = usePOStore((state) => state.currentPage);

  return {
    currentCursor,
    hasMorePOs,
    hasPreviousPage,
    isLoadingMore,
    activeFilters,
    currentPage,
  };
};
