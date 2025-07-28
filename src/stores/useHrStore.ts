import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {hrApi, ApiError} from '@/lib/api';
import type {Department, Employee} from '@/lib/api/schemas/hr.schemas';

type HrState = {
  // Employee data
  employees: Employee[];
  // Departments: Department[];
  departments: Department[];
  departmentMap: Map<string, Department>;
  currentEmployee: Employee | undefined;
  isLoading: boolean;
  error: string | undefined;

  // Actions
  setCurrentEmployee: (employee: Employee | undefined) => void;
  loadEmployees: (force?: boolean) => Promise<void>;
  loadDepartments: () => Promise<void>;
  refreshEmployees: () => Promise<void>;
  deactivateEmployee: (id: string) => Promise<void>;
  activateEmployee: (id: string) => Promise<void>;
  clearError: () => void;

  // Selectors
  getEmployeeById: (id: string) => Employee | undefined;
  getDepartmentById: (id: string) => Department | undefined;
};

export const useHrStore = create<HrState>()(
  devtools(
    (set, get) => ({
      // Initial state
      employees: [],
      departments: [],
      departmentMap: new Map(),
      currentEmployee: undefined,
      isLoading: false,
      error: undefined,

      // Actions
      setCurrentEmployee(employee) {
        set({currentEmployee: employee, error: undefined});
      },

      async loadDepartments() {
        set({isLoading: true, error: undefined});
        try {
          const response = await hrApi.getDepartments();

          set({
            departments: response.departments,
            departmentMap: new Map(
              response.departments.map((department) => [
                department.id,
                department,
              ]),
            ),
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof ApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : 'Failed to load departments';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async loadEmployees(force = false) {
        if (get().employees.length > 0 && !force) {
          return;
        }

        set({isLoading: true, error: undefined});
        try {
          console.log('get data');
          // Load both employees and departments in parallel
          const [employeesResponse, departmentsResponse] = await Promise.all([
            hrApi.getEmployees(),
            hrApi.getDepartments(),
          ]);
          console.log('get data done', employeesResponse, departmentsResponse);
          const now = Date.now();
          set({
            isLoading: false,
            employees: employeesResponse.employees.sort((a, b) => {
              const x = (a.isActive ? 1 : -1) * now + a.createdAt.getTime();
              const y = (b.isActive ? 1 : -1) * now + b.createdAt.getTime();
              return y - x;
            }),
            departments: departmentsResponse.departments,
            departmentMap: new Map(
              departmentsResponse.departments.map((department) => [
                department.id,
                department,
              ]),
            ),
          });
        } catch (error) {
          const errorMessage =
            error instanceof ApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : 'Failed to load employees';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        } finally {
          set({isLoading: false});
        }
      },

      async refreshEmployees() {
        return get().loadEmployees(true);
      },

      async deactivateEmployee(id: string) {
        // Optimistic update: mark employee as inactive immediately
        const {employees} = get();
        const employeeToDeactivate = employees.find((e) => e.id === id);

        if (!employeeToDeactivate) {
          throw new Error('Employee not found');
        }

        // Save current state for rollback
        const previousEmployees = employees;

        // Optimistically update state
        const updatedEmployees = employees.map((e) =>
          e.id === id ? {...e, isActive: false} : e,
        );

        set({
          employees: updatedEmployees,
          isLoading: true,
          error: undefined,
        });

        try {
          // Actually deactivate on server (soft delete)
          await hrApi.deactivateEmployee(id);

          set({isLoading: false});

          // Refresh in background to sync with server state
          get()
            .loadEmployees()
            .catch((error) => {
              console.error('Background refresh failed:', error);
            });
        } catch (error) {
          // Rollback on error
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to deactivate employee';

          set({
            employees: previousEmployees,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async activateEmployee(id: string) {
        // Optimistic update: mark employee as active immediately
        const {employees} = get();
        const employeeToActivate = employees.find((e) => e.id === id);

        if (!employeeToActivate) {
          throw new Error('Employee not found');
        }

        // Save current state for rollback
        const previousEmployees = employees;

        // Optimistically update state
        const updatedEmployees = employees.map((e) =>
          e.id === id ? {...e, isActive: true} : e,
        );

        set({
          employees: updatedEmployees,
          isLoading: true,
          error: undefined,
        });

        try {
          // Actually activate on server
          await hrApi.activateEmployee(id);

          set({isLoading: false});

          // Refresh in background to sync with server state
          get()
            .loadEmployees()
            .catch((error) => {
              console.error('Background refresh failed:', error);
            });
        } catch (error) {
          // Rollback on error
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to activate employee';

          set({
            employees: previousEmployees,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      clearError() {
        set({error: undefined});
      },

      // Selectors
      getEmployeeById(id) {
        return get().employees.find((employee) => employee.id === id);
      },

      getDepartmentById(id) {
        return get().departmentMap.get(id);
      },
    }),
    {
      name: 'hr-store',
    },
  ),
);

// Computed selectors for convenience
export const useCurrentEmployee = () =>
  useHrStore((state) => state.currentEmployee);
export const useEmployeeList = () => useHrStore((state) => state.employees);
export const useDepartmentList = () => useHrStore((state) => state.departments);
export const useHrLoading = () => useHrStore((state) => state.isLoading);
export const useHrError = () => useHrStore((state) => state.error);

// Helper hooks for HR operations
export const useHrActions = () => {
  const store = useHrStore();
  return {
    setCurrentEmployee: store.setCurrentEmployee,
    loadEmployees: store.loadEmployees,
    loadDepartments: store.loadDepartments,
    refreshEmployees: store.refreshEmployees,
    deactivateEmployee: store.deactivateEmployee,
    activateEmployee: store.activateEmployee,
    clearError: store.clearError,
    getEmployeeById: store.getEmployeeById,
    getDepartmentById: store.getDepartmentById,
  };
};
