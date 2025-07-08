import {
  clientApi,
  type AddRoleRequest,
  type AddRoleResponse,
  type GetAllRolesResponse,
  type UpdateRoleRequest,
  type UpdateRoleResponse,
  type RegisterBulkUsersByRootUserRequest,
  type RegisterBulkUsersByRootUserResponse,
  type RegisterClientRequest,
  type RegisterClientResponse,
  type RegisterUserByRootUserRequest,
  type RegisterUserByRootUserResponse,
  type GetAllPermissionsResponse,
  type AddPermissionRequest,
  type AddPermissionResponse,
  type UpdatePermissionRequest,
  type UpdatePermissionResponse,
} from '@/lib/api';

export type Client = {
  id: string;
  code: string;
  name: string;
};

export const clientService = {
  async registerNewClient(
    data: RegisterClientRequest,
  ): Promise<RegisterClientResponse> {
    return clientApi.register(data);
  },

  async registerUserByRootUser(
    data: RegisterUserByRootUserRequest,
  ): Promise<RegisterUserByRootUserResponse> {
    return clientApi.registerUserByRootUser(data);
  },

  async registerBulkUsersByRootUser(
    data: RegisterBulkUsersByRootUserRequest,
  ): Promise<RegisterBulkUsersByRootUserResponse> {
    return clientApi.registerBulkUsersByRootUser(data);
  },

  async getAllRoles(): Promise<GetAllRolesResponse> {
    return clientApi.getAllRoles();
  },

  async addRole(data: AddRoleRequest): Promise<AddRoleResponse> {
    return clientApi.addRole(data);
  },

  async updateRole(
    id: string,
    data: UpdateRoleRequest,
  ): Promise<UpdateRoleResponse> {
    return clientApi.updateRole(id, data);
  },

  async deleteRole(id: string): Promise<void> {
    await clientApi.deleteRole(id);
  },

  async getAllPermissions(): Promise<GetAllPermissionsResponse> {
    return clientApi.getAllPermissions();
  },

  async addPermission(
    data: AddPermissionRequest,
  ): Promise<AddPermissionResponse> {
    return clientApi.addPermission(data);
  },

  async updatePermission(
    id: string,
    data: UpdatePermissionRequest,
  ): Promise<UpdatePermissionResponse> {
    return clientApi.updatePermission(id, data);
  },

  async revokePermission(id: string): Promise<void> {
    await clientApi.revokePermission(id);
  },
};
