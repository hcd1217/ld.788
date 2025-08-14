import {
  authApi,
  type LoginRequest,
  type ForgotPasswordRequest,
  type ForgotPasswordResponse,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
} from '@/lib/api';
import { logError } from '@/utils/logger';
import { decodeJWT, isTokenExpired } from '@/utils/jwt';
import { delay } from '@/utils/time';

export type User = {
  id: string;
  email: string;
  isRoot?: boolean;
};

export const authService = {
  async loginWithMagicToken(clientCode: string, token: string) {
    try {
      saveClientCode(clientCode);
      const response = await authApi.verifyMagicLink({
        token,
      });
      return await resolveAuthResponse(response);
    } catch (error) {
      logError('Login failed', error, {
        module: 'AuthService',
        action: 'loginWithMagicToken',
        clientCode,
      });
      throw error;
    }
  },

  async login(credentials: LoginRequest): Promise<{ user: User }> {
    try {
      saveClientCode(credentials.clientCode);
      const response = await authApi.login(credentials);
      return await resolveAuthResponse(response);
    } catch (error) {
      logError('Login failed', error, {
        module: 'AuthService',
        action: 'login',
        clientCode: credentials.clientCode,
      });
      throw error;
    }
  },

  logout() {
    clearTokens();
  },

  getAccessToken() {
    return localStorage.getItem('accessToken') ?? undefined;
  },

  getRefreshToken() {
    return localStorage.getItem('refreshToken') ?? undefined;
  },

  getClientCode() {
    return localStorage.getItem('clientCode') ?? undefined;
  },

  async isAuthenticated() {
    await delay(100);
    const token = this.getAccessToken();

    // Renew token if it is expired
    if (isTokenExpired(token)) {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await authApi.renewToken({ refreshToken });
      if (response.accessToken) {
        saveTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
        return true;
      }

      clearTokens();
      return false;
    }

    return true;
  },

  getCurrentUser(): User | undefined {
    const token = this.getAccessToken();
    if (!token) {
      return undefined;
    }

    const payload = decodeJWT(token);
    if (!payload) {
      return undefined;
    }

    return {
      id: payload.sub,
      email: payload.email,
      isRoot: payload.isRoot,
    };
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    try {
      const response = await authApi.forgotPassword(data);
      return response;
    } catch (error) {
      logError('Failed to send password reset email', error, {
        module: 'AuthService',
        action: 'forgotPassword',
        metadata: { email: data.email },
      });
      throw error;
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
      const response = await authApi.resetPassword(data);
      return response;
    } catch (error) {
      logError('Failed to reset password', error, {
        module: 'AuthService',
        action: 'resetPassword',
      });
      throw error;
    }
  },
};

function saveClientCode(clientCode: string) {
  localStorage.setItem('clientCode', clientCode);
}

function saveTokens({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

async function resolveAuthResponse(response: { accessToken: string; refreshToken: string }) {
  saveTokens({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });

  // Extract user info from JWT
  const payload = decodeJWT(response.accessToken);
  if (!payload) {
    throw new Error('Invalid token received');
  }

  const user: User = {
    id: payload.sub,
    email: payload.email,
    isRoot: payload.isRoot,
  };

  return { user };
}
