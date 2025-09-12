import { useCallback, useMemo, useState } from 'react';

import { DELIVERY_STATUS, type DeliveryStatusType } from '@/constants/deliveryRequest';
import type { DeliveryRequest } from '@/services/sales/deliveryRequest';

export interface DeliveryRequestFilters {
  searchQuery: string;
  statuses: DeliveryStatusType[]; // Changed to array for multi-select
  assignedTo: string | undefined;
  customerId: string | undefined;
  scheduledDateRange: {
    start: Date | undefined;
    end: Date | undefined;
  };
}

export interface DeliveryRequestFilterHandlers {
  setSearchQuery: (query: string) => void;
  setStatuses: (statuses: DeliveryStatusType[]) => void;
  toggleStatus: (status: DeliveryStatusType) => void;
  setAssignedTo: (assignedTo: string | undefined) => void;
  setCustomerId: (customerId: string | undefined) => void;
  setScheduledDateRange: (start: Date | undefined, end: Date | undefined) => void;
  updateFilters: (updates: Partial<DeliveryRequestFilters>) => void;
  resetFilters: () => void;
}

const ONE_DAY = 24 * 60 * 60 * 1000;

const defaultFilters: DeliveryRequestFilters = {
  searchQuery: '',
  // statuses: [DELIVERY_STATUS.PENDING],
  statuses: [], // All statuses
  assignedTo: undefined,
  customerId: undefined,
  scheduledDateRange: {
    start: new Date(new Date().setHours(0, 0, 0, 0)),
    end: new Date(new Date(Date.now() + ONE_DAY).setHours(23, 59, 59, 999)),
  },
};

export function useDeliveryRequestFilters(deliveryRequests: readonly DeliveryRequest[]) {
  const [filters, setFilters] = useState<DeliveryRequestFilters>(defaultFilters);

  const hasActiveFilters = useMemo(() => {
    if (filters.statuses.length > 0 && !filters.statuses.includes(DELIVERY_STATUS.ALL)) {
      return true;
    }
    if (filters.assignedTo) {
      return true;
    }
    if (filters.customerId) {
      return true;
    }
    if (filters.searchQuery) {
      return true;
    }
    if (filters.scheduledDateRange.start || filters.scheduledDateRange.end) {
      return true;
    }
    return false;
  }, [filters]);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setStatuses = useCallback((statuses: DeliveryStatusType[]) => {
    setFilters((prev) => ({ ...prev, statuses }));
  }, []);

  const toggleStatus = useCallback((status: DeliveryStatusType) => {
    setFilters((prev) => {
      const isSelected = prev.statuses.includes(status);
      const newStatuses = isSelected
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status];
      return { ...prev, statuses: newStatuses };
    });
  }, []);

  const setAssignedTo = useCallback((assignedTo: string | undefined) => {
    setFilters((prev) => ({ ...prev, assignedTo }));
  }, []);

  const setCustomerId = useCallback((customerId: string | undefined) => {
    setFilters((prev) => ({ ...prev, customerId }));
  }, []);

  const setScheduledDateRange = useCallback((start: Date | undefined, end: Date | undefined) => {
    setFilters((prev) => ({
      ...prev,
      scheduledDateRange: { start, end },
    }));
  }, []);

  const updateFilters = useCallback((updates: Partial<DeliveryRequestFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      statuses: [],
      assignedTo: undefined,
      customerId: undefined,
      scheduledDateRange: {
        start: undefined,
        end: undefined,
      },
    });
  }, []);

  const filterHandlers: DeliveryRequestFilterHandlers = useMemo(
    () => ({
      setSearchQuery,
      setStatuses,
      toggleStatus,
      setAssignedTo,
      setCustomerId,
      setScheduledDateRange,
      updateFilters,
      resetFilters,
    }),
    [
      setSearchQuery,
      setStatuses,
      toggleStatus,
      setAssignedTo,
      setCustomerId,
      setScheduledDateRange,
      updateFilters,
      resetFilters,
    ],
  );

  // Server-side filtering - this is not used for client-side filtering
  // We keep this structure for consistency with PO filters
  const filteredDeliveryRequests = deliveryRequests;

  return {
    filters,
    filterHandlers,
    filteredDeliveryRequests,
    hasActiveFilters,
  };
}
