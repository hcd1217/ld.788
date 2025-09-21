import { isDebug } from '@/utils/env';
import { type FakeDepartmentCode, fakePermission } from '@/utils/fake';
import { logError } from '@/utils/logger';
import { STORAGE_KEYS } from '@/utils/storageKeys';

import { BaseApiClient } from '../base';
import {
  type GetMeResponse,
  GetMeResponseSchema,
  type LoginRequest,
  LoginRequestSchema,
  type LoginResponse,
  LoginResponseSchema,
  type RenewTokenRequest,
  RenewTokenRequestSchema,
  type RenewTokenResponse,
  RenewTokenResponseSchema,
  type VerifyMagicLinkRequest,
  VerifyMagicLinkRequestSchema,
  type VerifyMagicLinkResponse,
  VerifyMagicLinkResponseSchema,
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

  /**
   * Change password for a user
   *
   * @param userId - The ID of the user
   * @param currentPassword - The old password
   * @param newPassword - The new password
   * @returns void
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.post<void>(`/auth/change-password`, { currentPassword, newPassword });
  }

  async getMe(): Promise<GetMeResponse> {
    // Cache key is automatically generated and used by the get() method
    // To manually manage cache for this endpoint:
    // const cacheKey = this.getCacheKey('/auth/me');
    // const isCached = this.hasCachedData(cacheKey);
    // const ttlRemaining = this.getCacheTTL(cacheKey);
    // this.clearCacheEntry(cacheKey); // To clear specific cache
    const res = await this.get<GetMeResponse>('/auth/me', undefined, GetMeResponseSchema);

    if (isDebug) {
      const role: FakeDepartmentCode = localStorage.getItem(
        STORAGE_KEYS.DEBUG.CURRENT_ROLE,
      ) as FakeDepartmentCode;
      res.permissions = fakePermission(role);
    }

    return res;
  }
}
