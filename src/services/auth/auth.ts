import { authApi, type LoginRequest } from '@/lib/api';
import { isTokenExpired } from '@/utils/jwt';
import { logError } from '@/utils/logger';
import { STORAGE_KEYS } from '@/utils/storageKeys';
import { delay } from '@/utils/time';

export const authService = {
  async loginWithMagicToken(clientCode: string, token: string) {
    try {
      saveClientCode(clientCode);
      const response = await authApi.verifyMagicLink({
        token,
      });
      saveTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    } catch (error) {
      logError('Login failed', error, {
        module: 'AuthService',
        action: 'loginWithMagicToken',
        clientCode,
      });
      throw error;
    }
  },

  async login(credentials: LoginRequest): Promise<void> {
    try {
      saveClientCode(credentials.clientCode);
      const response = await authApi.login(credentials);
      saveTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    } catch (error) {
      logError('Login failed', error, {
        module: 'AuthService',
        action: 'login',
        clientCode: credentials.clientCode,
      });
      throw error;
    }
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await authApi.changePassword(userId, currentPassword, newPassword);
  },

  logout() {
    clearTokens();
  },

  getAccessToken() {
    return sessionStorage.getItem(STORAGE_KEYS.AUTH.ACCESS_TOKEN) ?? undefined;
  },

  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH.REFRESH_TOKEN) ?? undefined;
  },

  getClientCode() {
    return localStorage.getItem(STORAGE_KEYS.AUTH.CLIENT_CODE) ?? undefined;
  },

  hasValidToken() {
    const token = this.getAccessToken();
    return Boolean(token && !isTokenExpired(token));
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
};

function saveClientCode(clientCode: string) {
  localStorage.setItem(STORAGE_KEYS.AUTH.CLIENT_CODE, clientCode);
}

function saveTokens({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
  sessionStorage.setItem(STORAGE_KEYS.AUTH.ACCESS_TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.AUTH.REFRESH_TOKEN, refreshToken);
}

function clearTokens() {
  sessionStorage.removeItem(STORAGE_KEYS.AUTH.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.AUTH.REFRESH_TOKEN);
}
