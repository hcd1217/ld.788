import { hrApi, userApi } from '@/lib/api';
import { renderFullName } from '@/utils/string';

import { overviewService } from '../client/overview';

export type WorkType = 'FULL_TIME' | 'PART_TIME';

export type Unit = {
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
  unitId?: string;
  unit?: string;
  positionId?: string;
  position?: string;
  displayOrder?: number;
};

export const employeeService = {
  employees: [] as Employee[],
  async getAllEmployee(): Promise<Employee[]> {
    if (this.employees.length > 0) {
      return this.employees;
    }
    const response = await hrApi.getEmployees();
    const employees = response.employees.sort((a, b) => {
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

    const overviewData = await overviewService.getOverviewData();
    const employeeMap = new Map(overviewData.employees.map((employee) => [employee.id, employee]));
    const departmentMap = new Map(
      overviewData.departments.map((department) => [department.id, department.name]),
    );

    this.employees = employees.map((employee) => {
      const position = employeeMap.get(employee.id ?? '')?.positionName;
      const fullName = renderFullName(employee);
      const workType = employee.employmentType === 'PART_TIME' ? 'PART_TIME' : 'FULL_TIME';
      return {
        ...employee,
        startDate: employee.hireDate,
        fullName,
        position,
        unitId: employee.departmentId,
        unit: departmentMap.get(employee.departmentId ?? ''),
        workType,
        phone: employee.phoneNumber,
        monthlySalary: employee.metadata?.monthlySalary,
        hourlyRate: employee.metadata?.hourRate,
        endDate: employee.terminationDate,
        displayOrder: employee.metadata?.displayOrder,
      };
    });
    return this.employees;
  },

  async getEmployee(id: string): Promise<Employee | undefined> {
    const employees = await this.getAllEmployee();
    return employees.find((emp) => emp.id === id);
  },

  clearCache() {
    this.employees = [];
  },

  async addEmployee(employee: {
    firstName: string;
    lastName: string;
    unitId?: string | undefined;
    email?: string;
    phone?: string;
    workType?: WorkType;
    monthlySalary?: number;
    hourlyRate?: number;
    startDate?: Date;
  }) {
    await hrApi.addEmployee({
      firstName: employee.firstName,
      lastName: employee.lastName,
      departmentId: employee.unitId,
      phoneNumber: employee.phone,
      employmentType: employee.workType ?? 'FULL_TIME',
      metadata: {
        hourRate: employee.workType === 'FULL_TIME' ? undefined : employee.hourlyRate,
        monthlySalary: employee.workType === 'FULL_TIME' ? employee.monthlySalary : undefined,
      },
    });
    this.clearCache();
  },

  async addBulkEmployees(
    employees: Array<{
      firstName: string;
      lastName: string;
      phone?: string;
      unitId?: string | undefined;
      workType?: WorkType;
      monthlySalary?: number;
      hourlyRate?: number;
    }>,
  ) {
    await hrApi.addBulkEmployees({
      employees: employees.map((employee) => ({
        firstName: employee.firstName,
        lastName: employee.lastName,
        phoneNumber: employee.phone,
        departmentId: employee.unitId,
        employmentType: employee.workType ?? 'FULL_TIME',
        metadata: {
          hourRate: employee.workType === 'FULL_TIME' ? undefined : employee.hourlyRate,
          monthlySalary: employee.workType === 'FULL_TIME' ? employee.monthlySalary : undefined,
        },
      })),
    });
    this.clearCache();
  },

  async deactivateEmployee(id: string) {
    // First deactivate the employee
    await hrApi.deactivateEmployee(id);
    // Get employee details to find userId
    const employee = await this.getEmployee(id);
    if (employee?.userId) {
      await userApi.revokeUserSessions(employee.userId);
    }
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
      unitId?: string | undefined;
      email?: string;
      phone?: string;
      workType?: WorkType;
      monthlySalary?: number;
      hourlyRate?: number;
      startDate: Date;
      endDate?: Date;
      displayOrder?: number;
    },
  ) {
    await hrApi.updateEmployee(id, {
      firstName: employee.firstName,
      lastName: employee.lastName,
      departmentId: employee.unitId,
      employmentType: employee.workType,
      phoneNumber: employee.phone,
      email: employee.email,
      hireDate: new Date(employee.startDate).toISOString(),
      terminationDate: employee.endDate ? new Date(employee.endDate).toISOString() : undefined,
      metadata: {
        displayOrder: employee.displayOrder,
        hourRate: employee.workType === 'FULL_TIME' ? undefined : employee.hourlyRate,
        monthlySalary: employee.workType === 'FULL_TIME' ? employee.monthlySalary : undefined,
      },
    });
    this.clearCache();
  },
};
