import { type AdminLoginRequest, adminApi } from '@/lib/api';
import { isDevelopment } from '@/utils/env';

export const adminService = {
  async login({ accessKey }: AdminLoginRequest): Promise<{ success: boolean }> {
    try {
      const response = await adminApi.login({ accessKey });
      return response;
    } catch (error) {
      if (isDevelopment) {
        console.error('Login failed', error);
      }
      return { success: false };
    }
  },

  logout() {
    adminApi.logout();
  },
};
