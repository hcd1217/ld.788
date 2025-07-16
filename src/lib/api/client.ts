import * as z from 'zod/v4';
import {BaseApiClient} from './base';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&()^])[A-Za-z\d@#$!%*?&()^]{8,}$/;
const passwordSchema = z.string().regex(passwordRegex);
const emailSchema = z.email();

export const RegisterClientRequestSchema = z.object({
  clientCode: z.string(),
  clientName: z.string(),
  rootUserEmail: emailSchema,
  rootUserPassword: z.string(),
  rootUserFirstName: z.string(),
  rootUserLastName: z.string(),
});

export const RegisterClientResponseSchema = z.object({
  client: z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
  }),
  rootUser: z.object({
    id: z.string(),
    email: emailSchema,
    firstName: z.string(),
    lastName: z.string(),
  }),
});

export const RegisterUserByRootUserRequestSchema = z.object({
  email: emailSchema.optional(),
  userName: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  password: passwordSchema,
});

export const RegisterUserByRootUserResponseSchema = z.object({
  id: z.string(),
});

export const RegisterBulkUsersByRootUserRequestSchema = z.array(
  RegisterUserByRootUserRequestSchema,
);

export const RegisterBulkUsersByRootUserResponseSchema = z.object({
  summary: z.object({
    total: z.number(),
    success: z.number(),
    failed: z.number(),
  }),
  success: z.array(
    z.object({
      id: z.string(),
      email: z.string().optional(),
      userName: z.string().optional(),
      firstName: z.string(),
      lastName: z.string(),
      password: z.string().optional(),
    }),
  ),
  errors: z.array(
    z.object({
      user: RegisterUserByRootUserRequestSchema,
      error: z.string(),
    }),
  ),
});

export const GetAllRolesResponseSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    displayName: z.string(),
    description: z.string(),
    level: z.number(),
    isSystem: z.boolean(),
  }),
);

export const AddRoleRequestSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  level: z.number(),
  description: z.string(),
});

export const AddRoleResponseSchema = z.object({
  id: z.string(),
});

export const UpdateRoleRequestSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  level: z.number(),
  description: z.string(),
});

export const UpdateRoleResponseSchema = z.object({
  id: z.string(),
});

// Permission Management Schemas
export const PermissionSchema = z.object({
  id: z.string(),
  resource: z.string(),
  action: z.string(),
  scope: z.string(),
  description: z.string(),
});

export const GetAllPermissionsResponseSchema = z.array(PermissionSchema);

export const AddPermissionRequestSchema = z.object({
  resource: z.string(),
  action: z.string(),
  scope: z.string(),
  description: z.string(),
});

export const AddPermissionResponseSchema = z.object({
  id: z.string(),
});

export const UpdatePermissionRequestSchema = z.object({
  resource: z.string(),
  action: z.string(),
  scope: z.string(),
  description: z.string(),
});

export const UpdatePermissionResponseSchema = z.object({
  id: z.string(),
});

export const PermissionCheckRequestSchema = z.object({
  resource: z.string(),
  action: z.string(),
  scope: z.string(),
  context: z.record(z.string(), z.any()).optional(),
});

export const PermissionCheckResponseSchema = z.object({
  allowed: z.boolean(),
});

export const MultiplePermissionCheckRequestSchema = z.object({
  permissions: z.array(
    z.object({
      resource: z.string(),
      action: z.string(),
      scope: z.string(),
    }),
  ),
});

export const MultiplePermissionCheckResponseSchema = z.object({
  results: z.array(z.boolean()),
});

export const UserPermissionSchema = z.object({
  resource: z.string(),
  action: z.string(),
  scope: z.string(),
  source: z.string(),
  roleId: z.string().optional(),
  delegatedBy: z.string().optional(),
  expiresAt: z.string().optional(),
});

export const UserRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  level: z.number(),
  assignedAt: z.string(),
  assignedBy: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
});

export const GetMyPermissionsResponseSchema = z.object({
  userId: z.string(),
  roles: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      level: z.number(),
    }),
  ),
  permissions: z.array(UserPermissionSchema),
  summary: z.object({
    totalPermissions: z.number(),
    bySource: z.object({
      role: z.number(),
      delegation: z.number(),
      inherited: z.number(),
    }),
  }),
});

export const GetUserPermissionsResponseSchema = z.object({
  userId: z.string(),
  permissions: z.array(UserPermissionSchema),
  summary: z.object({
    total: z.number(),
    fromRoles: z.number(),
    fromDelegations: z.number(),
    expired: z.number(),
  }),
});

export const GetMyRolesResponseSchema = z.array(UserRoleSchema);

export const GetUserRolesResponseSchema = z.array(UserRoleSchema);

export const GrantPermissionToRoleRequestSchema = z.object({
  permissionId: z.string(),
});

export type RegisterClientRequest = z.infer<typeof RegisterClientRequestSchema>;
export type RegisterClientResponse = z.infer<
  typeof RegisterClientResponseSchema
>;

export type RegisterUserByRootUserRequest = z.infer<
  typeof RegisterUserByRootUserRequestSchema
>;
export type RegisterUserByRootUserResponse = z.infer<
  typeof RegisterUserByRootUserResponseSchema
>;

export type RegisterBulkUsersByRootUserRequest = z.infer<
  typeof RegisterBulkUsersByRootUserRequestSchema
>;
export type RegisterBulkUsersByRootUserResponse = z.infer<
  typeof RegisterBulkUsersByRootUserResponseSchema
>;

export type GetAllRolesResponse = z.infer<typeof GetAllRolesResponseSchema>;

export type AddRoleRequest = z.infer<typeof AddRoleRequestSchema>;
export type AddRoleResponse = z.infer<typeof AddRoleResponseSchema>;

export type UpdateRoleRequest = z.infer<typeof UpdateRoleRequestSchema>;
export type UpdateRoleResponse = z.infer<typeof UpdateRoleResponseSchema>;

// Permission Management Types
export type Permission = z.infer<typeof PermissionSchema>;
export type GetAllPermissionsResponse = z.infer<
  typeof GetAllPermissionsResponseSchema
>;

export type AddPermissionRequest = z.infer<typeof AddPermissionRequestSchema>;
export type AddPermissionResponse = z.infer<typeof AddPermissionResponseSchema>;

export type UpdatePermissionRequest = z.infer<
  typeof UpdatePermissionRequestSchema
>;
export type UpdatePermissionResponse = z.infer<
  typeof UpdatePermissionResponseSchema
>;

export type PermissionCheckRequest = z.infer<
  typeof PermissionCheckRequestSchema
>;
export type PermissionCheckResponse = z.infer<
  typeof PermissionCheckResponseSchema
>;

export type MultiplePermissionCheckRequest = z.infer<
  typeof MultiplePermissionCheckRequestSchema
>;
export type MultiplePermissionCheckResponse = z.infer<
  typeof MultiplePermissionCheckResponseSchema
>;

export type UserPermission = z.infer<typeof UserPermissionSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;

export type GetMyPermissionsResponse = z.infer<
  typeof GetMyPermissionsResponseSchema
>;
export type GetUserPermissionsResponse = z.infer<
  typeof GetUserPermissionsResponseSchema
>;

export type GetMyRolesResponse = z.infer<typeof GetMyRolesResponseSchema>;
export type GetUserRolesResponse = z.infer<typeof GetUserRolesResponseSchema>;

export type GrantPermissionToRoleRequest = z.infer<
  typeof GrantPermissionToRoleRequestSchema
>;

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
}
