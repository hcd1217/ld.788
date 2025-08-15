import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  purchaseOrderService,
  customerService,
  productService,
  type PurchaseOrder,
  type Customer,
  type Product,
  type UpdatePOStatusRequest,
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
  error: string | undefined;
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
  loadPOs: (force?: boolean) => Promise<void>;
  loadCustomers: () => Promise<void>;
  loadProducts: () => Promise<void>;
  refreshPOs: () => Promise<void>;
  loadPO: (id: string) => Promise<void>;
  createPO: (po: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePO: (id: string, data: Partial<PurchaseOrder>) => Promise<void>;
  confirmPO: (id: string) => Promise<void>;
  processPO: (id: string) => Promise<void>;
  shipPO: (id: string, data?: UpdatePOStatusRequest) => Promise<void>;
  deliverPO: (id: string) => Promise<void>;
  cancelPO: (id: string, data?: { cancelReason?: string }) => Promise<void>;
  refundPO: (id: string, data?: { refundReason?: string; refundAmount?: number }) => Promise<void>;
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
      error: undefined,
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

      async loadCustomers() {
        set({ error: undefined });
        try {
          const customers = await customerService.getAllCustomers();
          set({
            customers,
            customerMap: new Map(customers.map((customer: Customer) => [customer.id, customer])),
          });
        } catch (error) {
          set({
            error: getErrorMessage(error, 'Failed to load customers'),
          });
        }
      },

      async loadProducts() {
        set({ error: undefined });
        try {
          const products = await productService.getActiveProducts();
          set({ products });
        } catch (error) {
          set({
            error: getErrorMessage(error, 'Failed to load products'),
          });
        }
      },

      async loadPOs(force = false) {
        if (get().purchaseOrders.length > 0 && !force) {
          return;
        }

        set({ isLoading: true, error: undefined });
        try {
          // Load POs, customers and products in parallel
          const [purchaseOrders, customers, products] = await Promise.all([
            purchaseOrderService.getAllPOs(),
            customerService.getAllCustomers(),
            productService.getActiveProducts(),
          ]);
          set({
            isLoading: false,
            purchaseOrders,
            customers,
            customerMap: new Map(customers.map((customer: Customer) => [customer.id, customer])),
            products,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Failed to load purchase orders'),
          });
        }
      },

      async refreshPOs() {
        await get().loadPOs(true);
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
          const newPO = await purchaseOrderService.createPO(poData);
          set((state) => ({
            isLoading: false,
            purchaseOrders: [newPO, ...state.purchaseOrders],
          }));
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
          const updatedPO = await purchaseOrderService.updatePO(id, data);
          set((state) => ({
            isLoading: false,
            purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updatedPO : po)),
            currentPO: state.currentPO?.id === id ? updatedPO : state.currentPO,
          }));
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
          const updatedPO = await purchaseOrderService.confirmPO(id);

          // Only update if this request is still valid (prevent race conditions)
          if (get()._finishRequest(id, requestId)) {
            set((state) => ({
              purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updatedPO : po)),
              currentPO: state.currentPO?.id === id ? updatedPO : state.currentPO,
            }));
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
          const updatedPO = await purchaseOrderService.processPO(id);

          // Only update if this request is still valid (prevent race conditions)
          if (get()._finishRequest(id, requestId)) {
            set((state) => ({
              purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updatedPO : po)),
              currentPO: state.currentPO?.id === id ? updatedPO : state.currentPO,
            }));
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
          const updatedPO = await purchaseOrderService.shipPO(id, data);

          // Only update if this request is still valid (prevent race conditions)
          if (get()._finishRequest(id, requestId)) {
            set((state) => ({
              purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updatedPO : po)),
              currentPO: state.currentPO?.id === id ? updatedPO : state.currentPO,
            }));
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

      async deliverPO(id) {
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
          const updatedPO = await purchaseOrderService.deliverPO(id);

          // Only update if this request is still valid (prevent race conditions)
          if (get()._finishRequest(id, requestId)) {
            set((state) => ({
              purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updatedPO : po)),
              currentPO: state.currentPO?.id === id ? updatedPO : state.currentPO,
            }));
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
          const updatedPO = await purchaseOrderService.cancelPO(id, data);

          // Only update if this request is still valid (prevent race conditions)
          if (get()._finishRequest(id, requestId)) {
            set((state) => ({
              purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updatedPO : po)),
              currentPO: state.currentPO?.id === id ? updatedPO : state.currentPO,
            }));
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
          const updatedPO = await purchaseOrderService.refundPO(id, data);

          // Only update if this request is still valid (prevent race conditions)
          if (get()._finishRequest(id, requestId)) {
            set((state) => ({
              purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updatedPO : po)),
              currentPO: state.currentPO?.id === id ? updatedPO : state.currentPO,
            }));
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
  const loadPOs = usePOStore((state) => state.loadPOs);
  const loadCustomers = usePOStore((state) => state.loadCustomers);
  const loadProducts = usePOStore((state) => state.loadProducts);
  const refreshPOs = usePOStore((state) => state.refreshPOs);
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
    loadPOs,
    loadCustomers,
    loadProducts,
    refreshPOs,
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
