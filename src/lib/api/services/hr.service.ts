import { BaseApiClient } from '../base';
import {
  type CreateBulkEmployeesRequest,
  CreateBulkEmployeesRequestSchema,
  type CreateEmployeesRequest,
  CreateEmployeesRequestSchema,
  type CreateEmployeesResponse,
  CreateEmployeesResponseSchema,
  type GetEmployeesResponse,
  GetEmployeesResponseSchema,
  type UpdateEmployeeRequest,
  UpdateEmployeeRequestSchema,
  type UpdateEmployeeResponse,
  UpdateEmployeeResponseSchema,
} from '../schemas/hr.schemas';

export class HrApi extends BaseApiClient {
  async getEmployees(): Promise<GetEmployeesResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', '1000');
    const url = `/api/hr/employees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<GetEmployeesResponse, void>(url, undefined, GetEmployeesResponseSchema);
  }

  async addEmployee(data: CreateEmployeesRequest): Promise<CreateEmployeesResponse> {
    return this.post<CreateEmployeesResponse, CreateEmployeesRequest>(
      '/api/hr/employees',
      data,
      CreateEmployeesResponseSchema,
      CreateEmployeesRequestSchema,
    );
  }

  async addBulkEmployees(data: CreateBulkEmployeesRequest): Promise<void> {
    return this.post<void, CreateBulkEmployeesRequest>(
      '/api/hr/employees/import/bulk',
      data,
      undefined,
      CreateBulkEmployeesRequestSchema,
    );
  }

  async updateEmployee(
    employeeId: string,
    data: UpdateEmployeeRequest,
  ): Promise<UpdateEmployeeResponse> {
    return this.patch<UpdateEmployeeResponse, UpdateEmployeeRequest>(
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
}
