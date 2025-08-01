import * as z from 'zod/v4';
import {
  booleanSchema,
  ClientPublicConfigSchema,
  dictionarySchema,
  emailSchema,
  falseBooleanSchema,
  idSchema,
  jwtTokenSchema,
  numberSchema,
  optionalBooleanSchema,
  optionalStringSchema,
  passwordSchema,
  stringSchema,
  trueBooleanSchema,
} from './common.schemas';
import {ROUTERS} from '@/config/routeConfig';

// Schemas
export const LoginRequestSchema = z.object({
  identifier: stringSchema,
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
  sub: stringSchema,
  isRoot: booleanSchema.optional(),
  iat: numberSchema,
  exp: numberSchema,
});

export const ForgotPasswordRequestSchema = z.object({
  email: emailSchema,
  clientCode: z.string().min(2),
});

export const ForgotPasswordResponseSchema = z.object({
  success: booleanSchema,
});

export const ResetPasswordRequestSchema = z.object({
  email: emailSchema,
  token: stringSchema,
  password: passwordSchema,
});

export const ResetPasswordResponseSchema = z.object({
  success: booleanSchema,
});

export const RegisterRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: stringSchema.min(1),
  lastName: stringSchema.min(1),
  clientCode: stringSchema.min(2),
  clientName: stringSchema.min(5),
});

export const RegisterResponseSchema = z.object({
  accessToken: stringSchema,
  refreshToken: stringSchema,
});

// Schema for role object
export const RoleSchema = z.object({
  id: idSchema,
  name: stringSchema,
  level: numberSchema,
});

// Schema for client config
export const ClientConfigSchema = z.object({
  sessionTimeoutMinutes: numberSchema.optional(),
  maxConcurrentSessions: numberSchema.optional(),
  allowPasswordReset: booleanSchema.optional(),
  allowSelfRegistration: booleanSchema.optional(),
  translations: dictionarySchema.optional(),
  ...ClientPublicConfigSchema.shape,
});

export const RouteConfigSchema = z.object({
  [ROUTERS.ROOT]: trueBooleanSchema,
  [ROUTERS.LOGIN]: trueBooleanSchema,
  [ROUTERS.CLIENT_LOGIN]: trueBooleanSchema,
  [ROUTERS.FORGOT_PASSWORD]: optionalBooleanSchema,
  [ROUTERS.RESET_PASSWORD]: optionalBooleanSchema,
  [ROUTERS.REGISTER]: falseBooleanSchema,
  [ROUTERS.HOME]: optionalBooleanSchema, // TrueBooleanSchema
  [ROUTERS.EXPLORE]: trueBooleanSchema,
  [ROUTERS.MORE]: trueBooleanSchema,
  [ROUTERS.PROFILE]: trueBooleanSchema,
  [ROUTERS.SETTINGS]: trueBooleanSchema,
  [ROUTERS.NOTIFICATIONS]: optionalBooleanSchema,
  [ROUTERS.STORES]: optionalBooleanSchema,
  [ROUTERS.STORE_CONFIG]: optionalBooleanSchema,
  [ROUTERS.STORE_MANAGEMENT]: optionalBooleanSchema,
  [ROUTERS.STORE_EDIT]: optionalBooleanSchema,
  [ROUTERS.EMPLOYEE_MANAGEMENT]: optionalBooleanSchema,
  [ROUTERS.EMPLOYEE_DETAIL]: optionalBooleanSchema,
  [ROUTERS.EMPLOYEES_ADD]: optionalBooleanSchema,
  [ROUTERS.EMPLOYEE_EDIT]: optionalBooleanSchema,
  [ROUTERS.CUSTOMER_MANAGEMENT]: optionalBooleanSchema,
  [ROUTERS.CUSTOMER_DETAIL]: optionalBooleanSchema,
  [ROUTERS.CUSTOMER_ADD]: optionalBooleanSchema,
  [ROUTERS.CUSTOMER_EDIT]: optionalBooleanSchema,
  [ROUTERS.PO_MANAGEMENT]: optionalBooleanSchema,
  [ROUTERS.PO_DETAIL]: optionalBooleanSchema,
  [ROUTERS.PO_ADD]: optionalBooleanSchema,
  [ROUTERS.PO_EDIT]: optionalBooleanSchema,
  [ROUTERS.STAFF]: optionalBooleanSchema,
  [ROUTERS.STAFF_ADD]: optionalBooleanSchema,
  [ROUTERS.STAFF_EDIT]: optionalBooleanSchema,
  [ROUTERS.USER_MANAGEMENT]: optionalBooleanSchema,
  [ROUTERS.USER_DETAIL]: optionalBooleanSchema,
  [ROUTERS.ADD_USER]: optionalBooleanSchema,
  [ROUTERS.IMPORT_USERS]: optionalBooleanSchema,
  [ROUTERS.CONFIGURATION]: optionalBooleanSchema,
  [ROUTERS.SALARY_MANAGEMENT]: optionalBooleanSchema,
  [ROUTERS.ROLE_MANAGEMENT]: optionalBooleanSchema,
  [ROUTERS.PERMISSION_MANAGEMENT]: optionalBooleanSchema,
  [ROUTERS.ADMIN_LOGIN]: falseBooleanSchema,
  [ROUTERS.ADMIN_DASHBOARD]: falseBooleanSchema,
  [ROUTERS.ADMIN_CLIENTS]: falseBooleanSchema,
  [ROUTERS.ADMIN_CLIENTS_NEW]: falseBooleanSchema,
  [ROUTERS.ADMIN_CLIENT_DETAIL]: falseBooleanSchema,
  [ROUTERS.ADMIN_PERMISSIONS]: falseBooleanSchema,
  [ROUTERS.ADMIN_STORES]: falseBooleanSchema,
  [ROUTERS.ADMIN_MONITORING]: falseBooleanSchema,
  [ROUTERS.ADMIN_SETTINGS]: falseBooleanSchema,
  [ROUTERS.SAMPLE_ERRORS]: falseBooleanSchema,
});

// Schema for GET /auth/me response
export const GetMeResponseSchema = z.object({
  id: idSchema,
  email: emailSchema,
  userName: optionalStringSchema,
  clientId: idSchema,
  clientCode: stringSchema,
  isRoot: booleanSchema,
  roles: z.array(RoleSchema),
  // DynamicFeatureFlags: DynamicFeatureFlagsSchema,
  clientConfig: ClientConfigSchema.optional(),
  routeConfig: RouteConfigSchema.optional(),
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
export type ClientConfig = z.infer<typeof ClientConfigSchema>;
export type GetMeResponse = z.infer<typeof GetMeResponseSchema>;
