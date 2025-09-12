import { useCallback, useMemo, useState } from 'react';

import { EMPLOYEE_STATUS, type EmployeeStatusType } from '@/constants/employee';
import type { Employee } from '@/services/hr/employee';

export interface EmployeeFilters {
  searchQuery: string;
  unitId: string | undefined;
  status: EmployeeStatusType;
}

export interface EmployeeFilterHandlers {
  setSearchQuery: (query: string) => void;
  setUnitId: (unitId: string | undefined) => void;
  setStatus: (status: EmployeeStatusType) => void;
  updateFilters: (updates: Partial<EmployeeFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: EmployeeFilters = {
  searchQuery: '',
  unitId: undefined,
  status: EMPLOYEE_STATUS.ALL,
};

export function useEmployeeFilters(employees: readonly Employee[]) {
  const [filters, setFilters] = useState<EmployeeFilters>(defaultFilters);

  const hasActiveFilters = useMemo(() => {
    if (filters.unitId) {
      return true;
    }
    if (defaultFilters.status !== filters.status) {
      return true;
    }
    if (defaultFilters.searchQuery !== filters.searchQuery) {
      return true;
    }
    return false;
  }, [filters]);

  const filterHandlers: EmployeeFilterHandlers = useMemo(() => {
    return {
      setSearchQuery: (query: string) => {
        setFilters((prev) => ({ ...prev, searchQuery: query }));
      },

      setUnitId: (unitId: string | undefined) => {
        setFilters((prev) => ({ ...prev, unitId }));
      },

      setStatus: (status: EmployeeStatusType) => {
        setFilters((prev) => ({ ...prev, status }));
      },

      updateFilters: (updates: Partial<EmployeeFilters>) => {
        setFilters((prev) => ({ ...prev, ...updates }));
      },

      resetFilters: () => {
        setFilters(defaultFilters);
      },
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const { searchQuery, unitId, status } = filters;

      // Status filter
      if (status !== EMPLOYEE_STATUS.ALL) {
        const isActive = status === EMPLOYEE_STATUS.ACTIVE;
        if (employee.isActive !== isActive) {
          return false;
        }
      }

      // Department filter
      if (unitId && employee.unitId !== unitId) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
        const matchesSearch =
          employee.firstName.toLowerCase().includes(lowerQuery) ||
          employee.lastName.toLowerCase().includes(lowerQuery) ||
          fullName.includes(lowerQuery);
        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });
  }, [employees, filters]);

  const clearAllFilters = useCallback(() => {
    filterHandlers.setSearchQuery('');
    filterHandlers.setUnitId(undefined);
    filterHandlers.setStatus(EMPLOYEE_STATUS.ALL);
  }, [filterHandlers]);

  return { filteredEmployees, filters, filterHandlers, hasActiveFilters, clearAllFilters };
}
