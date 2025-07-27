import * as z from 'zod/v4';
import {
  booleanSchema,
  ClientPublicConfigSchema,
  dictionarySchema,
  emailSchema,
  idSchema,
  jwtTokenSchema,
  numberSchema,
  optionalStringSchema,
  passwordSchema,
  stringSchema,
} from './common.schemas';

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
