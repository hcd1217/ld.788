import { unitService } from './unit';
import { positionService } from './position';
import { hrApi } from '@/lib/api';
import { renderFullName } from '@/utils/string';

export type WorkType = 'FULL_TIME' | 'PART_TIME';

export type Employee = {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  fullName: string;
  fullNameWithPosition?: string;
  email?: string;
  phone?: string;
  workType?: WorkType;
  monthlySalary?: number;
  hourlyRate?: number;
  startDate?: Date;
  endDate?: Date;
  // isProbation?: boolean;
  // probationEndDate?: Date;
  // probationReason?: string;
  // probationStatus?: string;
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
    const units = await unitService.getUnits();
    const unitMap = new Map(units.map((u) => [u.id, u.name]));
    const positions = await positionService.getPositions();
    const positionMap = new Map(positions.map((p) => [p.id, p.title]));
    return employees.map((employee) => {
      const position = positionMap.get(employee.positionId ?? '');
      const fullName = renderFullName(employee);
      const fullNameWithPosition = position ? `${fullName} (${position})` : undefined;
      const workType = employee.employmentType === 'PART_TIME' ? 'PART_TIME' : 'FULL_TIME';
      return {
        ...employee,
        startDate: employee.hireDate,
        fullName,
        fullNameWithPosition,
        position,
        unitId: employee.departmentId,
        unit: unitMap.get(employee.departmentId ?? ''),
        workType,
        phone: employee.phoneNumber,
        monthlySalary: employee.metadata?.monthlySalary,
        hourlyRate: employee.metadata?.hourRate,
        endDate: employee.terminationDate,
        displayOrder: employee.metadata?.displayOrder,
      };
    });
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
    // The additional fields would be handled by the API in a real implementation
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
  },

  async deactivateEmployee(id: string) {
    await hrApi.deactivateEmployee(id);
  },

  async activateEmployee(id: string) {
    await hrApi.activateEmployee(id);
  },

  async getEmployee(id: string): Promise<Employee | undefined> {
    const employees = await this.getAllEmployee();
    return employees.find((emp) => emp.id === id);
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
  },
};
