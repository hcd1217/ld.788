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
  type GetUnitsResponse,
  GetUnitsResponseSchema,
  type CreateBulkEmployeesRequest,
  CreateBulkEmployeesRequestSchema,
  type GetPositionsResponse,
  GetPositionsResponseSchema,
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

  async addEmployee(
    data: CreateEmployeesRequest,
  ): Promise<CreateEmployeesResponse> {
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

  async getUnits(): Promise<GetUnitsResponse['departments']> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', '1000');
    const url = `/api/hr/departments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await this.get<GetUnitsResponse, void>(
      url,
      undefined,
      GetUnitsResponseSchema,
    );
    return response.departments;
  }

  async getPositions(): Promise<GetPositionsResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', '1000');
    const url = `/api/hr/positions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.get<GetPositionsResponse, void>(
      url,
      undefined,
      GetPositionsResponseSchema,
    );
  }
}
