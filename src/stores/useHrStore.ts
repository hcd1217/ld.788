import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {hrApi, ApiError} from '@/lib/api';
import type {Department, Employee} from '@/lib/api/schemas/hr.schemas';

type HrState = {
  // Employee data
  employees: Employee[];
  // Departments: Department[];
  departmentMap: Map<string, Department>;
  currentEmployee: Employee | undefined;
  isLoading: boolean;
  error: string | undefined;

  // Actions
  setCurrentEmployee: (employee: Employee | undefined) => void;
  loadEmployees: () => Promise<void>;
  loadDepartments: () => Promise<void>;
  refreshEmployees: () => Promise<void>;
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

      async loadEmployees() {
        set({isLoading: true, error: undefined});
        try {
          // Load both employees and departments in parallel
          const [employeesResponse, departmentsResponse] = await Promise.all([
            hrApi.getEmployees(),
            hrApi.getDepartments(),
          ]);

          set({
            employees: employeesResponse.employees,
            departmentMap: new Map(
              departmentsResponse.departments.map((department) => [
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
                : 'Failed to load employees';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      async refreshEmployees() {
        return get().loadEmployees();
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
export const useDepartmentList = () =>
  useHrStore((state) => [...state.departmentMap.values()]);
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
    clearError: store.clearError,
    getEmployeeById: store.getEmployeeById,
    getDepartmentById: store.getDepartmentById,
  };
};
