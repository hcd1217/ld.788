import {useState, useMemo, useCallback} from 'react';

export interface TableFilters {
  searchQuery: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export interface TableFilterHandlers {
  setSearchQuery: (query: string) => void;
  setSortBy: (field: string) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  toggleSort: (field: string) => void;
  resetFilters: () => void;
}

export function useTableFilters<T extends Record<string, unknown>>(
  data: readonly T[],
  searchFields: ReadonlyArray<keyof T>,
  defaultSortBy?: keyof T,
): [T[], TableFilters, TableFilterHandlers] {
  const [filters, setFilters] = useState<TableFilters>({
    searchQuery: '',
    sortBy: defaultSortBy ? String(defaultSortBy) : '',
    sortDirection: 'asc',
  });

  const handlers: TableFilterHandlers = {
    setSearchQuery: useCallback((query: string) => {
      setFilters((prev) => ({...prev, searchQuery: query}));
    }, []),

    setSortBy: useCallback((field: string) => {
      setFilters((prev) => ({...prev, sortBy: field}));
    }, []),

    setSortDirection: useCallback((direction: 'asc' | 'desc') => {
      setFilters((prev) => ({...prev, sortDirection: direction}));
    }, []),

    toggleSort: useCallback((field: string) => {
      setFilters((prev) => {
        if (prev.sortBy === field) {
          // If clicking the same field, toggle direction
          return {
            ...prev,
            sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc',
          };
        }

        // If clicking a different field, set it as sort field with asc direction
        return {
          ...prev,
          sortBy: field,
          sortDirection: 'asc',
        };
      });
    }, []),

    resetFilters: useCallback(() => {
      setFilters({
        searchQuery: '',
        sortBy: defaultSortBy ? String(defaultSortBy) : '',
        sortDirection: 'asc',
      });
    }, [defaultSortBy]),
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter((item) => {
        return searchFields.some((field) => {
          const value = item[field];
          if (value === null || value === undefined) return false;

          // Handle different data types
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query);
          }

          if (typeof value === 'number') {
            return value.toString().includes(query);
          }

          if (typeof value === 'boolean') {
            return String(value).toLowerCase().includes(query);
          }

          // For objects, try to convert to string
          return JSON.stringify(value).toLowerCase().includes(query);
        });
      });
    }

    // Apply sorting
    if (filters.sortBy) {
      result.sort((a, b) => {
        const aValue = a[filters.sortBy];
        const bValue = b[filters.sortBy];

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        // Compare based on type
        let comparison = 0;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          comparison = Number(aValue) - Number(bValue);
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          // Fallback to string comparison
          const aString =
            typeof aValue === 'string' || typeof aValue === 'number'
              ? String(aValue)
              : JSON.stringify(aValue);
          const bString =
            typeof bValue === 'string' || typeof bValue === 'number'
              ? String(bValue)
              : JSON.stringify(bValue);
          comparison = aString.localeCompare(bString);
        }

        // Apply sort direction
        return filters.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchFields, filters]);

  return [filteredAndSortedData, filters, handlers];
}
