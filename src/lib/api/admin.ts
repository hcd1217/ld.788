import * as z from 'zod/v4';
import {BaseApiClient} from './base';
import {clientCodeSchema, emailSchema, timestampSchema} from './schema';

// Login Schemas
export const AdminLoginRequestSchema = z.object({
  accessKey: z.string(),
});

export const AdminLoginResponseSchema = z.object({
  success: z.boolean(),
});

// Client Management Schemas
export const ClientSchema = z
  .object({
    id: z.string(),
    clientCode: z.string(),
    clientName: z.string(),
    rootUser: z.object({
      email: emailSchema,
      firstName: z.string(),
      lastName: z.string(),
    }),
    createdAt: timestampSchema,
    isActive: z.boolean(),
    status: z.enum(['active', 'suspended']).default('active'),
  })
  .transform(({isActive, ...data}) => {
    data.status = isActive ? 'active' : 'suspended';
    return data;
  });

export const AdminRegisterClientRequestSchema = z.object({
  clientCode: clientCodeSchema,
  clientName: z.string().min(3).max(100),
  rootUserEmail: emailSchema,
  rootUserPassword: z.string().min(12),
  rootUserFirstName: z.string().min(2).max(50),
  rootUserLastName: z.string().min(2).max(50),
});

export const AdminRegisterClientResponseSchema = z.object({
  success: z.boolean(),
  clientId: z.string(),
});

export const ClientListResponseSchema = z.object({
  clients: z.array(ClientSchema),
  total: z.number(),
});

// Suspend/Activate Client Schemas
export const SuspendClientRequestSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const SuspendClientResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const ReactivateClientRequestSchema = z.object({});

export const ReactivateClientResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Hard Delete Client Schemas
export const HardDeleteClientRequestSchema = z.object({
  confirmClientCode: z.string(),
  reason: z.string().min(1).max(500),
});

export const HardDeleteClientResponseSchema = z.object({
  message: z.string(),
});

// Type exports
export type AdminLoginRequest = z.infer<typeof AdminLoginRequestSchema>;
export type AdminLoginResponse = z.infer<typeof AdminLoginResponseSchema>;
export type Client = z.infer<typeof ClientSchema>;
export type AdminRegisterClientRequest = z.infer<
  typeof AdminRegisterClientRequestSchema
>;
export type AdminRegisterClientResponse = z.infer<
  typeof AdminRegisterClientResponseSchema
>;
export type ClientListResponse = z.infer<typeof ClientListResponseSchema>;
export type SuspendClientRequest = z.infer<typeof SuspendClientRequestSchema>;
export type SuspendClientResponse = z.infer<typeof SuspendClientResponseSchema>;
export type ReactivateClientRequest = z.infer<
  typeof ReactivateClientRequestSchema
>;
export type ReactivateClientResponse = z.infer<
  typeof ReactivateClientResponseSchema
>;
export type HardDeleteClientRequest = z.infer<
  typeof HardDeleteClientRequestSchema
>;
export type HardDeleteClientResponse = z.infer<
  typeof HardDeleteClientResponseSchema
>;

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

  // Client Management Methods
  async getClients(): Promise<ClientListResponse> {
    return this.get('/admin/clients', undefined, ClientListResponseSchema);
  }

  async getClient(clientCode: string): Promise<Client> {
    return this.get(`/admin/clients/${clientCode}`, undefined, ClientSchema);
  }

  async registerClient(
    data: AdminRegisterClientRequest,
  ): Promise<AdminRegisterClientResponse> {
    return this.post<AdminRegisterClientResponse, AdminRegisterClientRequest>(
      '/admin/clients/register',
      data,
      AdminRegisterClientResponseSchema,
      AdminRegisterClientRequestSchema,
    );
  }

  async hardDeleteClient(
    clientCode: string,
    data: HardDeleteClientRequest,
  ): Promise<HardDeleteClientResponse> {
    return this.delete<HardDeleteClientResponse, HardDeleteClientRequest>(
      `/admin/clients/${clientCode}/hard-delete`,
      data,
      HardDeleteClientResponseSchema,
      HardDeleteClientRequestSchema,
    );
  }

  async suspendClient(
    clientCode: string,
    data: SuspendClientRequest,
  ): Promise<SuspendClientResponse> {
    return this.patch<SuspendClientResponse, SuspendClientRequest>(
      `/admin/clients/${clientCode}/suspend`,
      data,
      SuspendClientResponseSchema,
      SuspendClientRequestSchema,
    );
  }

  async reactivateClient(
    clientCode: string,
  ): Promise<ReactivateClientResponse> {
    return this.patch<ReactivateClientResponse, ReactivateClientRequest>(
      `/admin/clients/${clientCode}/reactivate`,
      {},
      ReactivateClientResponseSchema,
      ReactivateClientRequestSchema,
    );
  }
}
