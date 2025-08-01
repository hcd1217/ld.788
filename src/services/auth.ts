import {
  authApi,
  type LoginRequest,
  type LoginResponse,
  type ForgotPasswordRequest,
  type ForgotPasswordResponse,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
} from '@/lib/api';
import {decodeJWT, isTokenExpired} from '@/utils/jwt';

export type User = {
  id: string;
  email: string;
  isRoot?: boolean;
};

export const authService = {
  async login(
    credentials: LoginRequest,
  ): Promise<{response: LoginResponse; user: User}> {
    try {
      saveClientCode(credentials.clientCode);
      const response = await authApi.login(credentials);
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

      return {response, user};
    } catch (error) {
      console.error('Login failed', error);
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
    const token = this.getAccessToken();

    // Renew token if it is expired
    if (isTokenExpired(token)) {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await authApi.renewToken({refreshToken});
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

  async forgotPassword(
    data: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    try {
      const response = await authApi.forgotPassword(data);
      return response;
    } catch (error) {
      console.error('Failed to send password reset email', error);
      throw error;
    }
  },

  async resetPassword(
    data: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    try {
      const response = await authApi.resetPassword(data);
      return response;
    } catch (error) {
      console.error('Failed to reset password', error);
      throw error;
    }
  },
};

function saveClientCode(clientCode: string) {
  localStorage.setItem('clientCode', clientCode);
}

function saveTokens({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}
