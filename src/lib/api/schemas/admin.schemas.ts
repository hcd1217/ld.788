import * as z from 'zod/v4';
import {
  clientCodeSchema,
  emailSchema,
  idSchema,
  optionalStringSchema,
  timestampSchema,
} from './common.schemas';

// Login Schemas
export const AdminLoginRequestSchema = z.object({
  accessKey: z.string(),
});

export const AdminLoginResponseSchema = z.object({
  success: z.boolean(),
});

// Client Management Schemas
const ClientBaseSchema = z.object({
  id: idSchema,
  clientCode: z.string(),
  clientName: z.string(),
  rootUser: z.object({
    email: emailSchema,
    firstName: z.string(),
    lastName: z.string(),
  }),
  createdAt: timestampSchema,
  isActive: z.boolean(),
  status: z.enum(['active', 'suspended']).default('active'),
});

export const ClientSchema = ClientBaseSchema.transform(({ isActive, ...data }) => {
  const status: 'active' | 'suspended' = isActive ? 'active' : 'suspended';
  return { ...data, status };
});

export const AdminRegisterClientRequestSchema = z.object({
  clientCode: clientCodeSchema,
  clientName: z.string().min(3).max(100),
  rootUserEmail: emailSchema,
  rootUserPassword: z.string().min(12),
  rootUserFirstName: z.string().min(2).max(50),
  rootUserLastName: z.string().min(2).max(50),
});

export const AdminRegisterClientResponseSchema = z.object({
  success: z.boolean(),
  clientId: idSchema,
});

export const ClientListResponseSchema = z.object({
  clients: z.array(ClientSchema),
  total: z.number(),
});

// Detailed Client Schemas for getClient response
export const RoleDetailSchema = z.object({
  id: idSchema,
  name: z.string(),
  displayName: z.string(),
  description: z.string(),
  level: z.number(),
  isSystem: z.boolean(),
  createdAt: timestampSchema,
});

export const DynamicFeatureFlagDetailSchema = z.object({
  id: optionalStringSchema,
  key: z.string(),
  enabled: z.boolean(),
  value: z.record(z.string(), z.boolean()).optional(),
  rolloutPercentage: z.number(),
  description: z.string(),
  enabledAt: timestampSchema.optional(),
  expiresAt: timestampSchema.optional(),
  createdAt: timestampSchema,
});

export const ClientUserSchema = z.object({
  id: idSchema,
  email: z.string(),
  userName: optionalStringSchema,
  firstName: z.string(),
  lastName: z.string(),
  isRoot: z.boolean(),
  createdAt: timestampSchema,
  roles: z.array(
    z.object({
      id: idSchema,
      name: z.string(),
      displayName: z.string(),
      level: z.number(),
    }),
  ),
});

export const ClientDetailSchema = ClientBaseSchema.extend({
  roles: z.array(RoleDetailSchema),
  dynamicFeatureFlags: z.union([
    z.array(DynamicFeatureFlagDetailSchema),
    z.record(
      z.string(),
      z.object({
        id: optionalStringSchema,
        enabled: z.boolean(),
        value: z.record(z.string(), z.boolean()),
        rolloutPercentage: z.number().optional(),
        description: optionalStringSchema,
        enabledAt: z.union([timestampSchema, z.string()]).optional(),
        expiresAt: z.union([timestampSchema, z.string()]).optional(),
      }),
    ),
  ]),
  users: z.array(ClientUserSchema),
}).transform(({ isActive, dynamicFeatureFlags, ...rest }) => {
  // Transform object format to array format if needed
  let flagsArray: DynamicFeatureFlagDetail[] = [];

  if (Array.isArray(dynamicFeatureFlags)) {
    flagsArray = dynamicFeatureFlags;
  } else {
    // Convert object format to array format
    flagsArray = Object.entries(dynamicFeatureFlags).map(([key, flag]) => ({
      id: flag.id,
      key,
      enabled: flag.enabled,
      value: flag.value,
      rolloutPercentage: flag.rolloutPercentage ?? 0,
      description: flag.description ?? '',
      enabledAt: new Date(flag.enabledAt ?? Date.now()),
      expiresAt: new Date(flag.expiresAt ?? Date.now()),
      createdAt: new Date(), // Default as API doesn't provide this
    }));
  }

  const status: 'active' | 'suspended' = isActive ? 'active' : 'suspended';
  return {
    ...rest,
    status,
    dynamicFeatureFlags: flagsArray,
  };
});

// Suspend/Activate Client Schemas
export const SuspendClientRequestSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const SuspendClientResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const ReactivateClientRequestSchema = z.object({});

export const ReactivateClientResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Hard Delete Client Schemas
export const HardDeleteClientRequestSchema = z.object({
  confirmClientCode: z.string(),
  reason: z.string().min(1).max(500),
});

export const HardDeleteClientResponseSchema = z.object({
  message: z.string(),
});

// Admin Permission Management Schemas
export const AdminPermissionSchema = z.object({
  id: idSchema,
  resource: z.string(),
  action: z.string(),
  scope: z.string(),
  description: z.string(),
  isSystem: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.optional(),
  deletedAt: timestampSchema.optional(),
});

export const GetAllAdminPermissionsResponseSchema = z.object({
  permissions: z.array(AdminPermissionSchema),
  total: z.number(),
  offset: z.number(),
  limit: z.number(),
  hasNext: z.boolean().optional(),
  hasPrev: z.boolean().optional(),
});

export const CreateAdminPermissionRequestSchema = z.object({
  resource: z.string(),
  action: z.string(),
  scope: z.string(),
  description: z.string(),
});

export const CreateAdminPermissionResponseSchema = z.object({
  permission: AdminPermissionSchema,
});

export const UpdateAdminPermissionRequestSchema = z.object({
  description: z.string(),
});

export const UpdateAdminPermissionResponseSchema = z.object({
  permission: AdminPermissionSchema,
});

export const DeleteAdminPermissionResponseSchema = z.object({
  message: z.string(),
  deletedPermissionId: idSchema,
});

// Dynamic Feature Flag Management Schemas
export const CreateDynamicFeatureFlagRequestSchema = z.object({
  clientId: idSchema,
  key: z.string(),
  enabled: z.boolean(),
  value: z.record(z.string(), z.boolean()),
  rolloutPercentage: z.number().min(0).max(100).default(100),
  targetRules: z
    .object({
      includeRoles: z.array(z.string()).optional(),
      excludeUsers: z.array(z.string()).optional(),
    })
    .optional(),
  expiresAt: optionalStringSchema,
  description: z.string(),
});

export const UpdateDynamicFeatureFlagRequestSchema = z.object({
  enabled: z.boolean(),
  value: z.record(z.string(), z.boolean()),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  targetRules: z
    .object({
      includeRoles: z.array(z.string()).optional(),
      excludeUsers: z.array(z.string()).optional(),
    })
    .optional(),
  expiresAt: optionalStringSchema,
  description: optionalStringSchema,
  reason: optionalStringSchema,
});

const DynamicFeatureFlagObjectSchema = z.object({
  id: idSchema,
  clientId: idSchema,
  clientCode: optionalStringSchema,
  clientName: optionalStringSchema,
  key: z.string(),
  enabled: z.boolean(),
  value: z.record(z.string(), z.boolean()),
  rolloutPercentage: z.number(),
  targetRules: z
    .object({
      includeRoles: z.array(z.string()).optional(),
      excludeUsers: z.array(z.string()).optional(),
    })
    .optional(),
  description: optionalStringSchema,
  enabledAt: timestampSchema.optional(),
  expiresAt: timestampSchema.optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  createdBy: optionalStringSchema,
  updatedBy: optionalStringSchema,
});

export const DynamicFeatureFlagResponseSchema = z
  .object({
    dynamicFeatureFlag: DynamicFeatureFlagObjectSchema.optional(),
    dynamicFeatureFlags: DynamicFeatureFlagObjectSchema.optional(),
    message: z.string(),
  })
  .transform((data) => {
    // Handle both singular and plural response formats
    const flag = data.dynamicFeatureFlag || data.dynamicFeatureFlags;
    if (!flag) {
      throw new Error('Invalid response: missing feature flag data');
    }

    return {
      dynamicFeatureFlag: flag,
      message: data.message,
    };
  });

// Type exports
export type AdminLoginRequest = z.infer<typeof AdminLoginRequestSchema>;
export type AdminLoginResponse = z.infer<typeof AdminLoginResponseSchema>;
export type Client = z.infer<typeof ClientSchema>;
export type ClientDetail = z.infer<typeof ClientDetailSchema>;
export type RoleDetail = z.infer<typeof RoleDetailSchema>;
export type DynamicFeatureFlagDetail = z.infer<typeof DynamicFeatureFlagDetailSchema>;
export type ClientUser = z.infer<typeof ClientUserSchema>;
export type AdminRegisterClientRequest = z.infer<typeof AdminRegisterClientRequestSchema>;
export type AdminRegisterClientResponse = z.infer<typeof AdminRegisterClientResponseSchema>;
export type ClientListResponse = z.infer<typeof ClientListResponseSchema>;
export type SuspendClientRequest = z.infer<typeof SuspendClientRequestSchema>;
export type SuspendClientResponse = z.infer<typeof SuspendClientResponseSchema>;
export type ReactivateClientRequest = z.infer<typeof ReactivateClientRequestSchema>;
export type ReactivateClientResponse = z.infer<typeof ReactivateClientResponseSchema>;
export type HardDeleteClientRequest = z.infer<typeof HardDeleteClientRequestSchema>;
export type HardDeleteClientResponse = z.infer<typeof HardDeleteClientResponseSchema>;
export type AdminPermission = z.infer<typeof AdminPermissionSchema>;
export type GetAllAdminPermissionsResponse = z.infer<typeof GetAllAdminPermissionsResponseSchema>;
export type CreateAdminPermissionRequest = z.infer<typeof CreateAdminPermissionRequestSchema>;
export type CreateAdminPermissionResponse = z.infer<typeof CreateAdminPermissionResponseSchema>;
export type UpdateAdminPermissionRequest = z.infer<typeof UpdateAdminPermissionRequestSchema>;
export type UpdateAdminPermissionResponse = z.infer<typeof UpdateAdminPermissionResponseSchema>;
export type DeleteAdminPermissionResponse = z.infer<typeof DeleteAdminPermissionResponseSchema>;
export type CreateDynamicFeatureFlagRequest = z.infer<typeof CreateDynamicFeatureFlagRequestSchema>;
export type UpdateDynamicFeatureFlagRequest = z.infer<typeof UpdateDynamicFeatureFlagRequestSchema>;
export type DynamicFeatureFlagResponse = z.infer<typeof DynamicFeatureFlagResponseSchema>;
