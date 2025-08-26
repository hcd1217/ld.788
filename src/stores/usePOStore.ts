import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  purchaseOrderService,
  type PurchaseOrder,
  type Customer,
  type Product,
  type UpdatePOStatusRequest,
  type POFilterParams,
} from '@/services/sales';
import { getErrorMessage } from '@/utils/errorUtils';

type POState = {
  // PO data
  purchaseOrders: PurchaseOrder[];
  customers: Customer[];
  customerMap: Map<string, Customer>;
  products: Product[];
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

  // Request tracking for race condition prevention
  pendingRequests: Map<string, { requestId: string; timestamp: number; action: string }>;
  requestCounter: number;

  // Request tracking helpers
  _generateRequestId: () => string;
  _startRequest: (poId: string, action: string) => string;
  _finishRequest: (poId: string, requestId: string) => boolean;
  _isRequestPending: (poId: string) => boolean;
  _cleanupStaleRequests: () => void;

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
    po: Omit<
      PurchaseOrder,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'createdBy'
      | 'clientId'
      | 'poNumber'
      | 'processedBy'
      | 'shippedBy'
      | 'deliveredBy'
      | 'cancelledBy'
      | 'cancelReason'
      | 'refundedBy'
      | 'refundReason'
      | 'completedDate'
    >,
  ) => Promise<void>;
  updatePO: (id: string, data: Partial<PurchaseOrder>) => Promise<void>;
  confirmPO: (id: string) => Promise<void>;
  processPO: (id: string) => Promise<void>;
  shipPO: (id: string, data?: UpdatePOStatusRequest) => Promise<void>;
  deliverPO: (id: string, data?: { deliveryNotes?: string }) => Promise<void>;
  cancelPO: (id: string, data?: { cancelReason?: string }) => Promise<void>;
  refundPO: (id: string, data?: { refundReason?: string }) => Promise<void>;
  clearError: () => void;

  // Selectors
  getPOById: (id: string) => PurchaseOrder | undefined;
  getPOsByStatus: (status: string) => PurchaseOrder[];
  getPOsByCustomer: (customerId: string) => PurchaseOrder[];
};

export const usePOStore = create<POState>()(
  devtools(
    (set, get) => ({
      // Initial state
      purchaseOrders: [],
      customers: [],
      customerMap: new Map(),
      products: [],
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
      pendingRequests: new Map(),
      requestCounter: 0,

      // Request tracking helpers
      _generateRequestId() {
        const state = get();
        const requestId = `req_${state.requestCounter}_${Date.now()}`;
        set({ requestCounter: state.requestCounter + 1 });
        return requestId;
      },

      _startRequest(poId: string, action: string) {
        const state = get();
        const requestId = get()._generateRequestId();
        const newPendingRequests = new Map(state.pendingRequests);
        newPendingRequests.set(poId, {
          requestId,
          timestamp: Date.now(),
          action,
        });
        set({ pendingRequests: newPendingRequests });
        return requestId;
      },

      _finishRequest(poId: string, requestId: string) {
        const state = get();
        const pendingRequest = state.pendingRequests.get(poId);
        if (pendingRequest?.requestId === requestId) {
          const newPendingRequests = new Map(state.pendingRequests);
          newPendingRequests.delete(poId);
          set({ pendingRequests: newPendingRequests });
          return true;
        }
        return false;
      },

      _isRequestPending(poId: string) {
        // Clean up stale requests first
        get()._cleanupStaleRequests();
        const state = get();
        return state.pendingRequests.has(poId);
      },

      _cleanupStaleRequests() {
        const state = get();
        const now = Date.now();
        const TIMEOUT_MS = 30000; // 30 second timeout
        const newPendingRequests = new Map(state.pendingRequests);
        let hasChanges = false;

        for (const [poId, request] of newPendingRequests) {
          if (now - request.timestamp > TIMEOUT_MS) {
            newPendingRequests.delete(poId);
            hasChanges = true;
          }
        }

        if (hasChanges) {
          set({ pendingRequests: newPendingRequests });
        }
      },
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
          await purchaseOrderService.createPO(createData);
          await get().refreshPOs();
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Failed to create purchase order'),
          });
          throw error; // Re-throw for form handling
        }
      },

      async updatePO(id, data) {
        set({ isLoading: true, error: undefined });
        try {
          await purchaseOrderService.updatePO(id, data);
          await get().refreshPOs();
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Failed to update purchase order'),
          });
          throw error;
        }
      },

      async confirmPO(id) {
        // Check if request is already pending
        if (get()._isRequestPending(id)) {
          throw new Error('Confirm request already pending for this PO');
        }

        // Start request tracking
        const requestId = get()._startRequest(id, 'confirm');

        // Optimistically update the status
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((po) =>
            po.id === id ? { ...po, status: 'CONFIRMED' as const } : po,
          ),
          currentPO:
            state.currentPO?.id === id
              ? { ...state.currentPO, status: 'CONFIRMED' as const }
              : state.currentPO,
          error: undefined,
        }));

        try {
          await purchaseOrderService.confirmPO(id);

          // Only update if this request is still valid (prevent race conditions)
          if (get()._finishRequest(id, requestId)) {
            await get().refreshPOs();
          }
        } catch (error) {
          // Finish request tracking even on error
          get()._finishRequest(id, requestId);

          // Rollback on error
          await get().refreshPOs();
          set({
            error: getErrorMessage(error, 'Failed to confirm purchase order'),
          });
          throw error;
        }
      },

      async processPO(id) {
        // Check if request is already pending
        if (get()._isRequestPending(id)) {
          throw new Error('Process request already pending for this PO');
        }

        // Start request tracking
        const requestId = get()._startRequest(id, 'process');

        // Optimistically update the status
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((po) =>
            po.id === id ? { ...po, status: 'PROCESSING' as const } : po,
          ),
          currentPO:
            state.currentPO?.id === id
              ? { ...state.currentPO, status: 'PROCESSING' as const }
              : state.currentPO,
          error: undefined,
        }));

        try {
          await purchaseOrderService.processPO(id);

          // Only update if this request is still valid (prevent race conditions)
          if (get()._finishRequest(id, requestId)) {
            await get().refreshPOs();
          }
        } catch (error) {
          // Finish request tracking even on error
          get()._finishRequest(id, requestId);

          // Rollback on error
          await get().refreshPOs();
          set({
            error: getErrorMessage(error, 'Failed to process purchase order'),
          });
          throw error;
        }
      },

      async shipPO(id, data) {
        // Check if request is already pending
        if (get()._isRequestPending(id)) {
          throw new Error('Ship request already pending for this PO');
        }

        // Start request tracking
        const requestId = get()._startRequest(id, 'ship');

        // Optimistically update the status
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((po) =>
            po.id === id ? { ...po, status: 'SHIPPED' as const } : po,
          ),
          currentPO:
            state.currentPO?.id === id
              ? { ...state.currentPO, status: 'SHIPPED' as const }
              : state.currentPO,
          error: undefined,
        }));

        try {
          await purchaseOrderService.shipPO(id, data);

          // Only update if this request is still valid (prevent race conditions)
          if (get()._finishRequest(id, requestId)) {
            await get().refreshPOs();
          }
        } catch (error) {
          // Finish request tracking even on error
          get()._finishRequest(id, requestId);

          // Rollback on error
          await get().refreshPOs();
          set({
            error: getErrorMessage(error, 'Failed to ship purchase order'),
          });
          throw error;
        }
      },

      async deliverPO(id, data) {
        // Check if request is already pending
        if (get()._isRequestPending(id)) {
          throw new Error('Deliver request already pending for this PO');
        }

        // Start request tracking
        const requestId = get()._startRequest(id, 'deliver');

        // Optimistically update the status
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((po) =>
            po.id === id ? { ...po, status: 'DELIVERED' as const } : po,
          ),
          currentPO:
            state.currentPO?.id === id
              ? { ...state.currentPO, status: 'DELIVERED' as const }
              : state.currentPO,
          error: undefined,
        }));

        try {
          await purchaseOrderService.deliverPO(id, data);

          // Only update if this request is still valid (prevent race conditions)
          if (get()._finishRequest(id, requestId)) {
            await get().refreshPOs();
          }
        } catch (error) {
          // Finish request tracking even on error
          get()._finishRequest(id, requestId);

          // Rollback on error
          await get().refreshPOs();
          set({
            error: getErrorMessage(error, 'Failed to deliver purchase order'),
          });
          throw error;
        }
      },

      async cancelPO(id, data) {
        // Check if request is already pending
        if (get()._isRequestPending(id)) {
          throw new Error('Cancel request already pending for this PO');
        }

        // Start request tracking
        const requestId = get()._startRequest(id, 'cancel');

        // Optimistically update the status
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((po) =>
            po.id === id ? { ...po, status: 'CANCELLED' as const } : po,
          ),
          currentPO:
            state.currentPO?.id === id
              ? { ...state.currentPO, status: 'CANCELLED' as const }
              : state.currentPO,
          error: undefined,
        }));

        try {
          await purchaseOrderService.cancelPO(id, data);

          // Only update if this request is still valid (prevent race conditions)
          if (get()._finishRequest(id, requestId)) {
            await get().refreshPOs();
          }
        } catch (error) {
          // Finish request tracking even on error
          get()._finishRequest(id, requestId);

          // Rollback on error
          await get().refreshPOs();
          set({
            error: getErrorMessage(error, 'Failed to cancel purchase order'),
          });
          throw error;
        }
      },

      async refundPO(id, data) {
        // Check if request is already pending
        if (get()._isRequestPending(id)) {
          throw new Error('Refund request already pending for this PO');
        }

        // Start request tracking
        const requestId = get()._startRequest(id, 'refund');

        // Optimistically update the status
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((po) =>
            po.id === id ? { ...po, status: 'REFUNDED' as const } : po,
          ),
          currentPO:
            state.currentPO?.id === id
              ? { ...state.currentPO, status: 'REFUNDED' as const }
              : state.currentPO,
          error: undefined,
        }));

        try {
          await purchaseOrderService.refundPO(id, data);

          // Only update if this request is still valid (prevent race conditions)
          if (get()._finishRequest(id, requestId)) {
            await get().refreshPOs();
          }
        } catch (error) {
          // Finish request tracking even on error
          get()._finishRequest(id, requestId);

          // Rollback on error
          await get().refreshPOs();
          set({
            error: getErrorMessage(error, 'Failed to refund purchase order'),
          });
          throw error;
        }
      },

      clearError() {
        set({ error: undefined });
      },

      // Selectors
      getPOById(id) {
        return get().purchaseOrders.find((po) => po.id === id);
      },

      getPOsByStatus(status) {
        if (status === 'all') {
          return get().purchaseOrders;
        }
        return get().purchaseOrders.filter((po) => po.status === status);
      },

      getPOsByCustomer(customerId) {
        return get().purchaseOrders.filter((po) => po.customerId === customerId);
      },
    }),
    {
      name: 'po-store',
    },
  ),
);

// Empty constants to prevent re-renders when data is undefined
const EMPTY_ARRAY: PurchaseOrder[] = [];
const EMPTY_CUSTOMERS: Customer[] = [];
const EMPTY_PRODUCTS: Product[] = [];

// Convenience hooks with stable references
export const usePurchaseOrderList = () =>
  usePOStore((state) => state.purchaseOrders) || EMPTY_ARRAY;
export const useCustomerList = () => usePOStore((state) => state.customers) || EMPTY_CUSTOMERS;
export const useProductList = () => usePOStore((state) => state.products) || EMPTY_PRODUCTS;
export const usePOLoading = () => usePOStore((state) => state.isLoading);
export const usePOError = () => usePOStore((state) => state.error);
// Export hook with stable reference by calling the store multiple times
// This pattern prevents infinite re-renders as each function reference is stable
export const usePOActions = () => {
  const loadPOsWithFilter = usePOStore((state) => state.loadPOsWithFilter);
  const loadMorePOs = usePOStore((state) => state.loadMorePOs);
  const loadNextPage = usePOStore((state) => state.loadNextPage);
  const loadPreviousPage = usePOStore((state) => state.loadPreviousPage);
  const refreshPOs = usePOStore((state) => state.refreshPOs);
  const resetPagination = usePOStore((state) => state.resetPagination);
  const loadPO = usePOStore((state) => state.loadPO);
  const createPO = usePOStore((state) => state.createPO);
  const updatePO = usePOStore((state) => state.updatePO);
  const confirmPO = usePOStore((state) => state.confirmPO);
  const processPO = usePOStore((state) => state.processPO);
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
    refreshPOs,
    resetPagination,
    loadPO,
    createPO,
    updatePO,
    confirmPO,
    processPO,
    shipPO,
    deliverPO,
    cancelPO,
    refundPO,
    clearError,
    // Aliases for consistency with page usage
    refreshPurchaseOrders: refreshPOs,
    createPurchaseOrder: createPO,
    updatePurchaseOrder: updatePO,
    confirmPurchaseOrder: confirmPO,
    processPurchaseOrder: processPO,
    shipPurchaseOrder: shipPO,
    deliverPurchaseOrder: deliverPO,
    cancelPurchaseOrder: cancelPO,
    refundPurchaseOrder: refundPO,
  };
};

// Selector hooks for getting POs by criteria
export const usePOById = (id: string) => usePOStore((state) => state.getPOById(id));
export const usePOsByStatus = (status: string) =>
  usePOStore((state) => state.getPOsByStatus(status)) || EMPTY_ARRAY;
export const usePOsByCustomer = (customerId: string) =>
  usePOStore((state) => state.getPOsByCustomer(customerId)) || EMPTY_ARRAY;
export const useCurrentPO = () => usePOStore((state) => state.currentPO);
export const useSetCurrentPO = () => usePOStore((state) => state.setCurrentPO);

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
