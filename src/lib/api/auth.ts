import {z} from 'zod';
import {BaseApiClient} from './base';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&()^])[A-Za-z\d@#$!%*?&()^]{8,}$/;

const passwordSchema = z.string().regex(passwordRegex);
// Schemas
export const LoginRequestSchema = z.object({
  identifier: z.string(),
  password: passwordSchema,
  clientCode: z.string(),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const RenewTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export const RenewTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const JWTPayloadSchema = z.object({
  email: z.email(),
  sub: z.string(),
  iat: z.number(),
  exp: z.number(),
});

export const ForgotPasswordRequestSchema = z.object({
  email: z.email(),
});

export const ForgotPasswordResponseSchema = z.object({
  success: z.boolean(),
});

export const ResetPasswordRequestSchema = z.object({
  email: z.email(),
  token: z.string(),
  password: passwordSchema,
});

export const ResetPasswordResponseSchema = z.object({
  success: z.boolean(),
});

export const RegisterRequestSchema = z.object({
  email: z.email(),
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
    // Validate request data
    const validatedData = LoginRequestSchema.parse(data);

    // Make request with response validation
    return this.post<LoginResponse>(
      '/auth/login',
      validatedData,
      LoginResponseSchema,
    );
  }

  async forgotPassword(
    data: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    // Validate request data
    const validatedData = ForgotPasswordRequestSchema.parse(data);

    // Make request with response validation
    return this.post<ForgotPasswordResponse>(
      '/auth/forgot-password',
      validatedData,
      ForgotPasswordResponseSchema,
    );
  }

  async resetPassword(
    data: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    // Validate request data
    const validatedData = ResetPasswordRequestSchema.parse(data);

    // Make request with response validation
    return this.post<ResetPasswordResponse>(
      '/auth/reset-password',
      validatedData,
      ResetPasswordResponseSchema,
    );
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    // Validate request data
    const validatedData = RegisterRequestSchema.parse(data);

    // Make request with response validation
    return this.post<RegisterResponse>(
      '/auth/register',
      validatedData,
      RegisterResponseSchema,
    );
  }

  async renewToken(data: RenewTokenRequest): Promise<RenewTokenResponse> {
    // Validate request data
    const validatedData = RenewTokenRequestSchema.parse(data);

    // Make request with response validation
    return this.post<RenewTokenResponse>(
      '/auth/renew-token',
      validatedData,
      RenewTokenResponseSchema,
    );
  }
}
