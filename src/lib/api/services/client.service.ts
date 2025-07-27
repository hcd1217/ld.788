import * as z from 'zod/v4';
import {BaseApiClient} from '../base';
import {
  RegisterClientRequestSchema,
  RegisterClientResponseSchema,
  RegisterUserByRootUserRequestSchema,
  RegisterUserByRootUserResponseSchema,
  RegisterBulkUsersByRootUserRequestSchema,
  RegisterBulkUsersByRootUserResponseSchema,
  GetAllRolesResponseSchema,
  AddRoleRequestSchema,
  AddRoleResponseSchema,
  UpdateRoleRequestSchema,
  UpdateRoleResponseSchema,
  GetAllPermissionsResponseSchema,
  AddPermissionRequestSchema,
  AddPermissionResponseSchema,
  UpdatePermissionRequestSchema,
  UpdatePermissionResponseSchema,
  GetMyPermissionsResponseSchema,
  PermissionCheckRequestSchema,
  PermissionCheckResponseSchema,
  MultiplePermissionCheckRequestSchema,
  MultiplePermissionCheckResponseSchema,
  GrantPermissionToRoleRequestSchema,
  GetMyRolesResponseSchema,
  GetUserPermissionsResponseSchema,
  GetUserRolesResponseSchema,
  type RegisterClientRequest,
  type RegisterClientResponse,
  type RegisterUserByRootUserRequest,
  type RegisterUserByRootUserResponse,
  type RegisterBulkUsersByRootUserRequest,
  type RegisterBulkUsersByRootUserResponse,
  type GetAllRolesResponse,
  type AddRoleRequest,
  type AddRoleResponse,
  type UpdateRoleRequest,
  type UpdateRoleResponse,
  type GetAllPermissionsResponse,
  type AddPermissionRequest,
  type AddPermissionResponse,
  type UpdatePermissionRequest,
  type UpdatePermissionResponse,
  type GetMyPermissionsResponse,
  type PermissionCheckRequest,
  type PermissionCheckResponse,
  type MultiplePermissionCheckRequest,
  type MultiplePermissionCheckResponse,
  type GrantPermissionToRoleRequest,
  type GetMyRolesResponse,
  type GetUserPermissionsResponse,
  type GetUserRolesResponse,
  type ClientPublicConfigResponse,
} from '../schemas/client.schemas';
import {ClientPublicConfigSchema} from '../schemas';

export class ClientApi extends BaseApiClient {
  async register(data: RegisterClientRequest): Promise<RegisterClientResponse> {
    return this.post<RegisterClientResponse, RegisterClientRequest>(
      '/clients/register',
      data,
      RegisterClientResponseSchema,
      RegisterClientRequestSchema,
    );
  }

  async registerUserByRootUser(
    data: RegisterUserByRootUserRequest,
  ): Promise<RegisterUserByRootUserResponse> {
    return this.post<
      RegisterUserByRootUserResponse,
      RegisterUserByRootUserRequest
    >(
      '/clients/user/register',
      data,
      RegisterUserByRootUserResponseSchema,
      RegisterUserByRootUserRequestSchema,
    );
  }

  async registerBulkUsersByRootUser(
    data: RegisterBulkUsersByRootUserRequest,
  ): Promise<RegisterBulkUsersByRootUserResponse> {
    return this.post<
      RegisterBulkUsersByRootUserResponse,
      RegisterBulkUsersByRootUserRequest
    >(
      '/clients/user/register/bulk',
      data,
      RegisterBulkUsersByRootUserResponseSchema,
      RegisterBulkUsersByRootUserRequestSchema,
    );
  }

  async getAllRoles(): Promise<GetAllRolesResponse> {
    return this.get<GetAllRolesResponse, void>(
      '/api/roles',
      undefined,
      GetAllRolesResponseSchema,
    );
  }

  async addRole(data: AddRoleRequest): Promise<AddRoleResponse> {
    return this.post<AddRoleResponse, AddRoleRequest>(
      '/api/roles',
      data,
      AddRoleResponseSchema,
      AddRoleRequestSchema,
    );
  }

  async updateRole(
    id: string,
    data: UpdateRoleRequest,
  ): Promise<UpdateRoleResponse> {
    return this.put<UpdateRoleResponse, UpdateRoleRequest>(
      `/api/roles/${id}`,
      data,
      UpdateRoleResponseSchema,
      UpdateRoleRequestSchema,
    );
  }

  async deleteRole(id: string): Promise<void> {
    await this.delete(`/api/roles/${id}`);
  }

  // Permission Management Methods
  async getAllPermissions(filters?: {
    resource?: string;
    action?: string;
    scope?: string;
  }): Promise<GetAllPermissionsResponse> {
    const queryParams = new URLSearchParams();
    if (filters?.resource) queryParams.append('resource', filters.resource);
    if (filters?.action) queryParams.append('action', filters.action);
    if (filters?.scope) queryParams.append('scope', filters.scope);

    const url = `/api/permissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.get<GetAllPermissionsResponse, void>(
      url,
      undefined,
      GetAllPermissionsResponseSchema,
    );
  }

  async addPermission(
    data: AddPermissionRequest,
  ): Promise<AddPermissionResponse> {
    return this.post<AddPermissionResponse, AddPermissionRequest>(
      '/api/permissions',
      data,
      AddPermissionResponseSchema,
      AddPermissionRequestSchema,
    );
  }

  async updatePermission(
    id: string,
    data: UpdatePermissionRequest,
  ): Promise<UpdatePermissionResponse> {
    return this.put<UpdatePermissionResponse, UpdatePermissionRequest>(
      `/api/permissions/${id}`,
      data,
      UpdatePermissionResponseSchema,
      UpdatePermissionRequestSchema,
    );
  }

  async revokePermission(id: string): Promise<void> {
    await this.delete(`/api/permissions/${id}`);
  }

  async getMyPermissions(): Promise<GetMyPermissionsResponse> {
    return this.get<GetMyPermissionsResponse, void>(
      '/api/users/me/permissions',
      undefined,
      GetMyPermissionsResponseSchema,
    );
  }

  async checkPermission(
    data: PermissionCheckRequest,
  ): Promise<PermissionCheckResponse> {
    return this.post<PermissionCheckResponse, PermissionCheckRequest>(
      '/api/permissions/check',
      data,
      PermissionCheckResponseSchema,
      PermissionCheckRequestSchema,
    );
  }

  async checkMultiplePermissions(
    data: MultiplePermissionCheckRequest,
  ): Promise<MultiplePermissionCheckResponse> {
    return this.post<
      MultiplePermissionCheckResponse,
      MultiplePermissionCheckRequest
    >(
      '/api/permissions/check-multiple',
      data,
      MultiplePermissionCheckResponseSchema,
      MultiplePermissionCheckRequestSchema,
    );
  }

  async grantPermissionToRole(
    roleId: string,
    data: GrantPermissionToRoleRequest,
  ): Promise<void> {
    await this.post<void, GrantPermissionToRoleRequest>(
      `/api/roles/${roleId}/permissions`,
      data,
      z.void(),
      GrantPermissionToRoleRequestSchema,
    );
  }

  async revokePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    await this.delete(`/api/roles/${roleId}/permissions/${permissionId}`);
  }

  async getMyRoles(): Promise<GetMyRolesResponse> {
    return this.get<GetMyRolesResponse, void>(
      '/api/users/me/roles',
      undefined,
      GetMyRolesResponseSchema,
    );
  }

  async getUserPermissions(
    userId: string,
  ): Promise<GetUserPermissionsResponse> {
    return this.get<GetUserPermissionsResponse, void>(
      `/api/users/${userId}/permissions`,
      undefined,
      GetUserPermissionsResponseSchema,
    );
  }

  async getUserRoles(userId: string): Promise<GetUserRolesResponse> {
    return this.get<GetUserRolesResponse, void>(
      `/api/users/${userId}/roles`,
      undefined,
      GetUserRolesResponseSchema,
    );
  }

  async getPubicClientConfig(
    clientCode: string,
  ): Promise<ClientPublicConfigResponse> {
    return this.get<ClientPublicConfigResponse, void>(
      `/clients/${clientCode}/public-config`,
      undefined,
      ClientPublicConfigSchema,
    );
  }
}
