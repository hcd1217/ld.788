import { BaseApiClient } from '../base';
import { logError } from '@/utils/logger';
import {
  LoginRequestSchema,
  LoginResponseSchema,
  RenewTokenRequestSchema,
  RenewTokenResponseSchema,
  GetMeResponseSchema,
  type LoginRequest,
  type LoginResponse,
  type RenewTokenRequest,
  type RenewTokenResponse,
  type GetMeResponse,
  type VerifyMagicLinkRequest,
  type VerifyMagicLinkResponse,
  VerifyMagicLinkResponseSchema,
  VerifyMagicLinkRequestSchema,
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

  async verifyMagicLink(data: VerifyMagicLinkRequest): Promise<VerifyMagicLinkResponse> {
    return this.post<VerifyMagicLinkResponse, VerifyMagicLinkRequest>(
      '/auth/magic-link/verify',
      data,
      VerifyMagicLinkResponseSchema,
      VerifyMagicLinkRequestSchema,
      { noError: true },
    );
  }

  async renewToken(data: RenewTokenRequest): Promise<RenewTokenResponse> {
    return this.post<RenewTokenResponse, RenewTokenRequest>(
      '/auth/renew-token',
      data,
      RenewTokenResponseSchema,
      RenewTokenRequestSchema,
    ).catch((error: unknown) => {
      logError('Token renewal failed', error, {
        module: 'AuthService',
        action: 'renewToken',
      });
      // If the request fails, it means the token is expired, just reload the page
      return { refreshToken: '', accessToken: '' };
    });
  }

  async getMe(): Promise<GetMeResponse> {
    // Cache key is automatically generated and used by the get() method
    // To manually manage cache for this endpoint:
    // const cacheKey = this.getCacheKey('/auth/me');
    // const isCached = this.hasCachedData(cacheKey);
    // const ttlRemaining = this.getCacheTTL(cacheKey);
    // this.clearCacheEntry(cacheKey); // To clear specific cache
    return this.get<GetMeResponse>('/auth/me', undefined, GetMeResponseSchema);
  }
}
