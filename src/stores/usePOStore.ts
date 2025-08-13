import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  purchaseOrderService,
  customerService,
  productService,
  type PurchaseOrder,
  type Customer,
  type Product,
} from '@/services/sales';
import { getErrorMessage } from '@/utils/errorUtils';
import { useMemo } from 'react';

type POState = {
  // PO data
  purchaseOrders: PurchaseOrder[];
  customers: Customer[];
  customerMap: Map<string, Customer>;
  products: Product[];
  currentPO: PurchaseOrder | undefined;
  isLoading: boolean;
  error: string | undefined;

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
  shipPO: (id: string) => Promise<void>;
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
          // Update with server response
          set((state) => ({
            purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updatedPO : po)),
            currentPO: state.currentPO?.id === id ? updatedPO : state.currentPO,
          }));
        } catch (error) {
          // Rollback on error
          await get().refreshPOs();
          set({
            error: getErrorMessage(error, 'Failed to confirm purchase order'),
          });
          throw error;
        }
      },

      async processPO(id) {
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
          // Update with server response
          set((state) => ({
            purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updatedPO : po)),
            currentPO: state.currentPO?.id === id ? updatedPO : state.currentPO,
          }));
        } catch (error) {
          // Rollback on error
          await get().refreshPOs();
          set({
            error: getErrorMessage(error, 'Failed to process purchase order'),
          });
          throw error;
        }
      },

      async shipPO(id) {
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
          const updatedPO = await purchaseOrderService.shipPO(id);
          // Update with server response
          set((state) => ({
            purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updatedPO : po)),
            currentPO: state.currentPO?.id === id ? updatedPO : state.currentPO,
          }));
        } catch (error) {
          // Rollback on error
          await get().refreshPOs();
          set({
            error: getErrorMessage(error, 'Failed to ship purchase order'),
          });
          throw error;
        }
      },

      async deliverPO(id) {
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
          // Update with server response
          set((state) => ({
            purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updatedPO : po)),
            currentPO: state.currentPO?.id === id ? updatedPO : state.currentPO,
          }));
        } catch (error) {
          // Rollback on error
          await get().refreshPOs();
          set({
            error: getErrorMessage(error, 'Failed to deliver purchase order'),
          });
          throw error;
        }
      },

      async cancelPO(id, data) {
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
          // Update with server response
          set((state) => ({
            purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updatedPO : po)),
            currentPO: state.currentPO?.id === id ? updatedPO : state.currentPO,
          }));
        } catch (error) {
          // Rollback on error
          await get().refreshPOs();
          set({
            error: getErrorMessage(error, 'Failed to cancel purchase order'),
          });
          throw error;
        }
      },

      async refundPO(id, data) {
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
          // Update with server response
          set((state) => ({
            purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updatedPO : po)),
            currentPO: state.currentPO?.id === id ? updatedPO : state.currentPO,
          }));
        } catch (error) {
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

// Convenience hooks
export const usePurchaseOrderList = () => usePOStore((state) => state.purchaseOrders);
export const useCustomerList = () => usePOStore((state) => state.customers);
export const useProductList = () => usePOStore((state) => state.products);
export const usePOLoading = () => usePOStore((state) => state.isLoading);
export const usePOError = () => usePOStore((state) => state.error);
// Export individual action hooks to avoid object creation
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

  return useMemo(
    () => ({
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
    }),
    [
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
    ],
  );
};
