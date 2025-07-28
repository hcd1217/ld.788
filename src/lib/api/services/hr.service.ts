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
} from '../schemas/hr.schemas';

export class HrApi extends BaseApiClient {
  async getEmployees(): Promise<GetEmployeesResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', '1000');
    const url = `/api/hr/employees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<GetEmployeesResponse, void>(
      url,
      undefined,
      GetEmployeesResponseSchema,
    );
  }

  async addEmployees(
    data: CreateEmployeesRequest,
  ): Promise<CreateEmployeesResponse> {
    return this.post<CreateEmployeesResponse, CreateEmployeesRequest>(
      '/api/hr/employees',
      data,
      CreateEmployeesResponseSchema,
      CreateEmployeesRequestSchema,
    );
  }

  async addBulkEmployees(data: CreateEmployeesRequest[]): Promise<void> {
    return this.post<void, CreateEmployeesRequest[]>(
      '/api/hr/employees/bulk',
      data,
      undefined,
      CreateEmployeesRequestSchema.array(),
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
    await this.patch(`/api/hr/employees/${employeeId}/deactivate`);
  }

  async activateEmployee(employeeId: string): Promise<void> {
    await this.patch(`/api/hr/employees/${employeeId}/activate`);
  }

  async removeEmployee(employeeId: string): Promise<void> {
    await this.delete(`/api/hr/employees/${employeeId}`);
  }

  async getDepartments(): Promise<GetDepartmentsResponse> {
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
