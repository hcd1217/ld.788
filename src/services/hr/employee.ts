import { hrApi } from '@/lib/api';
import { renderFullName } from '@/utils/string';

import { overviewService } from '../client/overview';

export type WorkType = 'FULL_TIME' | 'PART_TIME';

export type Department = {
  id: string;
  name: string;
};

export type Employee = {
  id: string;
  loginIdentifier?: string;
  userId?: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  fullName: string;
  email?: string;
  phone?: string;
  workType?: WorkType;
  monthlySalary?: number;
  hourlyRate?: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  departmentId?: string;
  department?: string;
  position?: string;
  displayOrder?: number;
};

export const employeeService = {
  employees: undefined as Employee[] | undefined,
  async getAllEmployee(): Promise<Employee[]> {
    if (this.employees) {
      return this.employees;
    }
    const response = await hrApi.getEmployees();
    const employees = _sortEmployees(response.employees);

    const overviewData = await overviewService.getOverviewData();
    const departmentMap = new Map(
      overviewData.departments.map((department) => [department.id, department.name]),
    );

    this.employees = employees.map((employee) => {
      const fullName = renderFullName(employee);
      const workType = employee.employmentType === 'PART_TIME' ? 'PART_TIME' : 'FULL_TIME';
      return {
        ...employee,
        fullName,
        departmentId: employee.departmentId,
        department: departmentMap.get(employee.departmentId ?? ''),
        workType,
        phone: employee.phoneNumber,
        monthlySalary: employee.metadata?.monthlySalary,
        hourlyRate: employee.metadata?.hourRate,
        displayOrder: employee.metadata?.displayOrder,
        position: employee.metadata?.positionName ?? '',
      };
    });
    return this.employees;
  },

  async getEmployee(id: string): Promise<Employee | undefined> {
    const employees = await this.getAllEmployee();
    return employees.find((emp) => emp.id === id);
  },

  clearCache() {
    this.employees = undefined;
  },

  async addEmployee(employee: {
    firstName: string;
    lastName: string;
    departmentId?: string | undefined;
    email?: string;
    phone?: string;
    workType?: WorkType;
    position?: string;
    monthlySalary?: number;
    hourlyRate?: number;
    startDate?: Date;
  }) {
    await hrApi.addEmployee({
      firstName: employee.firstName,
      lastName: employee.lastName,
      departmentId: employee.departmentId,
      phoneNumber: employee.phone,
      employmentType: employee.workType ?? 'FULL_TIME',
      metadata: {
        hourRate: employee.workType === 'FULL_TIME' ? undefined : employee.hourlyRate,
        monthlySalary: employee.workType === 'FULL_TIME' ? employee.monthlySalary : undefined,
        positionName: employee.position,
      },
    });
    this.clearCache();
  },

  async addBulkEmployees(
    employees: Array<{
      firstName: string;
      lastName: string;
      phone?: string;
      departmentId?: string | undefined;
      workType?: WorkType;
      monthlySalary?: number;
      hourlyRate?: number;
      position?: string;
    }>,
  ) {
    await hrApi.addBulkEmployees({
      employees: employees.map((employee) => ({
        firstName: employee.firstName,
        lastName: employee.lastName,
        phoneNumber: employee.phone,
        departmentId: employee.departmentId,
        employmentType: employee.workType ?? 'FULL_TIME',
        metadata: {
          hourRate: employee.workType === 'FULL_TIME' ? undefined : employee.hourlyRate,
          monthlySalary: employee.workType === 'FULL_TIME' ? employee.monthlySalary : undefined,
          positionName: employee.position,
        },
      })),
    });
    this.clearCache();
  },

  async deactivateEmployee(id: string) {
    // First deactivate the employee
    await hrApi.deactivateEmployee(id);
    this.clearCache();
  },

  async activateEmployee(id: string) {
    await hrApi.activateEmployee(id);
    this.clearCache();
  },

  async updateEmployee(
    id: string,
    employee: {
      firstName: string;
      lastName: string;
      departmentId?: string | undefined;
      email?: string;
      phone?: string;
      workType?: WorkType;
      monthlySalary?: number;
      hourlyRate?: number;
      startDate: Date;
      endDate?: Date;
      displayOrder?: number;
      position?: string;
    },
  ) {
    await hrApi.updateEmployee(id, {
      firstName: employee.firstName,
      lastName: employee.lastName,
      departmentId: employee.departmentId,
      employmentType: employee.workType,
      phoneNumber: employee.phone,
      email: employee.email,
      metadata: {
        displayOrder: employee.displayOrder,
        hourRate: employee.workType === 'FULL_TIME' ? undefined : employee.hourlyRate,
        monthlySalary: employee.workType === 'FULL_TIME' ? employee.monthlySalary : undefined,
        positionName: employee.position,
      },
    });
    this.clearCache();
  },
};

function _sortEmployees<
  T extends {
    metadata?: {
      displayOrder?: number;
    };
    isActive?: boolean;
    createdAt: Date;
  },
>(employees: T[]) {
  return employees.sort((a, b) => {
    {
      const _a = a.metadata?.displayOrder ?? 1e9;
      const _b = b.metadata?.displayOrder ?? 1e9;
      if (_a !== _b) {
        return _a - _b;
      }
    }

    {
      const _a = a.isActive ? 1 : -1;
      const _b = b.isActive ? 1 : -1;
      if (_a !== _b) {
        return _b - _a;
      }
    }

    const _a = a.createdAt.getTime();
    const _b = b.createdAt.getTime();
    return _b - _a;
  });
}
