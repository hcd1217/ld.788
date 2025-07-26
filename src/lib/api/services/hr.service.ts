import {BaseApiClient} from '../base';
import {
  GetEmployeesResponseSchema,
  CreateEmployeesRequestSchema,
  CreateEmployeesResponseSchema,
  UpdateEmployeeRequestSchema,
  UpdateEmployeeResponseSchema,
  DeleteEmployeeResponseSchema,
  type GetEmployeesResponse,
  type CreateEmployeesRequest,
  type CreateEmployeesResponse,
  type UpdateEmployeeRequest,
  type UpdateEmployeeResponse,
  type DeleteEmployeeResponse,
  type GetDepartmentsResponse,
  GetDepartmentsResponseSchema,
  type Employee,
  type Department,
} from '../schemas/hr.schemas';
import {nameAndGender} from '@/utils/fake';

const fake = true;
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

const employees: Employee[] = fake
  ? [
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `employee-${id++}`,
        ...randomVietnameseName(),
        departmentId: randomDepartmentId(),
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ].slice(0, 20)
  : [];
export class HrApi extends BaseApiClient {
  async getEmployees(): Promise<GetEmployeesResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', '1000');
    const url = `/employees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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
        return {
          id: `employee-${id++}`,
          firstName: el.firstName,
          lastName: el.lastName,
          departmentId: el.departmentId,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
      employees.push(...newEmployees);
      return {
        employees: newEmployees,
        count: newEmployees.length,
      };
    }

    return this.post<CreateEmployeesResponse, CreateEmployeesRequest>(
      '/employees',
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
      `/employees/${employeeId}`,
      data,
      UpdateEmployeeResponseSchema,
      UpdateEmployeeRequestSchema,
    );
  }

  async removeEmployee(employeeId: string): Promise<DeleteEmployeeResponse> {
    if (fake) {
      return {message: 'success'};
    }

    return this.delete<DeleteEmployeeResponse, void>(
      `/employees/${employeeId}`,
      undefined,
      DeleteEmployeeResponseSchema,
    );
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
    const url = `/departments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

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
