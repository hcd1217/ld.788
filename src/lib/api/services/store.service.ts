import {BaseApiClient} from '../base';
import {
  StoreSchema,
  CreateStoreRequestSchema,
  CreateStoreResponseSchema,
  UpdateStoreRequestSchema,
  UpdateStoreResponseSchema,
  GetStoresResponseSchema,
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
  type GetStoreOperatingHoursResponse,
  type UpdateStoreOperatingHoursRequest,
  type UpdateStoreOperatingHoursResponse,
} from '../schemas/store.schemas';
import {
  CreateStaffRequestSchema,
  CreateStaffResponseSchema,
  GetStaffListResponseSchema,
  UpdateStaffRequestSchema,
  UpdateStaffResponseSchema,
  DeleteStaffResponseSchema,
  type CreateStaffRequest,
  type CreateStaffResponse,
  type GetStaffListResponse,
  type UpdateStaffRequest,
  type UpdateStaffResponse,
  type DeleteStaffResponse,
} from '../schemas/staff.schemas';

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

  async deleteStore(id: string): Promise<void> {
    return this.delete(`/stores/${id}`);
  }

  // Store Staff methods
  async getStoreStaff(storeId: string): Promise<GetStaffListResponse> {
    return this.get<GetStaffListResponse, void>(
      `/stores/${storeId}/staff`,
      undefined,
      GetStaffListResponseSchema,
    );
  }

  async createStoreStaff(
    storeId: string,
    data: CreateStaffRequest,
  ): Promise<CreateStaffResponse> {
    return this.post<CreateStaffResponse, CreateStaffRequest>(
      `/stores/${storeId}/staff`,
      data,
      CreateStaffResponseSchema,
      CreateStaffRequestSchema,
    );
  }

  async updateStoreStaff(
    storeId: string,
    staffId: string,
    data: UpdateStaffRequest,
  ): Promise<UpdateStaffResponse> {
    return this.patch<UpdateStaffResponse, UpdateStaffRequest>(
      `/stores/${storeId}/staff/${staffId}`,
      data,
      UpdateStaffResponseSchema,
      UpdateStaffRequestSchema,
    );
  }

  async deleteStoreStaff(
    storeId: string,
    staffId: string,
  ): Promise<DeleteStaffResponse> {
    return this.delete<DeleteStaffResponse, void>(
      `/stores/${storeId}/staff/${staffId}`,
      undefined,
      DeleteStaffResponseSchema,
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
