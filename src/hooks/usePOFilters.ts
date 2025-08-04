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

export function usePOFilters(
  purchaseOrders: readonly PurchaseOrder[],
): [PurchaseOrder[], POFilters, POFilterHandlers] {
  const [filters, setFilters] = useState<POFilters>(defaultFilters);

  const handlers: POFilterHandlers = {
    setSearchQuery: useCallback((query: string) => {
      setFilters((prev) => ({ ...prev, searchQuery: query }));
    }, []),

    setCustomerId: useCallback((customerId: string | undefined) => {
      setFilters((prev) => ({ ...prev, customerId }));
    }, []),

    setStatus: useCallback((status: POStatusType) => {
      setFilters((prev) => ({ ...prev, status }));
    }, []),

    setDateRange: useCallback((start: Date | undefined, end: Date | undefined) => {
      setFilters((prev) => ({
        ...prev,
        dateRange: { start, end },
      }));
    }, []),

    updateFilters: useCallback((updates: Partial<POFilters>) => {
      setFilters((prev) => ({ ...prev, ...updates }));
    }, []),

    resetFilters: useCallback(() => {
      setFilters(defaultFilters);
    }, []),
  };

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const { searchQuery, customerId, status, dateRange } = filters;

      // Status filter
      if (status !== PO_STATUS.ALL && po.status !== status) {
        return false;
      }

      // Customer filter
      if (customerId && po.customerId !== customerId) {
        return false;
      }

      // Date range filter
      if (dateRange.start && po.orderDate < dateRange.start) {
        return false;
      }
      if (dateRange.end && po.orderDate > dateRange.end) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        const matchesSearch =
          po.poNumber.toLowerCase().includes(lowerQuery) ||
          (po.customer?.name.toLowerCase().includes(lowerQuery) ?? false) ||
          (po.customer?.companyName?.toLowerCase().includes(lowerQuery) ?? false) ||
          (po.notes?.toLowerCase().includes(lowerQuery) ?? false);
        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });
  }, [purchaseOrders, filters]);

  return [filteredPOs, filters, handlers];
}
