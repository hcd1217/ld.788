import * as z from 'zod/v4';
import {BaseApiClient} from './base';
import {passwordSchema, jwtTokenSchema, emailSchema} from './schema';

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

export class AuthApi extends BaseApiClient {
  async login(data: LoginRequest): Promise<LoginResponse> {
    // Make request with response validation
    return this.post<LoginResponse, LoginRequest>(
      '/auth/login',
      data,
      LoginResponseSchema,
      LoginRequestSchema,
    );
  }

  async forgotPassword(
    data: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    return this.post<ForgotPasswordResponse, ForgotPasswordRequest>(
      '/auth/forgot-password',
      data,
      ForgotPasswordResponseSchema,
    );
  }

  async resetPassword(
    data: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    return this.post<ResetPasswordResponse, ResetPasswordRequest>(
      '/auth/reset-password',
      data,
      ResetPasswordResponseSchema,
    );
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.post<RegisterResponse, RegisterRequest>(
      '/auth/register',
      data,
      RegisterResponseSchema,
      RegisterRequestSchema,
    );
  }

  async renewToken(data: RenewTokenRequest): Promise<RenewTokenResponse> {
    return this.post<RenewTokenResponse, RenewTokenRequest>(
      '/auth/renew-token',
      data,
      RenewTokenResponseSchema,
      RenewTokenRequestSchema,
    );
  }
}
