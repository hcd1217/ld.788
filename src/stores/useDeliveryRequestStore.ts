import { useMemo } from 'react';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { ClientConfig } from '@/lib/api/schemas/clientConfig.schemas';
import {
  type CreateDeliveryRequest,
  type DeliveryRequest,
  type DeliveryRequestFilterParams,
  deliveryRequestService,
  type DeliveryStatus,
  type UpdateDeliveryRequest,
} from '@/services/sales';
import { getErrorMessage } from '@/utils/errorUtils';
import { endOfDay, startOfDay } from '@/utils/time';

import { useAppStore } from './useAppStore';

type DeliveryRequestState = {
  // Delivery Request data
  deliveryRequests: DeliveryRequest[];
  currentDeliveryRequest: DeliveryRequest | undefined;
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

  // Simplified request tracking - just track pending IDs
  pendingActions: Set<string>;

  // Internal helpers (not exposed to consumers)
  _markPending: (id: string) => void;
  _removePending: (id: string) => void;
  _forceReload: (id: string) => Promise<void>;
  _rollback: (
    id: string,
    previousDR: DeliveryRequest | undefined,
    previousCurrentDR: DeliveryRequest | undefined,
    error?: string,
  ) => void;
  _optimisticUpdate: (
    id: string,
    data: { status?: DeliveryStatus } & Partial<DeliveryRequest>,
  ) => void;

  // Actions
  setCurrentDeliveryRequest: (dr: DeliveryRequest | undefined) => void;
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
  uploadPhotos: (id: string, photos: { publicUrl: string; key: string }[]) => Promise<void>;
  completeDelivery: (
    id: string,
    data?: {
      receivedBy: string;
      photos: { publicUrl: string; key: string }[];
      notes: string;
    },
  ) => Promise<void>;
  updateDeliveryOrderInDay: (assignedTo: string, date: Date, requestIds: string[]) => Promise<void>;
  loadDeliveryRequestsForDate: (assignedTo: string, date: Date) => Promise<DeliveryRequest[]>;
  clearError: () => void;

  // Selectors
  getDeliveryRequestById: (id: string) => DeliveryRequest | undefined;
  getDeliveryAssigneeOptions: () => Array<{ value: string; label: string }>;
};

const DEFAULT_DELIVERY_ASSIGNEE_OPTIONS: Array<{ value: string; label: string }> = [];

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
      pendingActions: new Set(),

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
        const state = get();

        // Check if action is already pending
        if (state.pendingActions.has(id)) {
          return;
        }

        // Mark as pending
        get()._markPending(id);

        // Save previous state for rollback
        const previousDR = state.deliveryRequests.find((dr) => dr.id === id);
        const previousCurrentDR = state.currentDeliveryRequest;

        // Skip optimistic update for complex data types - just mark as pending

        try {
          // Call service and use the response
          await deliveryRequestService.updateDeliveryRequest(id, data);

          // Force reload to get latest data from server
          get()._forceReload(id);
        } catch (error) {
          // Rollback on failure
          get()._rollback(
            id,
            previousDR,
            previousCurrentDR,
            getErrorMessage(error, 'Failed to update delivery request'),
          );
          throw error;
        } finally {
          get()._removePending(id);
        }
      },

      async updateDeliveryStatus(id: string, status: DeliveryStatus, notes?: string) {
        const state = get();

        // Check if action is already pending
        if (state.pendingActions.has(id)) {
          return;
        }

        // Mark as pending
        get()._markPending(id);

        // Save previous state for rollback
        const previousDR = state.deliveryRequests.find((dr) => dr.id === id);
        const previousCurrentDR = state.currentDeliveryRequest;

        // Apply optimistic update
        get()._optimisticUpdate(id, { status });

        try {
          // Call service and use the response
          await deliveryRequestService.updateDeliveryStatus(id, status, notes);

          // Force reload to get latest data from server
          get()._forceReload(id);
        } catch (error) {
          // Rollback on failure
          get()._rollback(
            id,
            previousDR,
            previousCurrentDR,
            getErrorMessage(error, 'Failed to update delivery status'),
          );
          throw error;
        } finally {
          get()._removePending(id);
        }
      },

      async uploadPhotos(id: string, photos: { publicUrl: string; key: string }[]) {
        const state = get();

        // Check if action is already pending
        if (state.pendingActions.has(id)) {
          return;
        }

        // Mark as pending
        get()._markPending(id);

        try {
          // Call service and use the response
          await deliveryRequestService.uploadPhotos(id, photos);

          // Force reload to get latest data from server
          get()._forceReload(id);
        } catch (error) {
          set({ error: getErrorMessage(error, 'Failed to upload photos') });
          throw error;
        } finally {
          get()._removePending(id);
        }
      },

      async completeDelivery(
        id: string,
        data: { photos: { publicUrl: string; key: string }[]; notes?: string },
      ) {
        const state = get();

        // Check if action is already pending
        if (state.pendingActions.has(id)) {
          return;
        }

        // Mark as pending
        get()._markPending(id);

        // Save previous state for rollback
        const previousDR = state.deliveryRequests.find((dr) => dr.id === id);
        const previousCurrentDR = state.currentDeliveryRequest;

        // Apply optimistic update
        get()._optimisticUpdate(id, { status: 'COMPLETED' as DeliveryStatus });

        try {
          // Call service and use the response
          await deliveryRequestService.completeDelivery(id, data);

          // Force reload to get latest data from server
          get()._forceReload(id);
        } catch (error) {
          // Rollback on failure
          get()._rollback(
            id,
            previousDR,
            previousCurrentDR,
            getErrorMessage(error, 'Failed to complete delivery'),
          );
          throw error;
        } finally {
          get()._removePending(id);
        }
      },

      async updateDeliveryOrderInDay(assignedTo: string, date: Date, requestIds: string[]) {
        set({ isLoading: true, error: undefined });
        try {
          await deliveryRequestService.updateDeliveryOrderInDay(assignedTo, date, requestIds);
          // No need to reload, the page will refresh the data
        } catch (error) {
          set({ error: getErrorMessage(error, 'Failed to update delivery order') });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      async loadDeliveryRequestsForDate(assignedTo: string, date: Date) {
        set({ isLoading: true, error: undefined });
        try {
          const response = await deliveryRequestService.getDeliveryRequestsWithFilter({
            assignedTo,
            scheduledDateFrom: startOfDay(date),
            scheduledDateTo: endOfDay(date),
            limit: 100, // Get all for the day
          });
          return response.deliveryRequests;
        } catch (error) {
          set({ error: getErrorMessage(error, 'Failed to load delivery requests') });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: undefined }),

      // Selectors
      getDeliveryRequestById: (id: string) => {
        return get().deliveryRequests.find((dr) => dr.id === id);
      },

      getDeliveryAssigneeOptions: () => {
        // Get employees and clientConfig from app store
        const appState = useAppStore.getState();
        const employees = appState.overviewData?.employees;
        const clientConfig: ClientConfig | undefined = appState.user?.clientConfig;
        const assigneeIds = clientConfig?.features?.deliveryRequest?.assigneeIds;

        if (!assigneeIds || !employees) {
          return DEFAULT_DELIVERY_ASSIGNEE_OPTIONS;
        }

        // Filter employees based on assigneeIds if configured, otherwise show all
        const filteredEmployees =
          assigneeIds.length > 0
            ? employees.filter((employee) => assigneeIds.includes(employee.id))
            : employees;

        return filteredEmployees.map((employee) => ({
          value: employee.id,
          label: employee.fullName,
        }));
      },

      // Internal helper methods
      _markPending(id: string) {
        set((state) => {
          if (state.pendingActions.has(id)) {
            return {};
          }
          const pendingActions = new Set(state.pendingActions);
          pendingActions.add(id);
          return {
            pendingActions,
            error: undefined,
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

      async _forceReload(id: string) {
        const updatedDR = await deliveryRequestService.getDeliveryRequestById(id);
        if (updatedDR) {
          // Update in list
          set((state) => ({
            deliveryRequests: state.deliveryRequests.map((dr) => (dr.id === id ? updatedDR : dr)),
          }));

          // Update current if it's the same
          if (get().currentDeliveryRequest?.id === id) {
            set({ currentDeliveryRequest: updatedDR });
          }
        } else {
          // If not found, remove from list
          set((state) => ({
            deliveryRequests: state.deliveryRequests.filter((dr) => dr.id !== id),
            currentDeliveryRequest:
              state.currentDeliveryRequest?.id === id ? undefined : state.currentDeliveryRequest,
          }));
        }
      },

      _rollback(
        id: string,
        previousDR: DeliveryRequest | undefined,
        previousCurrentDR: DeliveryRequest | undefined,
        error?: string,
      ) {
        set((state) => ({
          deliveryRequests: previousDR
            ? state.deliveryRequests.map((dr) => (dr.id === id ? previousDR : dr))
            : state.deliveryRequests,
          currentDeliveryRequest:
            state.currentDeliveryRequest?.id === id
              ? previousCurrentDR
              : state.currentDeliveryRequest,
          error: error,
        }));
      },

      _optimisticUpdate(id: string, data: { status?: DeliveryStatus } & Partial<DeliveryRequest>) {
        set((state) => ({
          deliveryRequests: state.deliveryRequests.map((dr) =>
            dr.id === id ? { ...dr, ...data } : dr,
          ),
          currentDeliveryRequest:
            state.currentDeliveryRequest?.id === id
              ? { ...state.currentDeliveryRequest, ...data }
              : state.currentDeliveryRequest,
        }));
      },
    }),
    {
      name: 'delivery-request-store',
    },
  ),
);

// Empty constants to prevent re-renders when data is undefined
const EMPTY_ARRAY: DeliveryRequest[] = [];

// Convenience hooks with stable references
export const useDeliveryRequests = () =>
  useDeliveryRequestStore((state) => state.deliveryRequests) || EMPTY_ARRAY;
export const useDeliveryRequestLoading = () => useDeliveryRequestStore((state) => state.isLoading);
export const useDeliveryRequestError = () => useDeliveryRequestStore((state) => state.error);

// Export hook with stable reference by calling the store multiple times
// This pattern prevents infinite re-renders as each function reference is stable
export const useDeliveryRequestActions = () => {
  const loadDeliveryRequestsWithFilter = useDeliveryRequestStore(
    (state) => state.loadDeliveryRequestsWithFilter,
  );
  const loadMoreDeliveryRequests = useDeliveryRequestStore(
    (state) => state.loadMoreDeliveryRequests,
  );
  const loadNextPage = useDeliveryRequestStore((state) => state.loadNextPage);
  const loadPreviousPage = useDeliveryRequestStore((state) => state.loadPreviousPage);
  const resetPagination = useDeliveryRequestStore((state) => state.resetPagination);
  const refreshDeliveryRequests = useDeliveryRequestStore((state) => state.refreshDeliveryRequests);
  const loadDeliveryRequest = useDeliveryRequestStore((state) => state.loadDeliveryRequest);
  const createDeliveryRequest = useDeliveryRequestStore((state) => state.createDeliveryRequest);
  const updateDeliveryRequest = useDeliveryRequestStore((state) => state.updateDeliveryRequest);
  const updateDeliveryStatus = useDeliveryRequestStore((state) => state.updateDeliveryStatus);
  const uploadPhotos = useDeliveryRequestStore((state) => state.uploadPhotos);
  const completeDelivery = useDeliveryRequestStore((state) => state.completeDelivery);
  const updateDeliveryOrderInDay = useDeliveryRequestStore(
    (state) => state.updateDeliveryOrderInDay,
  );
  const loadDeliveryRequestsForDate = useDeliveryRequestStore(
    (state) => state.loadDeliveryRequestsForDate,
  );
  const clearError = useDeliveryRequestStore((state) => state.clearError);

  return {
    loadDeliveryRequestsWithFilter,
    loadMoreDeliveryRequests,
    loadNextPage,
    loadPreviousPage,
    resetPagination,
    refreshDeliveryRequests,
    loadDeliveryRequest,
    createDeliveryRequest,
    updateDeliveryRequest,
    updateDeliveryStatus,
    uploadPhotos,
    completeDelivery,
    updateDeliveryOrderInDay,
    loadDeliveryRequestsForDate,
    clearError,
  };
};

// Current delivery request hook
export const useCurrentDeliveryRequest = () =>
  useDeliveryRequestStore((state) => state.currentDeliveryRequest);

// Pagination state hooks - consolidated into a single hook for better performance
export const useDeliveryRequestPaginationState = () => {
  const currentCursor = useDeliveryRequestStore((state) => state.currentCursor);
  const hasMoreDeliveryRequests = useDeliveryRequestStore((state) => state.hasMoreDeliveryRequests);
  const hasPreviousPage = useDeliveryRequestStore((state) => state.hasPreviousPage);
  const isLoadingMore = useDeliveryRequestStore((state) => state.isLoadingMore);
  const activeFilters = useDeliveryRequestStore((state) => state.activeFilters);
  const currentPage = useDeliveryRequestStore((state) => state.currentPage);

  return {
    currentCursor,
    hasMoreDeliveryRequests,
    hasPreviousPage,
    isLoadingMore,
    activeFilters,
    currentPage,
  };
};

// Delivery assignee options hook with memoization to prevent infinite re-renders
export const useDeliveryAssigneeOptions = () => {
  // Get the selector function (stable reference)
  const getDeliveryAssigneeOptions = useDeliveryRequestStore(
    (state) => state.getDeliveryAssigneeOptions,
  );

  // Get dependencies that might affect the options
  const employees = useAppStore((state) => state.overviewData?.employees);
  const assigneeIds = useAppStore(
    (state) => state.user?.clientConfig?.features?.deliveryRequest?.assigneeIds,
  );

  // Memoize the result based on the actual data dependencies
  return useMemo(() => {
    if (!employees || !assigneeIds) {
      return DEFAULT_DELIVERY_ASSIGNEE_OPTIONS;
    }
    return getDeliveryAssigneeOptions();
  }, [getDeliveryAssigneeOptions, employees, assigneeIds]);
};
