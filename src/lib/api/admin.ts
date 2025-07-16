import * as z from 'zod/v4';
import {BaseApiClient} from './base';
import {clientCodeSchema, emailSchema, timestampSchema} from './schema';
import {delay} from '@/utils/time';

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

export const UpdateClientRequestSchema = z.object({
  clientName: z.string().min(3).max(100).optional(),
  rootUser: z
    .object({
      email: z.string().email(),
      firstName: z.string().min(2).max(50),
      lastName: z.string().min(2).max(50),
    })
    .optional(),
  status: z.enum(['active', 'suspended']).optional(),
});

export const ClientListResponseSchema = z.object({
  clients: z.array(ClientSchema),
  total: z.number(),
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
export type UpdateClientRequest = z.infer<typeof UpdateClientRequestSchema>;
export type ClientListResponse = z.infer<typeof ClientListResponseSchema>;

export class AdminApi extends BaseApiClient {
  // Fake data store
  private static fakeClients: Client[] = [
    {
      id: '1',
      clientCode: 'ALPHA',
      clientName: 'Alpha Corporation',
      rootUser: {
        email: 'admin@alpha.com',
        firstName: 'John',
        lastName: 'Doe',
      },
      createdAt: '2024-01-15T10:00:00Z',
      status: 'active',
    },
    {
      id: '2',
      clientCode: 'BETA',
      clientName: 'Beta Industries',
      rootUser: {
        email: 'admin@beta.com',
        firstName: 'Jane',
        lastName: 'Smith',
      },
      createdAt: '2024-02-20T14:30:00Z',
      status: 'active',
    },
    {
      id: '3',
      clientCode: 'GAMMA',
      clientName: 'Gamma Solutions',
      rootUser: {
        email: 'admin@gamma.com',
        firstName: 'Robert',
        lastName: 'Johnson',
      },
      createdAt: '2024-03-10T09:15:00Z',
      status: 'suspended',
    },
  ];

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

  async getClient(id: string): Promise<Client> {
    // Simulate API delay
    await delay(300);

    const client = AdminApi.fakeClients.find((c) => c.id === id);
    if (!client) {
      throw new Error('Client not found');
    }

    return client;
  }

  async registerClient(
    data: AdminRegisterClientRequest,
  ): Promise<AdminRegisterClientResponse> {
    return this.post<AdminRegisterClientResponse, AdminRegisterClientRequest>(
      'admin/clients/register',
      data,
      AdminRegisterClientResponseSchema,
      AdminRegisterClientRequestSchema,
    );
  }

  async updateClient(id: string, data: UpdateClientRequest): Promise<Client> {
    // Simulate API delay
    await delay(600);

    const index = AdminApi.fakeClients.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('Client not found');
    }

    // Update client
    const updatedClient = {
      ...AdminApi.fakeClients[index],
      ...(data.clientName && {clientName: data.clientName}),
      ...(data.rootUser && {rootUser: {...data.rootUser}}),
      ...(data.status && {status: data.status}),
    };

    AdminApi.fakeClients[index] = updatedClient;
    return updatedClient;
  }

  async deleteClient(id: string): Promise<void> {
    // Simulate API delay
    // await delay(500);

    const index = AdminApi.fakeClients.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('Client not found');
    }

    // For now, just suspend instead of delete
    AdminApi.fakeClients[index].status = 'suspended';
  }
}
