import * as React from 'react';
import { useIsDesktop } from './useIsDesktop';
import { useAppStore } from '@/stores/useAppStore';
// Ref: https://stackoverflow.com/a/78696557

export interface PaginationOptions<T, TFilters = { searchQuery?: string }> {
  readonly data: readonly T[];
  readonly defaultPageSize?: number;
  readonly filterFn?: (item: T, filters: TFilters) => boolean;
  readonly filters?: TFilters;
}

export interface PaginationState {
  readonly currentPage: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly totalItems: number;
}

export interface PaginationHandlers {
  readonly setCurrentPage: (page: number) => void;
  readonly setPageSize: (size: number) => void;
  readonly nextPage: () => void;
  readonly previousPage: () => void;
  readonly firstPage: () => void;
  readonly lastPage: () => void;
}

export function useClientSidePagination<T, TFilters = { searchQuery?: string }>({
  data,
  defaultPageSize,
  filterFn,
  filters,
}: PaginationOptions<T, TFilters>): [readonly T[], PaginationState, PaginationHandlers] {
  const { config } = useAppStore();
  const isDesktop = useIsDesktop();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSizeState] = React.useState((defaultPageSize ?? 1e3).toString());

  React.useEffect(() => {
    setPageSizeState(
      (
        defaultPageSize ??
        (isDesktop
          ? config.pagination.desktop.defaultPageSize
          : config.pagination.mobile.defaultPageSize)
      ).toString(),
    );
  }, [
    config.pagination.desktop.defaultPageSize,
    config.pagination.mobile.defaultPageSize,
    defaultPageSize,
    isDesktop,
  ]);

  // Filter data based on filters
  const filteredData = React.useMemo(() => {
    if (!filters || !filterFn) {
      return data;
    }

    return data.filter((item) => filterFn(item, filters));
  }, [data, filters, filterFn]);

  // Calculate pagination values
  const totalPages = React.useMemo(() => {
    const size = Number.parseInt(pageSize, 10);
    return Math.ceil(filteredData.length / size) || 1;
  }, [filteredData.length, pageSize]);

  // Get paginated data
  const paginatedData = React.useMemo(() => {
    const size = Number.parseInt(pageSize, 10);
    const startIndex = (currentPage - 1) * size;
    const endIndex = startIndex + size;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Ensure current page is valid when total pages change
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Handlers
  const handlePageSizeChange = React.useCallback((size: number) => {
    if (size > 0) {
      setPageSizeState(size.toString());
      setCurrentPage(1); // Reset to first page when page size changes
    }
  }, []);

  const handleSetCurrentPage = React.useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages],
  );

  const nextPage = React.useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const previousPage = React.useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const firstPage = React.useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = React.useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const paginationState: PaginationState = {
    currentPage,
    pageSize: Number.parseInt(pageSize, 10),
    totalPages,
    totalItems: filteredData.length,
  };

  const paginationHandlers: PaginationHandlers = {
    setCurrentPage: handleSetCurrentPage,
    setPageSize: handlePageSizeChange,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
  };

  return [paginatedData, paginationState, paginationHandlers] as const;
}
