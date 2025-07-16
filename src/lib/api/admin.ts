import * as z from 'zod/v4';
import {BaseApiClient} from './base';

// Schemas
export const AdminLoginRequestSchema = z.object({
  accessKey: z.string(),
});

export const AdminLoginResponseSchema = z.object({
  success: z.boolean(),
});

export type AdminLoginRequest = z.infer<typeof AdminLoginRequestSchema>;
export type AdminLoginResponse = z.infer<typeof AdminLoginResponseSchema>;

export class AdminApi extends BaseApiClient {
  setAdminAccessKey(accessKey: string) {
    this.adminAccessKey = accessKey;
  }

  clearAdminAccessKey() {
    this.adminAccessKey = '';
  }

  async login(data: AdminLoginRequest): Promise<AdminLoginResponse> {
    this.adminAccessKey = data.accessKey;
    return this.post<AdminLoginResponse, AdminLoginRequest>(
      '/admin/login',
      {},
      AdminLoginResponseSchema,
    );
  }

  logout() {
    this.adminAccessKey = '';
  }
}
