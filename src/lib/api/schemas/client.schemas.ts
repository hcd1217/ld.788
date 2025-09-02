import * as z from 'zod/v4';
import {
  timestampSchema,
  optionalStringSchema,
  idSchema,
  type ClientPublicConfigSchema,
} from './common.schemas';

export const GetAllRolesResponseSchema = z.array(
  z.object({
    id: idSchema,
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
  id: idSchema,
});

export const UpdateRoleRequestSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  level: z.number(),
  description: z.string(),
});

export const UpdateRoleResponseSchema = z.object({
  id: idSchema,
});

// Permission Management Schemas
export const PermissionSchema = z.object({
  id: idSchema,
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
  id: idSchema,
});

export const UpdatePermissionRequestSchema = z.object({
  resource: z.string(),
  action: z.string(),
  scope: z.string(),
  description: z.string(),
});

export const UpdatePermissionResponseSchema = z.object({
  id: idSchema,
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
  roleId: optionalStringSchema,
  delegatedBy: optionalStringSchema,
  expiresAt: timestampSchema.optional(),
});

export const UserRoleSchema = z.object({
  id: idSchema,
  name: z.string(),
  displayName: z.string(),
  level: z.number(),
  assignedAt: timestampSchema,
  assignedBy: optionalStringSchema,
  expiresAt: timestampSchema.optional(),
  isActive: z.boolean(),
});

export const GetMyPermissionsResponseSchema = z.object({
  userId: idSchema,
  roles: z.array(
    z.object({
      id: idSchema,
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
  userId: idSchema,
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
  permissionId: idSchema,
});

export type GetAllRolesResponse = z.infer<typeof GetAllRolesResponseSchema>;

export type AddRoleRequest = z.infer<typeof AddRoleRequestSchema>;
export type AddRoleResponse = z.infer<typeof AddRoleResponseSchema>;

export type UpdateRoleRequest = z.infer<typeof UpdateRoleRequestSchema>;
export type UpdateRoleResponse = z.infer<typeof UpdateRoleResponseSchema>;

// Permission Management Types
export type Permission = z.infer<typeof PermissionSchema>;
export type GetAllPermissionsResponse = z.infer<typeof GetAllPermissionsResponseSchema>;

export type AddPermissionRequest = z.infer<typeof AddPermissionRequestSchema>;
export type AddPermissionResponse = z.infer<typeof AddPermissionResponseSchema>;

export type UpdatePermissionRequest = z.infer<typeof UpdatePermissionRequestSchema>;
export type UpdatePermissionResponse = z.infer<typeof UpdatePermissionResponseSchema>;

export type PermissionCheckRequest = z.infer<typeof PermissionCheckRequestSchema>;
export type PermissionCheckResponse = z.infer<typeof PermissionCheckResponseSchema>;

export type MultiplePermissionCheckRequest = z.infer<typeof MultiplePermissionCheckRequestSchema>;
export type MultiplePermissionCheckResponse = z.infer<typeof MultiplePermissionCheckResponseSchema>;

export type UserPermission = z.infer<typeof UserPermissionSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;

export type GetMyPermissionsResponse = z.infer<typeof GetMyPermissionsResponseSchema>;
export type GetUserPermissionsResponse = z.infer<typeof GetUserPermissionsResponseSchema>;

export type GetMyRolesResponse = z.infer<typeof GetMyRolesResponseSchema>;
export type GetUserRolesResponse = z.infer<typeof GetUserRolesResponseSchema>;

export type GrantPermissionToRoleRequest = z.infer<typeof GrantPermissionToRoleRequestSchema>;

export type ClientPublicConfigResponse = z.infer<typeof ClientPublicConfigSchema>;
