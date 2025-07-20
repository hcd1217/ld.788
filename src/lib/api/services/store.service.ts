import {BaseApiClient} from '../base';
import {
  StoreSchema,
  CreateStoreRequestSchema,
  CreateStoreResponseSchema,
  UpdateStoreRequestSchema,
  UpdateStoreResponseSchema,
  GetStoresResponseSchema,
  DeleteStoreResponseSchema,
  CreateStoreStaffRequestSchema,
  CreateStoreStaffResponseSchema,
  GetStoreStaffResponseSchema,
  UpdateStoreStaffRequestSchema,
  UpdateStoreStaffResponseSchema,
  DeleteStoreStaffResponseSchema,
  GetStoreOperatingHoursResponseSchema,
  UpdateStoreOperatingHoursRequestSchema,
  UpdateStoreOperatingHoursResponseSchema,
  type Store,
  type CreateStoreRequest,
  type CreateStoreResponse,
  type UpdateStoreRequest,
  type UpdateStoreResponse,
  type GetStoresRequest,
  type GetStoresResponse,
  type DeleteStoreResponse,
  type CreateStoreStaffRequest,
  type CreateStoreStaffResponse,
  type GetStoreStaffResponse,
  type UpdateStoreStaffRequest,
  type UpdateStoreStaffResponse,
  type DeleteStoreStaffResponse,
  type GetStoreOperatingHoursResponse,
  type UpdateStoreOperatingHoursRequest,
  type UpdateStoreOperatingHoursResponse,
} from '../schemas/store.schemas';

export class StoreApi extends BaseApiClient {
  // Store methods
  async getStores(params?: GetStoresRequest): Promise<GetStoresResponse> {
    const queryParams = new URLSearchParams();
    if (params?.cursor) queryParams.append('cursor', params.cursor);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.name) queryParams.append('name', params.name);
    if (params?.code) queryParams.append('code', params.code);
    if (params?.city) queryParams.append('city', params.city);
    if (params?.isActive !== undefined)
      queryParams.append('isActive', params.isActive.toString());

    const url = `/stores${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.get<GetStoresResponse, void>(
      url,
      undefined,
      GetStoresResponseSchema,
    );
  }

  async createStore(data: CreateStoreRequest): Promise<CreateStoreResponse> {
    return this.post<CreateStoreResponse, CreateStoreRequest>(
      '/stores',
      data,
      CreateStoreResponseSchema,
      CreateStoreRequestSchema,
    );
  }

  async getStore(id: string): Promise<Store> {
    return this.get<Store, void>(`/stores/${id}`, undefined, StoreSchema);
  }

  async updateStore(
    id: string,
    data: UpdateStoreRequest,
  ): Promise<UpdateStoreResponse> {
    return this.patch<UpdateStoreResponse, UpdateStoreRequest>(
      `/stores/${id}`,
      data,
      UpdateStoreResponseSchema,
      UpdateStoreRequestSchema,
    );
  }

  async deleteStore(id: string): Promise<DeleteStoreResponse> {
    return this.delete<DeleteStoreResponse, void>(
      `/stores/${id}`,
      undefined,
      DeleteStoreResponseSchema,
    );
  }

  // Store Staff methods
  async getStoreStaff(storeId: string): Promise<GetStoreStaffResponse> {
    return this.get<GetStoreStaffResponse, void>(
      `/stores/${storeId}/staff`,
      undefined,
      GetStoreStaffResponseSchema,
    );
  }

  async createStoreStaff(
    storeId: string,
    data: CreateStoreStaffRequest,
  ): Promise<CreateStoreStaffResponse> {
    return this.post<CreateStoreStaffResponse, CreateStoreStaffRequest>(
      `/stores/${storeId}/staff`,
      data,
      CreateStoreStaffResponseSchema,
      CreateStoreStaffRequestSchema,
    );
  }

  async updateStoreStaff(
    storeId: string,
    staffId: string,
    data: UpdateStoreStaffRequest,
  ): Promise<UpdateStoreStaffResponse> {
    return this.patch<UpdateStoreStaffResponse, UpdateStoreStaffRequest>(
      `/stores/${storeId}/staff/${staffId}`,
      data,
      UpdateStoreStaffResponseSchema,
      UpdateStoreStaffRequestSchema,
    );
  }

  async deleteStoreStaff(
    storeId: string,
    staffId: string,
  ): Promise<DeleteStoreStaffResponse> {
    return this.delete<DeleteStoreStaffResponse, void>(
      `/stores/${storeId}/staff/${staffId}`,
      undefined,
      DeleteStoreStaffResponseSchema,
    );
  }

  // Store Operating Hours methods
  async getStoreOperatingHours(
    storeId: string,
  ): Promise<GetStoreOperatingHoursResponse> {
    return this.get<GetStoreOperatingHoursResponse, void>(
      `/stores/${storeId}/operating-hours`,
      undefined,
      GetStoreOperatingHoursResponseSchema,
    );
  }

  async updateStoreOperatingHours(
    storeId: string,
    data: UpdateStoreOperatingHoursRequest,
  ): Promise<UpdateStoreOperatingHoursResponse> {
    return this.put<
      UpdateStoreOperatingHoursResponse,
      UpdateStoreOperatingHoursRequest
    >(
      `/stores/${storeId}/operating-hours`,
      data,
      UpdateStoreOperatingHoursResponseSchema,
      UpdateStoreOperatingHoursRequestSchema,
    );
  }
}
