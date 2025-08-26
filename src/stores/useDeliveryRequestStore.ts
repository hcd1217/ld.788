import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  deliveryRequestService,
  type DeliveryRequest,
  type DeliveryRequestDetail,
  type DeliveryRequestFilterParams,
  type CreateDeliveryRequest,
  type UpdateDeliveryRequest,
  type DeliveryStatus,
} from '@/services/sales/deliveryRequest';
import { getErrorMessage } from '@/utils/errorUtils';

type DeliveryRequestState = {
  // Delivery Request data
  deliveryRequests: DeliveryRequest[];
  currentDeliveryRequest: DeliveryRequestDetail | undefined;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | undefined;

  // Pagination state
  currentCursor: string | undefined;
  previousCursors: string[]; // Stack of previous cursors for page navigation
  hasMoreDeliveryRequests: boolean;
  hasPreviousPage: boolean;
  activeFilters: DeliveryRequestFilterParams;
  currentPage: number;

  // Request tracking for race condition prevention
  pendingRequests: Map<string, { requestId: string; timestamp: number; action: string }>;
  requestCounter: number;

  // Request tracking helpers
  _generateRequestId: () => string;
  _startRequest: (drId: string, action: string) => string;
  _finishRequest: (drId: string, requestId: string) => boolean;
  _isRequestPending: (drId: string) => boolean;
  _cleanupStaleRequests: () => void;

  // Actions
  setCurrentDeliveryRequest: (dr: DeliveryRequestDetail | undefined) => void;
  loadDeliveryRequestsWithFilter: (
    filters?: DeliveryRequestFilterParams,
    reset?: boolean,
  ) => Promise<void>;
  loadMoreDeliveryRequests: () => Promise<void>;
  loadNextPage: () => Promise<void>;
  loadPreviousPage: () => Promise<void>;
  refreshDeliveryRequests: () => Promise<void>;
  resetPagination: () => void;
  loadDeliveryRequest: (id: string) => Promise<void>;
  createDeliveryRequest: (data: CreateDeliveryRequest) => Promise<DeliveryRequest>;
  updateDeliveryRequest: (id: string, data: UpdateDeliveryRequest) => Promise<void>;
  updateDeliveryStatus: (id: string, status: DeliveryStatus, notes?: string) => Promise<void>;
  uploadPhotos: (id: string, photoUrls: string[]) => Promise<void>;
  completeDelivery: (id: string, data?: { photoUrls?: string[]; notes?: string }) => Promise<void>;
  deleteDeliveryRequest: (id: string) => Promise<void>;
  clearError: () => void;

  // Selectors
  getDeliveryRequestById: (id: string) => DeliveryRequest | undefined;
  getDeliveryRequestsByStatus: (status: DeliveryStatus) => DeliveryRequest[];
  getDeliveryRequestsByPO: (purchaseOrderId: string) => DeliveryRequest[];
  getDeliveryRequestsByAssignee: (assignedTo: string) => DeliveryRequest[];
};

export const useDeliveryRequestStore = create<DeliveryRequestState>()(
  devtools(
    (set, get) => ({
      // Initial state
      deliveryRequests: [],
      currentDeliveryRequest: undefined,
      isLoading: false,
      isLoadingMore: false,
      error: undefined,
      currentCursor: undefined,
      previousCursors: [],
      hasMoreDeliveryRequests: true,
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

      _startRequest(drId: string, action: string) {
        const state = get();
        const requestId = get()._generateRequestId();
        const newPendingRequests = new Map(state.pendingRequests);
        newPendingRequests.set(drId, {
          requestId,
          timestamp: Date.now(),
          action,
        });
        set({ pendingRequests: newPendingRequests });
        return requestId;
      },

      _finishRequest(drId: string, requestId: string) {
        const state = get();
        const pendingRequest = state.pendingRequests.get(drId);
        if (pendingRequest?.requestId === requestId) {
          const newPendingRequests = new Map(state.pendingRequests);
          newPendingRequests.delete(drId);
          set({ pendingRequests: newPendingRequests });
          return true;
        }
        return false;
      },

      _isRequestPending(drId: string) {
        // Clean up stale requests first
        get()._cleanupStaleRequests();
        const state = get();
        return state.pendingRequests.has(drId);
      },

      _cleanupStaleRequests() {
        const state = get();
        const now = Date.now();
        const TIMEOUT_MS = 30000; // 30 second timeout
        const newPendingRequests = new Map();

        state.pendingRequests.forEach((request, drId) => {
          if (now - request.timestamp < TIMEOUT_MS) {
            newPendingRequests.set(drId, request);
          }
        });

        if (newPendingRequests.size !== state.pendingRequests.size) {
          set({ pendingRequests: newPendingRequests });
        }
      },

      // Actions
      setCurrentDeliveryRequest: (dr) => set({ currentDeliveryRequest: dr }),

      async loadDeliveryRequestsWithFilter(filters, reset = false) {
        const shouldReset =
          reset || JSON.stringify(filters) !== JSON.stringify(get().activeFilters);

        if (shouldReset) {
          set({
            isLoading: true,
            error: undefined,
            currentCursor: undefined,
            previousCursors: [],
            currentPage: 1,
            activeFilters: filters || {},
          });
        } else {
          set({ isLoading: true, error: undefined });
        }

        try {
          const response = await deliveryRequestService.getDeliveryRequestsWithFilter(
            shouldReset ? filters : { ...get().activeFilters, cursor: get().currentCursor },
          );

          set({
            deliveryRequests: response.deliveryRequests,
            hasMoreDeliveryRequests: response.pagination.hasNext,
            hasPreviousPage: response.pagination.hasPrev,
            currentCursor: response.pagination.nextCursor,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: getErrorMessage(error, 'Failed to load delivery requests'),
            isLoading: false,
          });
        }
      },

      async loadMoreDeliveryRequests() {
        const state = get();
        if (!state.hasMoreDeliveryRequests || state.isLoadingMore) return;

        set({ isLoadingMore: true, error: undefined });

        try {
          const response = await deliveryRequestService.getDeliveryRequestsWithFilter({
            ...state.activeFilters,
            cursor: state.currentCursor,
          });

          set((state) => ({
            deliveryRequests: [...state.deliveryRequests, ...response.deliveryRequests],
            hasMoreDeliveryRequests: response.pagination.hasNext,
            currentCursor: response.pagination.nextCursor,
            isLoadingMore: false,
          }));
        } catch (error) {
          set({
            error: getErrorMessage(error, 'Failed to load more delivery requests'),
            isLoadingMore: false,
          });
        }
      },

      async loadNextPage() {
        const state = get();
        if (!state.hasMoreDeliveryRequests || state.isLoading) return;

        const newPreviousCursors = [...state.previousCursors];
        if (state.currentCursor) {
          newPreviousCursors.push(state.currentCursor);
        }

        set({
          isLoading: true,
          error: undefined,
          previousCursors: newPreviousCursors,
          currentPage: state.currentPage + 1,
        });

        try {
          const response = await deliveryRequestService.getDeliveryRequestsWithFilter({
            ...state.activeFilters,
            cursor: state.currentCursor,
          });

          set({
            deliveryRequests: response.deliveryRequests,
            hasMoreDeliveryRequests: response.pagination.hasNext,
            hasPreviousPage: true,
            currentCursor: response.pagination.nextCursor,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: getErrorMessage(error, 'Failed to load delivery requests'),
            isLoading: false,
          });
        }
      },

      async loadPreviousPage() {
        const state = get();
        if (!state.hasPreviousPage || state.isLoading) return;

        const newPreviousCursors = [...state.previousCursors];
        const previousCursor = newPreviousCursors.pop();

        set({
          isLoading: true,
          error: undefined,
          previousCursors: newPreviousCursors,
          currentPage: Math.max(1, state.currentPage - 1),
        });

        try {
          const response = await deliveryRequestService.getDeliveryRequestsWithFilter({
            ...state.activeFilters,
            cursor: previousCursor,
          });

          set({
            deliveryRequests: response.deliveryRequests,
            hasMoreDeliveryRequests: response.pagination.hasNext,
            hasPreviousPage: newPreviousCursors.length > 0,
            currentCursor: response.pagination.nextCursor,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: getErrorMessage(error, 'Failed to load delivery requests'),
            isLoading: false,
          });
        }
      },

      async refreshDeliveryRequests() {
        const state = get();
        await get().loadDeliveryRequestsWithFilter(state.activeFilters, true);
      },

      resetPagination() {
        set({
          currentCursor: undefined,
          previousCursors: [],
          hasMoreDeliveryRequests: true,
          hasPreviousPage: false,
          currentPage: 1,
        });
      },

      async loadDeliveryRequest(id: string) {
        set({ isLoading: true, error: undefined });
        try {
          const dr = await deliveryRequestService.getDeliveryRequestById(id);
          set({ currentDeliveryRequest: dr, isLoading: false });
        } catch (error) {
          set({
            error: getErrorMessage(error, 'Failed to load delivery requests'),
            isLoading: false,
          });
        }
      },

      async createDeliveryRequest(data: CreateDeliveryRequest) {
        set({ isLoading: true, error: undefined });
        try {
          const newDR = await deliveryRequestService.createDeliveryRequest(data);
          set((state) => ({
            deliveryRequests: [newDR, ...state.deliveryRequests],
            isLoading: false,
          }));
          return newDR;
        } catch (error) {
          const errorMessage = getErrorMessage(error, 'Failed to create delivery request');
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      async updateDeliveryRequest(id: string, data: UpdateDeliveryRequest) {
        if (get()._isRequestPending(id)) {
          return;
        }

        const requestId = get()._startRequest(id, 'update');
        set({ error: undefined });

        try {
          const updatedDR = await deliveryRequestService.updateDeliveryRequest(id, data);
          if (get()._finishRequest(id, requestId)) {
            set((state) => ({
              deliveryRequests: state.deliveryRequests.map((dr) => (dr.id === id ? updatedDR : dr)),
              currentDeliveryRequest:
                state.currentDeliveryRequest?.id === id
                  ? { ...state.currentDeliveryRequest, ...updatedDR }
                  : state.currentDeliveryRequest,
            }));
          }
        } catch (error) {
          if (get()._finishRequest(id, requestId)) {
            set({ error: getErrorMessage(error, 'Operation failed') });
          }
          throw error;
        }
      },

      async updateDeliveryStatus(id: string, status: DeliveryStatus, notes?: string) {
        if (get()._isRequestPending(id)) {
          return;
        }

        const requestId = get()._startRequest(id, 'updateStatus');
        set({ error: undefined });

        try {
          const updatedDR = await deliveryRequestService.updateDeliveryStatus(id, status, notes);
          if (get()._finishRequest(id, requestId)) {
            set((state) => ({
              deliveryRequests: state.deliveryRequests.map((dr) => (dr.id === id ? updatedDR : dr)),
              currentDeliveryRequest:
                state.currentDeliveryRequest?.id === id
                  ? { ...state.currentDeliveryRequest, ...updatedDR }
                  : state.currentDeliveryRequest,
            }));
          }
        } catch (error) {
          if (get()._finishRequest(id, requestId)) {
            set({ error: getErrorMessage(error, 'Operation failed') });
          }
          throw error;
        }
      },

      async uploadPhotos(id: string, photoUrls: string[]) {
        if (get()._isRequestPending(id)) {
          return;
        }

        const requestId = get()._startRequest(id, 'uploadPhotos');
        set({ error: undefined });

        try {
          const updatedDR = await deliveryRequestService.uploadPhotos(id, photoUrls);
          if (get()._finishRequest(id, requestId)) {
            set((state) => ({
              deliveryRequests: state.deliveryRequests.map((dr) => (dr.id === id ? updatedDR : dr)),
              currentDeliveryRequest:
                state.currentDeliveryRequest?.id === id
                  ? { ...state.currentDeliveryRequest, ...updatedDR }
                  : state.currentDeliveryRequest,
            }));
          }
        } catch (error) {
          if (get()._finishRequest(id, requestId)) {
            set({ error: getErrorMessage(error, 'Operation failed') });
          }
          throw error;
        }
      },

      async completeDelivery(id: string, data?: { photoUrls?: string[]; notes?: string }) {
        if (get()._isRequestPending(id)) {
          return;
        }

        const requestId = get()._startRequest(id, 'complete');
        set({ error: undefined });

        try {
          const updatedDR = await deliveryRequestService.completeDelivery(id, data);
          if (get()._finishRequest(id, requestId)) {
            set((state) => ({
              deliveryRequests: state.deliveryRequests.map((dr) => (dr.id === id ? updatedDR : dr)),
              currentDeliveryRequest:
                state.currentDeliveryRequest?.id === id
                  ? { ...state.currentDeliveryRequest, ...updatedDR }
                  : state.currentDeliveryRequest,
            }));
          }
        } catch (error) {
          if (get()._finishRequest(id, requestId)) {
            set({ error: getErrorMessage(error, 'Operation failed') });
          }
          throw error;
        }
      },

      async deleteDeliveryRequest(id: string) {
        if (get()._isRequestPending(id)) {
          return;
        }

        const requestId = get()._startRequest(id, 'delete');
        set({ error: undefined });

        try {
          await deliveryRequestService.deleteDeliveryRequest(id);
          if (get()._finishRequest(id, requestId)) {
            set((state) => ({
              deliveryRequests: state.deliveryRequests.filter((dr) => dr.id !== id),
              currentDeliveryRequest:
                state.currentDeliveryRequest?.id === id ? undefined : state.currentDeliveryRequest,
            }));
          }
        } catch (error) {
          if (get()._finishRequest(id, requestId)) {
            set({ error: getErrorMessage(error, 'Operation failed') });
          }
          throw error;
        }
      },

      clearError: () => set({ error: undefined }),

      // Selectors
      getDeliveryRequestById: (id: string) => {
        return get().deliveryRequests.find((dr) => dr.id === id);
      },

      getDeliveryRequestsByStatus: (status: DeliveryStatus) => {
        return get().deliveryRequests.filter((dr) => dr.status === status);
      },

      getDeliveryRequestsByPO: (purchaseOrderId: string) => {
        return get().deliveryRequests.filter((dr) => dr.purchaseOrderId === purchaseOrderId);
      },

      getDeliveryRequestsByAssignee: (assignedTo: string) => {
        return get().deliveryRequests.filter((dr) => dr.assignedTo === assignedTo);
      },
    }),
    {
      name: 'delivery-request-store',
    },
  ),
);

// Export custom hooks for common use cases
export const useDeliveryRequests = () => useDeliveryRequestStore((state) => state.deliveryRequests);
export const useCurrentDeliveryRequest = () =>
  useDeliveryRequestStore((state) => state.currentDeliveryRequest);
export const useDeliveryRequestLoading = () => useDeliveryRequestStore((state) => state.isLoading);
export const useDeliveryRequestError = () => useDeliveryRequestStore((state) => state.error);

// Individual action selectors to prevent infinite loops
export const useLoadDeliveryRequestsWithFilter = () =>
  useDeliveryRequestStore((state) => state.loadDeliveryRequestsWithFilter);
export const useClearDeliveryRequestError = () =>
  useDeliveryRequestStore((state) => state.clearError);
export const useLoadDeliveryRequest = () =>
  useDeliveryRequestStore((state) => state.loadDeliveryRequest);
export const useCreateDeliveryRequest = () =>
  useDeliveryRequestStore((state) => state.createDeliveryRequest);
export const useUpdateDeliveryRequest = () =>
  useDeliveryRequestStore((state) => state.updateDeliveryRequest);
export const useUpdateDeliveryStatus = () =>
  useDeliveryRequestStore((state) => state.updateDeliveryStatus);
export const useUploadPhotos = () => useDeliveryRequestStore((state) => state.uploadPhotos);
export const useCompleteDelivery = () => useDeliveryRequestStore((state) => state.completeDelivery);
export const useDeleteDeliveryRequest = () =>
  useDeliveryRequestStore((state) => state.deleteDeliveryRequest);

// Individual pagination selectors
export const useHasMoreDeliveryRequests = () =>
  useDeliveryRequestStore((state) => state.hasMoreDeliveryRequests);
export const useHasPreviousPage = () => useDeliveryRequestStore((state) => state.hasPreviousPage);
export const useIsLoadingMore = () => useDeliveryRequestStore((state) => state.isLoadingMore);
export const useCurrentPage = () => useDeliveryRequestStore((state) => state.currentPage);
export const useLoadMoreDeliveryRequests = () =>
  useDeliveryRequestStore((state) => state.loadMoreDeliveryRequests);
export const useLoadNextPage = () => useDeliveryRequestStore((state) => state.loadNextPage);
export const useLoadPreviousPage = () => useDeliveryRequestStore((state) => state.loadPreviousPage);
