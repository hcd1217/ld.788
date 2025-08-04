import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { employeeService, type Employee } from '@/services/hr/employee';
import { unitService, type Unit } from '@/services/hr/unit';
import { getErrorMessage } from '@/utils/errorUtils';
import { useMemo } from 'react';

type HrState = {
  // Employee data
  employees: Employee[];
  units: Unit[];
  unitMap: Map<string, Unit>;
  currentEmployee: Employee | undefined;
  isLoading: boolean;
  error: string | undefined;

  // Actions
  setCurrentEmployee: (employee: Employee | undefined) => void;
  loadEmployees: (force?: boolean) => Promise<void>;
  loadUnits: () => Promise<void>;
  refreshEmployees: () => Promise<void>;
  deactivateEmployee: (id: string) => Promise<void>;
  activateEmployee: (id: string) => Promise<void>;
  addEmployee: (employee: {
    firstName: string;
    lastName: string;
    unitId?: string | undefined;
    email?: string;
    phone?: string;
    workType?: 'FULL_TIME' | 'PART_TIME';
    monthlySalary?: number;
    hourlyRate?: number;
    startDate?: Date;
  }) => Promise<void>;
  addBulkEmployees: (
    employees: Array<{
      firstName: string;
      lastName: string;
      unitId?: string | undefined;
    }>,
  ) => Promise<void>;
  clearError: () => void;

  // Selectors
  getEmployeeById: (id: string) => Employee | undefined;
};

export const useHrStore = create<HrState>()(
  devtools(
    (set, get) => ({
      // Initial state
      employees: [],
      units: [],
      unitMap: new Map(),
      currentEmployee: undefined,
      isLoading: false,
      error: undefined,

      // Actions
      setCurrentEmployee(employee) {
        set({ currentEmployee: employee, error: undefined });
      },

      async loadUnits() {
        set({ error: undefined });
        try {
          const units = await unitService.getUnits();

          set({
            units,
            unitMap: new Map(units.map((unit) => [unit.id, unit])),
          });
        } catch (error) {
          set({
            error: getErrorMessage(error, 'Failed to load units'),
          });
        }
      },

      async loadEmployees(force = false) {
        if (get().employees.length > 0 && !force) {
          return;
        }

        set({ isLoading: true, error: undefined });
        try {
          // Load both employees and units in parallel
          const [employees, units] = await Promise.all([
            employeeService.getAllEmployee(),
            unitService.getUnits(),
          ]);
          set({
            isLoading: false,
            employees,
            units,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Failed to load employees'),
          });
        }
      },

      async refreshEmployees() {
        return get().loadEmployees(true);
      },

      async deactivateEmployee(id: string) {
        // Optimistic update: mark employee as inactive immediately
        const { employees } = get();
        const employeeToDeactivate = employees.find((e) => e.id === id);

        if (!employeeToDeactivate) {
          throw new Error('Employee not found');
        }

        // Save current state for rollback
        const previousEmployees = employees;

        // Optimistically update state
        const updatedEmployees = employees.map((e) =>
          e.id === id ? { ...e, isActive: false } : e,
        );

        set({
          employees: updatedEmployees,
          isLoading: true,
          error: undefined,
        });

        try {
          // Actually deactivate on server (soft delete)
          await employeeService.deactivateEmployee(id);

          set({ isLoading: false });

          // Refresh in background to sync with server state
          get()
            .loadEmployees()
            .catch((error) => {
              console.error('Background refresh failed:', error);
            });
        } catch (error) {
          // Rollback on error
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to deactivate employee';

          set({
            employees: previousEmployees,
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      async activateEmployee(id: string) {
        // Optimistic update: mark employee as active immediately
        const { employees } = get();
        const employeeToActivate = employees.find((e) => e.id === id);

        if (!employeeToActivate) {
          throw new Error('Employee not found');
        }

        // Save current state for rollback
        const previousEmployees = employees;

        // Optimistically update state
        const updatedEmployees = employees.map((e) => (e.id === id ? { ...e, isActive: true } : e));

        set({
          employees: updatedEmployees,
          isLoading: true,
          error: undefined,
        });

        try {
          // Actually activate on server
          await employeeService.activateEmployee(id);

          set({ isLoading: false });

          // Refresh in background to sync with server state
          get()
            .loadEmployees()
            .catch((error) => {
              console.error('Background refresh failed:', error);
            });
        } catch (error) {
          // Rollback on error
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to activate employee';

          set({
            employees: previousEmployees,
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      async addEmployee(employee: {
        firstName: string;
        lastName: string;
        unitId?: string | undefined;
        email?: string;
        phone?: string;
        workType?: 'FULL_TIME' | 'PART_TIME';
        monthlySalary?: number;
        hourlyRate?: number;
        startDate?: Date;
      }) {
        set({ isLoading: true, error: undefined });

        try {
          // Add employee on server
          await employeeService.addEmployee(employee);

          set({ isLoading: false });

          // Force reload employee list to include the new employee
          await get().loadEmployees(true);
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Failed to add employee'),
          });
        }
      },

      async addBulkEmployees(
        employees: Array<{
          firstName: string;
          lastName: string;
          unitId?: string | undefined;
        }>,
      ) {
        set({ isLoading: true, error: undefined });

        try {
          // Add multiple employees on server
          await employeeService.addBulkEmployees(employees);

          set({ isLoading: false });

          // Force reload employee list to include the new employees
          await get().loadEmployees(true);
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error, 'Failed to add employee'),
          });
        }
      },

      clearError() {
        set({ error: undefined });
      },

      // Selectors
      getEmployeeById(id) {
        return get().employees.find((employee) => employee.id === id);
      },
    }),
    {
      name: 'hr-store',
    },
  ),
);

// Computed selectors for convenience
export const useCurrentEmployee = () => useHrStore((state) => state.currentEmployee);
export const useEmployeeList = () => useHrStore((state) => state.employees);
export const useUnitList = () => useHrStore((state) => state.units);
export const useHrLoading = () => useHrStore((state) => state.isLoading);
export const useHrError = () => useHrStore((state) => state.error);

// Helper hooks for HR operations
export const useHrActions = () => {
  const setCurrentEmployee = useHrStore((state) => state.setCurrentEmployee);
  const loadEmployees = useHrStore((state) => state.loadEmployees);
  const loadUnits = useHrStore((state) => state.loadUnits);
  const refreshEmployees = useHrStore((state) => state.refreshEmployees);
  const deactivateEmployee = useHrStore((state) => state.deactivateEmployee);
  const activateEmployee = useHrStore((state) => state.activateEmployee);
  const addEmployee = useHrStore((state) => state.addEmployee);
  const addBulkEmployees = useHrStore((state) => state.addBulkEmployees);
  const clearError = useHrStore((state) => state.clearError);
  const getEmployeeById = useHrStore((state) => state.getEmployeeById);

  return useMemo(
    () => ({
      setCurrentEmployee,
      loadEmployees,
      loadUnits,
      refreshEmployees,
      deactivateEmployee,
      activateEmployee,
      addEmployee,
      addBulkEmployees,
      clearError,
      getEmployeeById,
    }),
    [
      setCurrentEmployee,
      loadEmployees,
      loadUnits,
      refreshEmployees,
      deactivateEmployee,
      activateEmployee,
      addEmployee,
      addBulkEmployees,
      clearError,
      getEmployeeById,
    ],
  );
};
