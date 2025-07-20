import * as z from 'zod/v4';
import {
  passwordSchema,
  jwtTokenSchema,
  emailSchema,
  optionalStringSchema,
  idSchema,
} from './common.schemas';

// Schemas
export const LoginRequestSchema = z.object({
  identifier: z.string(),
  password: passwordSchema,
  clientCode: z.string().min(2),
});

export const LoginResponseSchema = z.object({
  accessToken: jwtTokenSchema,
  refreshToken: jwtTokenSchema,
});

export const RenewTokenRequestSchema = z.object({
  refreshToken: jwtTokenSchema,
});

export const RenewTokenResponseSchema = z.object({
  accessToken: jwtTokenSchema,
  refreshToken: jwtTokenSchema,
});

export const JWTPayloadSchema = z.object({
  email: emailSchema,
  sub: z.string(),
  isRoot: z.boolean().optional(),
  iat: z.number(),
  exp: z.number(),
});

export const ForgotPasswordRequestSchema = z.object({
  email: emailSchema,
  clientCode: z.string().min(2),
});

export const ForgotPasswordResponseSchema = z.object({
  success: z.boolean(),
});

export const ResetPasswordRequestSchema = z.object({
  email: emailSchema,
  token: z.string(),
  password: passwordSchema,
});

export const ResetPasswordResponseSchema = z.object({
  success: z.boolean(),
});

export const RegisterRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  clientCode: z.string().min(2),
  clientName: z.string().min(5),
});

export const RegisterResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

// Schema for role object
export const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  level: z.number(),
});

// Schema for dynamic feature flags
export const DynamicFeatureFlagsSchema = z.object({
  'role-management': z
    .object({
      customRoles: z.boolean(),
      roleHierarchy: z.boolean(),
    })
    .optional(),
  'user-management': z
    .object({
      bulkImport: z.boolean(),
      userInvitations: z.boolean(),
      createUserWithDepartment: z.boolean(),
    })
    .optional(),
});

// Schema for client config
export const ClientConfigSchema = z.object({
  sessionTimeoutMinutes: z.number(),
  maxConcurrentSessions: z.number(),
  allowPasswordReset: z.boolean(),
  allowSelfRegistration: z.boolean(),
});

// Schema for GET /auth/me response
export const GetMeResponseSchema = z.object({
  id: idSchema,
  email: emailSchema,
  userName: optionalStringSchema,
  clientId: idSchema,
  clientCode: z.string(),
  isRoot: z.boolean(),
  roles: z.array(RoleSchema),
  dynamicFeatureFlags: DynamicFeatureFlagsSchema,
  clientConfig: ClientConfigSchema,
});

// Types derived from schemas
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RenewTokenRequest = z.infer<typeof RenewTokenRequestSchema>;
export type RenewTokenResponse = z.infer<typeof RenewTokenResponseSchema>;
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ForgotPasswordResponse = z.infer<
  typeof ForgotPasswordResponseSchema
>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type DynamicFeatureFlags = z.infer<typeof DynamicFeatureFlagsSchema>;
export type ClientConfig = z.infer<typeof ClientConfigSchema>;
export type GetMeResponse = z.infer<typeof GetMeResponseSchema>;
