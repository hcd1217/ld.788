import { useState, useMemo, useCallback } from 'react';
import type { PurchaseOrder } from '@/services/sales';
import { PO_STATUS, type POStatusType } from '@/constants/purchaseOrder';

export interface POFilters {
  searchQuery: string;
  customerId: string | undefined;
  status: POStatusType;
  dateRange: {
    start: Date | undefined;
    end: Date | undefined;
  };
}

export interface POFilterHandlers {
  setSearchQuery: (query: string) => void;
  setCustomerId: (customerId: string | undefined) => void;
  setStatus: (status: POStatusType) => void;
  setDateRange: (start: Date | undefined, end: Date | undefined) => void;
  updateFilters: (updates: Partial<POFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: POFilters = {
  searchQuery: '',
  customerId: undefined,
  status: PO_STATUS.ALL,
  dateRange: {
    start: undefined,
    end: undefined,
  },
};

// Pre-computed searchable text for each PO to avoid repeated toLowerCase() calls
interface POWithSearchText {
  po: PurchaseOrder;
  searchText: string;
}

export function usePOFilters(purchaseOrders: readonly PurchaseOrder[], searchOverride?: string) {
  const [filters, setFilters] = useState<POFilters>(defaultFilters);

  const hasActiveFilters = useMemo(() => {
    if (filters.customerId) {
      return true;
    }
    if (filters.status !== PO_STATUS.ALL) {
      return true;
    }
    if (filters.searchQuery) {
      return true;
    }
    if (filters.dateRange.start || filters.dateRange.end) {
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

  const setStatus = useCallback((status: POStatusType) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setDateRange = useCallback((start: Date | undefined, end: Date | undefined) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { start, end },
    }));
  }, []);

  const updateFilters = useCallback((updates: Partial<POFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const filterHandlers: POFilterHandlers = useMemo(() => {
    return {
      setSearchQuery,
      setCustomerId,
      setStatus,
      setDateRange,
      updateFilters,
      resetFilters,
    };
  }, [setSearchQuery, setCustomerId, setStatus, setDateRange, updateFilters, resetFilters]);

  // Pre-compute searchable text for all POs once when data changes
  // This avoids repeated toLowerCase() calls during filtering
  const posWithSearchText = useMemo<readonly POWithSearchText[]>(() => {
    return purchaseOrders.map((po) => {
      // Combine all searchable fields into a single lowercase string
      const searchParts: string[] = [
        po.poNumber,
        po.customer?.name ?? '',
        po.customer?.companyName ?? '',
        po.notes ?? '',
      ];

      const searchText = searchParts
        .filter(Boolean) // Remove empty strings
        .join(' ')
        .toLowerCase();

      return { po, searchText };
    });
  }, [purchaseOrders]);

  // Memoize the normalized search query to avoid repeated toLowerCase() calls
  const normalizedSearchQuery = useMemo(() => {
    const query = searchOverride !== undefined ? searchOverride : filters.searchQuery;
    return query.trim().toLowerCase();
  }, [filters.searchQuery, searchOverride]);

  const filteredPOs = useMemo(() => {
    const { customerId, status, dateRange } = filters;

    // Early exit if no filters are applied
    if (!hasActiveFilters && !normalizedSearchQuery) {
      return purchaseOrders;
    }

    // Filter the pre-computed POs with optimized checks
    const filtered = posWithSearchText.filter(({ po, searchText }) => {
      // Perform cheapest checks first for early exits

      // Status filter (simple enum comparison - very fast)
      if (status !== PO_STATUS.ALL && po.status !== status) {
        return false;
      }

      // Customer filter (simple ID comparison - very fast)
      if (customerId && po.customerId !== customerId) {
        return false;
      }

      // Date range filter (date comparison - fast)
      if (dateRange.start && po.orderDate < dateRange.start) {
        return false;
      }
      if (dateRange.end && po.orderDate > dateRange.end) {
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

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setCustomerId(undefined);
    setStatus(PO_STATUS.ALL);
    setDateRange(undefined, undefined);
  }, [setSearchQuery, setCustomerId, setStatus, setDateRange]);

  return { filteredPOs, filters, filterHandlers, hasActiveFilters, clearAllFilters };
}
