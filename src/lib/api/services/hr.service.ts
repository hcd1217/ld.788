import {BaseApiClient} from '../base';
import {
  GetEmployeesResponseSchema,
  CreateEmployeesRequestSchema,
  CreateEmployeesResponseSchema,
  UpdateEmployeeRequestSchema,
  UpdateEmployeeResponseSchema,
  type GetEmployeesResponse,
  type CreateEmployeesRequest,
  type CreateEmployeesResponse,
  type UpdateEmployeeRequest,
  type UpdateEmployeeResponse,
  type GetDepartmentsResponse,
  GetDepartmentsResponseSchema,
  type Employee,
  type Department,
} from '../schemas/hr.schemas';
import {nameAndGender} from '@/utils/fake';

const fake = false;
let id = Date.now();

const departments: Department[] = fake
  ? [
      {
        id: `department-${id++}`,
        name: 'Bún Bò Huế Cô Ba',
      },
      {
        id: `department-${id++}`,
        name: 'Chè 4 Mùa',
      },

      {
        id: `department-${id++}`,
        name: 'Trà Sữa Gong Cha',
      },
    ]
  : [];

const departmentIds = departments.map((el) => el.id);

let employees: Employee[] = fake
  ? [
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
      .map((el) => {
        return {
          ...el,
          employeeCode: `EMP_${el.id.slice(-4)}`.toLocaleUpperCase(),
        };
      })
      .slice(0, 20)
  : [];
export class HrApi extends BaseApiClient {
  async getEmployees(): Promise<GetEmployeesResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', '1000');
    const url = `/api/hr/employees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    if (fake) {
      return {
        employees,
        pagination: {
          limit: employees.length,
          hasPrev: false,
          hasNext: false,
        },
      };
    }

    return this.get<GetEmployeesResponse, void>(
      url,
      undefined,
      GetEmployeesResponseSchema,
    );
  }

  async addEmployees(
    data: CreateEmployeesRequest,
  ): Promise<CreateEmployeesResponse> {
    if (fake) {
      const newEmployees: Employee[] = data.map((el) => {
        const employeeId = `employee-${id++}`;
        return {
          id: employeeId,
          firstName: el.firstName,
          lastName: el.lastName,
          departmentId: el.departmentId,
          employeeCode: `EMP_${employeeId.slice(-4)}`.toLocaleUpperCase(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
      employees.push(...newEmployees);
      return {
        employees: newEmployees,
        count: newEmployees.length,
      };
    }

    return this.post<CreateEmployeesResponse, CreateEmployeesRequest>(
      '/api/hr/employees',
      data,
      CreateEmployeesResponseSchema,
      CreateEmployeesRequestSchema,
    );
  }

  async updateEmployee(
    employeeId: string,
    data: UpdateEmployeeRequest,
  ): Promise<UpdateEmployeeResponse> {
    return this.put<UpdateEmployeeResponse, UpdateEmployeeRequest>(
      `/api/hr/employees/${employeeId}`,
      data,
      UpdateEmployeeResponseSchema,
      UpdateEmployeeRequestSchema,
    );
  }

  async deactivateEmployee(employeeId: string): Promise<void> {
    if (fake) {
      const employee = employees.find((e) => e.id === employeeId);
      if (employee) {
        employee.isActive = false;
        employee.updatedAt = new Date();
        return;
      }

      throw new Error('Employee not found');
    }

    const debug = true;
    if (debug) {
      throw new Error('Can not deactivate employee');
    }

    await this.patch(`/api/hr/employees/${employeeId}/deactivate`);
  }

  async activateEmployee(employeeId: string): Promise<void> {
    if (fake) {
      const employee = employees.find((e) => e.id === employeeId);
      if (employee) {
        employee.isActive = true;
        employee.updatedAt = new Date();
        return;
      }

      throw new Error('Employee not found');
    }

    await this.patch(`/api/hr/employees/${employeeId}/activate`);
  }

  async removeEmployee(employeeId: string): Promise<void> {
    if (fake) {
      employees = employees.filter((e) => e.id !== employeeId);
    }

    await this.delete(`/api/hr/employees/${employeeId}`);
  }

  async getDepartments(): Promise<GetDepartmentsResponse> {
    if (fake) {
      return {
        departments,
        pagination: {
          limit: departments.length,
          hasPrev: false,
          hasNext: false,
        },
      };
    }

    const queryParams = new URLSearchParams();
    queryParams.append('limit', '1000');
    const url = `/api/hr/departments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.get<GetDepartmentsResponse, void>(
      url,
      undefined,
      GetDepartmentsResponseSchema,
    );
  }
}

function randomDepartmentId() {
  return departmentIds[Math.floor(Math.random() * departmentIds.length)];
}

function randomVietnameseName() {
  const {lastName, firstName} = nameAndGender();
  return {lastName, firstName};
}
