import {unitService} from './unit';
import {positionService} from './position';
import {hrApi} from '@/lib/api';
import {renderFullName} from '@/utils/string';

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  fullNameWithPosition?: string;
  employeeCode: string;
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
    return employees.map((employee) => {
      const position = positionMap.get(employee.positionId ?? '');
      const fullName = renderFullName(employee);
      const fullNameWithPosition = position
        ? `${fullName} (${position})`
        : undefined;
      return {
        ...employee,
        fullName,
        fullNameWithPosition,
        position,
        unitId: employee.departmentId,
        unit: unitMap.get(employee.departmentId ?? ''),
      };
    });
  },

  async addEmployee(employee: {
    firstName: string;
    lastName: string;
    unitId?: string | undefined;
  }) {
    await hrApi.addEmployee({
      firstName: employee.firstName,
      lastName: employee.lastName,
      departmentId: employee.unitId,
    });
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
};
