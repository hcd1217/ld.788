import {BaseApiClient} from '../base';
import {
  LoginRequestSchema,
  LoginResponseSchema,
  ForgotPasswordResponseSchema,
  ResetPasswordResponseSchema,
  RegisterRequestSchema,
  RegisterResponseSchema,
  RenewTokenRequestSchema,
  RenewTokenResponseSchema,
  GetMeResponseSchema,
  type LoginRequest,
  type LoginResponse,
  type ForgotPasswordRequest,
  type ForgotPasswordResponse,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
  type RegisterRequest,
  type RegisterResponse,
  type RenewTokenRequest,
  type RenewTokenResponse,
  type GetMeResponse,
} from '../schemas/auth.schemas';

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
    ).catch((error: unknown) => {
      console.error(error);
      // If the request fails, it means the token is expired, just reload the page
      return {refreshToken: '', accessToken: ''};
    });
  }

  async getMe(): Promise<GetMeResponse> {
    const response = await this.get<GetMeResponse>(
      '/auth/me',
      GetMeResponseSchema,
    );
    response.clientConfig.translations = {
      vi: {
        // Cspell:disable-next-line
        'employee.unit': 'Cửa hàng',
      },
    };
    response.clientConfig.clientCode = 'ACME';
    response.clientConfig.clientName = 'ACME';
    response.clientConfig.logoUrl =
      'https://img.freepik.com/free-vector/butterfly-colorful-logo-template_361591-1587.jpg?semt=ais_hybrid&w=740';
    return response;
  }
}
