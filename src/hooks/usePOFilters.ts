import { useCallback, useEffect, useMemo, useState } from 'react';

import { z } from 'zod';

import { PO_STATUS, type POStatusType } from '@/constants/purchaseOrder';
import { STORAGE_KEYS } from '@/utils/storageKeys';
import { endOfDay, startOfDay } from '@/utils/time';

import { useOnce } from './useOnce';

export type DateFilterType = 'orderDate' | 'deliveryDate';

const POFiltersSchema = z.object({
  searchQuery: z.string(),
  customerId: z.string().optional(),
  salesId: z.string().optional(),
  statuses: z.array(z.enum(Object.values(PO_STATUS) as [string, ...string[]])),
  orderDateRange: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .transform((val) => ({
      start: val.start ? new Date(val.start) : undefined,
      end: val.end ? new Date(val.end) : undefined,
    })),
  deliveryDateRange: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .transform((val) => ({
      start: val.start ? new Date(val.start) : undefined,
      end: val.end ? new Date(val.end) : undefined,
    })),
});

export interface POFilters {
  searchQuery: string;
  customerId: string | undefined;
  salesId: string | undefined;
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
  setSalesId: (salesId: string | undefined) => void;
  setStatuses: (statuses: POStatusType[]) => void;
  toggleStatus: (status: POStatusType) => void;
  setOrderDateRange: (start: Date | undefined, end: Date | undefined) => void;
  setDeliveryDateRange: (start: Date | undefined, end: Date | undefined) => void;
  updateFilters: (updates: Partial<POFilters>) => void;
  resetFilters: () => void;
}

export function usePOFilters() {
  const [filters, setFilters] = useState<POFilters>(generateDefaultFilters());
  const hasActiveFilters = useMemo(() => {
    if (filters.customerId) {
      return true;
    }
    if (filters.salesId) {
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

  const setSalesId = useCallback((salesId: string | undefined) => {
    setFilters((prev) => ({ ...prev, salesId }));
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
    setFilters(generateDefaultFilters());
  }, []);

  const filterHandlers: POFilterHandlers = useMemo(() => {
    return {
      setSearchQuery,
      setCustomerId,
      setSalesId,
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
    setSalesId,
    setStatuses,
    toggleStatus,
    setOrderDateRange,
    setDeliveryDateRange,
    updateFilters,
    resetFilters,
  ]);

  useOnce(() => {
    const storedFilters = localStorage.getItem(STORAGE_KEYS.FILTERS.PURCHASE_ORDERS);
    if (storedFilters) {
      const parsedFilters = POFiltersSchema.safeParse(JSON.parse(storedFilters));
      if (parsedFilters.success) {
        setFilters(parsedFilters.data as POFilters);
      } else {
        setFilters(generateDefaultFilters());
      }
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FILTERS.PURCHASE_ORDERS, JSON.stringify(filters));
  }, [filters]);

  return { filters, filterHandlers, hasActiveFilters };
}

function generateDefaultFilters(): POFilters {
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  return {
    searchQuery: '',
    customerId: undefined,
    salesId: undefined,
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
      start: startOfDay(new Date()),
      end: endOfDay(new Date(Date.now() + ONE_WEEK)),
    },
  };
}
