import type * as z from 'zod/v4';
import { BaseApiClient } from '../base';
import {
  AdminLoginResponseSchema,
  ClientListResponseSchema,
  ClientDetailSchema,
  AdminRegisterClientRequestSchema,
  AdminRegisterClientResponseSchema,
  HardDeleteClientRequestSchema,
  HardDeleteClientResponseSchema,
  SuspendClientRequestSchema,
  SuspendClientResponseSchema,
  ReactivateClientRequestSchema,
  ReactivateClientResponseSchema,
  GetAllAdminPermissionsResponseSchema,
  CreateAdminPermissionRequestSchema,
  CreateAdminPermissionResponseSchema,
  UpdateAdminPermissionRequestSchema,
  UpdateAdminPermissionResponseSchema,
  DeleteAdminPermissionResponseSchema,
  CreateDynamicFeatureFlagRequestSchema,
  UpdateDynamicFeatureFlagRequestSchema,
  DynamicFeatureFlagResponseSchema,
  type AdminLoginRequest,
  type AdminLoginResponse,
  type ClientListResponse,
  type ClientDetail,
  type AdminRegisterClientRequest,
  type AdminRegisterClientResponse,
  type HardDeleteClientRequest,
  type HardDeleteClientResponse,
  type SuspendClientRequest,
  type SuspendClientResponse,
  type ReactivateClientRequest,
  type ReactivateClientResponse,
  type GetAllAdminPermissionsResponse,
  type CreateAdminPermissionRequest,
  type CreateAdminPermissionResponse,
  type UpdateAdminPermissionRequest,
  type UpdateAdminPermissionResponse,
  type DeleteAdminPermissionResponse,
  type CreateDynamicFeatureFlagRequest,
  type UpdateDynamicFeatureFlagRequest,
  type DynamicFeatureFlagResponse,
} from '../schemas/admin.schemas';
import { useAppStore } from '@/stores/useAppStore';

export class AdminApi extends BaseApiClient {
  setAdminAccessKey(accessKey: string) {
    this.adminAccessKey = accessKey;
  }

  clearAdminAccessKey() {
    this.adminAccessKey = '';
  }

  // Override base HTTP methods to add loading state tracking
  async get<T, R = unknown>(
    endpoint: string,
    params?: R,
    schema?: z.ZodSchema<T>,
    paramsSchema?: z.ZodSchema<R>,
  ): Promise<T> {
    return this.requestWrapper(async () => super.get(endpoint, params, schema, paramsSchema));
  }

  async post<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>,
  ): Promise<T> {
    return this.requestWrapper(async () => super.post(endpoint, data, schema, dataSchema));
  }

  async put<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>,
  ): Promise<T> {
    return this.requestWrapper(async () => super.put(endpoint, data, schema, dataSchema));
  }

  async patch<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>,
  ): Promise<T> {
    return this.requestWrapper(async () => super.patch(endpoint, data, schema, dataSchema));
  }

  async delete<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>,
  ): Promise<T> {
    const { setAdminApiLoading } = useAppStore.getState();

    try {
      setAdminApiLoading(true);
      return await super.delete(endpoint, data, schema, dataSchema);
    } finally {
      setAdminApiLoading(false);
    }
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

  async getClient(clientCode: string): Promise<ClientDetail> {
    return this.get(`/admin/clients/${clientCode}`, undefined, ClientDetailSchema);
  }

  async registerClient(data: AdminRegisterClientRequest): Promise<AdminRegisterClientResponse> {
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

  async reactivateClient(clientCode: string): Promise<ReactivateClientResponse> {
    return this.patch<ReactivateClientResponse, ReactivateClientRequest>(
      `/admin/clients/${clientCode}/reactivate`,
      {},
      ReactivateClientResponseSchema,
      ReactivateClientRequestSchema,
    );
  }

  // Admin Permission Management Methods
  async getAllAdminPermissions(params?: {
    search?: string;
    offset?: number;
    limit?: number;
  }): Promise<GetAllAdminPermissionsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const url = `/admin/permissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.get<GetAllAdminPermissionsResponse, void>(
      url,
      undefined,
      GetAllAdminPermissionsResponseSchema,
    );
  }

  async createAdminPermission(
    data: CreateAdminPermissionRequest,
  ): Promise<CreateAdminPermissionResponse> {
    return this.post<CreateAdminPermissionResponse, CreateAdminPermissionRequest>(
      '/admin/permissions',
      data,
      CreateAdminPermissionResponseSchema,
      CreateAdminPermissionRequestSchema,
    );
  }

  async updateAdminPermission(
    id: string,
    data: UpdateAdminPermissionRequest,
  ): Promise<UpdateAdminPermissionResponse> {
    return this.put<UpdateAdminPermissionResponse, UpdateAdminPermissionRequest>(
      `/admin/permissions/${id}`,
      data,
      UpdateAdminPermissionResponseSchema,
      UpdateAdminPermissionRequestSchema,
    );
  }

  async deleteAdminPermission(id: string): Promise<DeleteAdminPermissionResponse> {
    return this.delete<DeleteAdminPermissionResponse>(
      `/admin/permissions/${id}`,
      undefined,
      DeleteAdminPermissionResponseSchema,
    );
  }

  // Dynamic Feature Flag Management Methods
  async createDynamicFeatureFlag(
    data: CreateDynamicFeatureFlagRequest,
  ): Promise<DynamicFeatureFlagResponse> {
    return this.post<DynamicFeatureFlagResponse, CreateDynamicFeatureFlagRequest>(
      '/admin/dynamic-feature-flags',
      data,
      DynamicFeatureFlagResponseSchema,
      CreateDynamicFeatureFlagRequestSchema,
    );
  }

  async updateDynamicFeatureFlag(
    clientId: string,
    key: string,
    data: UpdateDynamicFeatureFlagRequest,
  ): Promise<DynamicFeatureFlagResponse> {
    return this.put<DynamicFeatureFlagResponse, UpdateDynamicFeatureFlagRequest>(
      `/admin/dynamic-feature-flags/${clientId}/${key}`,
      data,
      DynamicFeatureFlagResponseSchema,
      UpdateDynamicFeatureFlagRequestSchema,
    );
  }

  private async requestWrapper<R>(handler: () => Promise<R>): Promise<R> {
    const { setAdminApiLoading } = useAppStore.getState();

    try {
      setAdminApiLoading(true);
      return await handler();
    } finally {
      setAdminApiLoading(false);
    }
  }
}
