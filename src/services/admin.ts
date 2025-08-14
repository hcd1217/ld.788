import { type AdminLoginRequest, adminApi } from '@/lib/api';
import { logError } from '@/utils/logger';

export const adminService = {
  async login({ accessKey }: AdminLoginRequest): Promise<{ success: boolean }> {
    try {
      const response = await adminApi.login({ accessKey });
      return response;
    } catch (error) {
      logError('Login failed', error, {
        module: 'AdminService',
        action: 'login',
      });
      return { success: false };
    }
  },

  logout() {
    adminApi.logout();
  },
};
