import { unitService } from './unit';
import { positionService } from './position';
import { hrApi } from '@/lib/api';
import { renderFullName } from '@/utils/string';
import { shuffleArray } from '@/utils/fake';

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
  metadata?:
  | {
    position?: string;
  }
  | undefined;
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
    const endDateStatus = [
      'normal',
      'normal',
      ...shuffleArray([
        'ended',
        'ended',
        'end-soon',
        ...Array.from({
          length: employees.length - 4
        }).map(() => 'normal')
      ]),
    ]
    return employees.map((employee, idx) => {
      const position = positionMap.get(employee.positionId ?? '');
      const fullName = renderFullName(employee);
      const fullNameWithPosition = position
        ? `${fullName} (${position})`
        : undefined;
      const workType = Math.random() > 0.5 ? "FULL_TIME" : "PART_TIME"
      let endDate: Date | undefined =  undefined
      switch (endDateStatus[idx]) {
        case 'normal':
          break;
        case 'ended':
          endDate = new Date('2025-06-15')
          break;
        case 'end-soon':
          endDate = new Date('2025-08-27')
          break;
        default:
          break;
      }
      return {
        ...employee,
        fullName,
        fullNameWithPosition,
        position,
        unitId: employee.departmentId,
        unit: unitMap.get(employee.departmentId ?? ''),
        // email?: string;
        phone: `0901-${Math.floor(Math.random() * 1e3)}-${Math.floor(Math.random() * 1e3)}`,
        workType,
        monthlySalary: workType === "FULL_TIME" ? 12000000 : undefined,
        hourlyRate: workType === "FULL_TIME" ? undefined : 25000,
        startDate: new Date('2020-12-23'),
        endDate,
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
    });
    // The additional fields would be handled by the API in a real implementation
  },

  async addBulkEmployees(
    employees: Array<{
      firstName: string;
      lastName: string;
      unitId?: string | undefined;
    }>,
  ) {
    await hrApi.addBulkEmployees({
      employees: employees.map((employee) => ({
        firstName: employee.firstName,
        lastName: employee.lastName,
        departmentId: employee.unitId,
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
    return employees.find(emp => emp.id === id);
  },

  async updateEmployee(id: string, employee: {
    firstName: string;
    lastName: string;
    unitId?: string | undefined;
    email?: string;
    phone?: string;
    workType?: WorkType;
    monthlySalary?: number;
    hourlyRate?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    // In a real implementation, this would call the API
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    console.log('Updating employee:', id, employee);
  },
};
