import { useState, useMemo, useCallback } from 'react';
import type { PurchaseOrder } from '@/services/sales';
import { PO_STATUS, type POStatusType } from '@/constants/purchaseOrder';
import { getCustomerNameByCustomerId } from '@/utils/overview';
import { useCustomerMapByCustomerId } from '@/stores/useAppStore';

export type DateFilterType = 'orderDate' | 'deliveryDate';

export interface POFilters {
  searchQuery: string;
  customerId: string | undefined;
  statuses: POStatusType[]; // Changed to array for multi-select
  orderDateRange: {
    start: Date | undefined;
    end: Date | undefined;
  };
  deliveryDateRange: {
    start: Date | undefined;
    end: Date | undefined;
  };
}

export interface POFilterHandlers {
  setSearchQuery: (query: string) => void;
  setCustomerId: (customerId: string | undefined) => void;
  setStatuses: (statuses: POStatusType[]) => void;
  toggleStatus: (status: POStatusType) => void;
  setOrderDateRange: (start: Date | undefined, end: Date | undefined) => void;
  setDeliveryDateRange: (start: Date | undefined, end: Date | undefined) => void;
  updateFilters: (updates: Partial<POFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: POFilters = {
  searchQuery: '',
  customerId: undefined,
  statuses: [
    PO_STATUS.NEW,
    PO_STATUS.CONFIRMED,
    PO_STATUS.PROCESSING,
    PO_STATUS.READY_FOR_PICKUP,
    PO_STATUS.SHIPPED,
  ],
  orderDateRange: {
    start: undefined,
    end: undefined,
  },
  deliveryDateRange: {
    start: undefined,
    end: undefined,
  },
};

// Pre-computed searchable text for each PO to avoid repeated toLowerCase() calls
interface POWithSearchText {
  po: PurchaseOrder;
  searchText: string;
}

export function usePOFilters(purchaseOrders: readonly PurchaseOrder[]) {
  const [filters, setFilters] = useState<POFilters>(defaultFilters);
  const customerMapByCustomerId = useCustomerMapByCustomerId();
  const hasActiveFilters = useMemo(() => {
    if (filters.customerId) {
      return true;
    }
    if (filters.statuses.length > 0 && !filters.statuses.includes(PO_STATUS.ALL)) {
      return true;
    }
    if (filters.searchQuery) {
      return true;
    }
    if (filters.orderDateRange.start || filters.orderDateRange.end) {
      return true;
    }
    if (filters.deliveryDateRange.start || filters.deliveryDateRange.end) {
      return true;
    }
    return false;
  }, [filters]);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setCustomerId = useCallback((customerId: string | undefined) => {
    setFilters((prev) => ({ ...prev, customerId }));
  }, []);

  const setStatuses = useCallback((statuses: POStatusType[]) => {
    setFilters((prev) => ({ ...prev, statuses }));
  }, []);

  const toggleStatus = useCallback((status: POStatusType) => {
    setFilters((prev) => {
      // Special handling for "ALL" status
      if (status === PO_STATUS.ALL) {
        return { ...prev, statuses: [] };
      }

      const currentStatuses = prev.statuses.filter((s) => s !== PO_STATUS.ALL);
      const isSelected = currentStatuses.includes(status);

      if (isSelected) {
        // Remove status
        return { ...prev, statuses: currentStatuses.filter((s) => s !== status) };
      } else {
        // Add status
        return { ...prev, statuses: [...currentStatuses, status] };
      }
    });
  }, []);

  const setOrderDateRange = useCallback((start: Date | undefined, end: Date | undefined) => {
    setFilters((prev) => ({
      ...prev,
      orderDateRange: { start, end },
    }));
  }, []);

  const setDeliveryDateRange = useCallback((start: Date | undefined, end: Date | undefined) => {
    setFilters((prev) => ({
      ...prev,
      deliveryDateRange: { start, end },
    }));
  }, []);

  const updateFilters = useCallback((updates: Partial<POFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      customerId: undefined,
      statuses: [],
      orderDateRange: {
        start: undefined,
        end: undefined,
      },
      deliveryDateRange: {
        start: undefined,
        end: undefined,
      },
    });
  }, []);

  const filterHandlers: POFilterHandlers = useMemo(() => {
    return {
      setSearchQuery,
      setCustomerId,
      setStatuses,
      toggleStatus,
      setOrderDateRange,
      setDeliveryDateRange,
      updateFilters,
      resetFilters,
    };
  }, [
    setSearchQuery,
    setCustomerId,
    setStatuses,
    toggleStatus,
    setOrderDateRange,
    setDeliveryDateRange,
    updateFilters,
    resetFilters,
  ]);

  // Pre-compute searchable text for all POs once when data changes
  // This avoids repeated toLowerCase() calls during filtering
  const posWithSearchText = useMemo<readonly POWithSearchText[]>(() => {
    return purchaseOrders.map((po) => {
      // Combine all searchable fields into a single lowercase string
      const searchParts: string[] = [
        po.poNumber,
        getCustomerNameByCustomerId(customerMapByCustomerId, po.customerId),
        po.notes ?? '',
      ];

      const searchText = searchParts
        .filter(Boolean) // Remove empty strings
        .join(' ')
        .toLowerCase();

      return { po, searchText };
    });
  }, [customerMapByCustomerId, purchaseOrders]);

  // Memoize the normalized search query to avoid repeated toLowerCase() calls
  const normalizedSearchQuery = useMemo(() => {
    return filters.searchQuery.trim().toLowerCase();
  }, [filters.searchQuery]);

  const filteredPOs = useMemo(() => {
    const { customerId, statuses, orderDateRange, deliveryDateRange } = filters;

    // Early exit if no filters are applied
    if (!hasActiveFilters && !normalizedSearchQuery) {
      return purchaseOrders;
    }

    // Filter the pre-computed POs with optimized checks
    const filtered = posWithSearchText.filter(({ po, searchText }) => {
      // Perform cheapest checks first for early exits

      // Status filter (multi-select - check if PO status is in selected statuses)
      if (
        statuses.length > 0 &&
        !statuses.includes(PO_STATUS.ALL) &&
        !statuses.includes(po.status)
      ) {
        return false;
      }

      // Customer filter (simple ID comparison - very fast)
      if (customerId && po.customerId !== customerId) {
        return false;
      }

      // Order date range filter
      if (orderDateRange.start && po.orderDate < orderDateRange.start) {
        return false;
      }
      if (orderDateRange.end && po.orderDate > orderDateRange.end) {
        return false;
      }

      // Delivery date range filter
      if (po.deliveryDate) {
        const deliveryDate = new Date(po.deliveryDate);
        if (deliveryDateRange.start && deliveryDate < deliveryDateRange.start) {
          return false;
        }
        if (deliveryDateRange.end && deliveryDate > deliveryDateRange.end) {
          return false;
        }
      } else if (deliveryDateRange.start || deliveryDateRange.end) {
        // If filter is set but PO has no delivery date, exclude it
        return false;
      }

      // Search query filter (string search - most expensive, do last)
      if (normalizedSearchQuery && !searchText.includes(normalizedSearchQuery)) {
        return false;
      }

      return true;
    });

    // Extract just the PO objects from the filtered results
    return filtered.map(({ po }) => po);
  }, [filters, hasActiveFilters, normalizedSearchQuery, posWithSearchText, purchaseOrders]);

  return { filteredPOs, filters, filterHandlers, hasActiveFilters };
}
