import { useState, useMemo, useCallback } from 'react';
import type { Employee } from '@/services/hr/employee';
import { EMPLOYEE_STATUS, type EmployeeStatusType } from '@/constants/employee';

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

export function useEmployeeFilters(
  employees: readonly Employee[],
): [Employee[], EmployeeFilters, EmployeeFilterHandlers] {
  const [filters, setFilters] = useState<EmployeeFilters>(defaultFilters);

  const handlers: EmployeeFilterHandlers = {
    setSearchQuery: useCallback((query: string) => {
      setFilters((prev) => ({ ...prev, searchQuery: query }));
    }, []),

    setUnitId: useCallback((unitId: string | undefined) => {
      setFilters((prev) => ({ ...prev, unitId }));
    }, []),

    setStatus: useCallback((status: EmployeeStatusType) => {
      setFilters((prev) => ({ ...prev, status }));
    }, []),

    updateFilters: useCallback((updates: Partial<EmployeeFilters>) => {
      setFilters((prev) => ({ ...prev, ...updates }));
    }, []),

    resetFilters: useCallback(() => {
      setFilters(defaultFilters);
    }, []),
  };

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

  return [filteredEmployees, filters, handlers];
}
