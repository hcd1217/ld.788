import { BaseApiClient } from '../base';
import {
  type CompleteDelivery,
  CompleteDeliverySchema,
  type CreateDeliveryRequest,
  type CreateDeliveryRequestResponse,
  CreateDeliveryRequestResponseSchema,
  CreateDeliveryRequestSchema,
  type DeliveryStatus,
  type GetDeliveryRequestResponse,
  GetDeliveryRequestResponseSchema,
  type GetDeliveryRequestsResponse,
  GetDeliveryRequestsResponseSchema,
  type UpdateDeliveryOrderInDay,
  UpdateDeliveryOrderInDaySchema,
  type UpdateDeliveryRequest,
  UpdateDeliveryRequestSchema,
  type UpdateDeliveryStatus,
  UpdateDeliveryStatusSchema,
  type UploadPhotos,
  UploadPhotosSchema,
} from '../schemas/deliveryRequest.schemas';

export class DeliveryRequestApi extends BaseApiClient {
  // ========== Delivery Request APIs ==========

  async getDeliveryRequests(params?: {
    status?: DeliveryStatus;
    assignedTo?: string;
    scheduledDate?: string;
    scheduledDateFrom?: string;
    scheduledDateTo?: string;
    deliveryRequestNumber?: string;
    customerId?: string;
    cursor?: string;
    limit?: number;
    sortBy?: 'createdAt' | 'scheduledDate' | 'status' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<GetDeliveryRequestsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    if (params?.scheduledDate) queryParams.append('scheduledDate', params.scheduledDate);
    if (params?.scheduledDateFrom)
      queryParams.append('scheduledDateFrom', params.scheduledDateFrom);
    if (params?.scheduledDateTo) queryParams.append('scheduledDateTo', params.scheduledDateTo);
    if (params?.deliveryRequestNumber)
      queryParams.append('deliveryRequestNumber', params.deliveryRequestNumber);
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    if (params?.cursor) queryParams.append('cursor', params.cursor);
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    // Use default limit from swagger (20)
    if (!params?.limit) queryParams.append('limit', '20');

    const url = `/api/sales/delivery-requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<GetDeliveryRequestsResponse, void>(
      url,
      undefined,
      GetDeliveryRequestsResponseSchema,
    );
  }

  async getDeliveryRequestById(id: string): Promise<GetDeliveryRequestResponse> {
    return this.get<GetDeliveryRequestResponse, void>(
      `/api/sales/delivery-requests/${id}`,
      undefined,
      GetDeliveryRequestResponseSchema,
    );
  }

  async createDeliveryRequest(data: CreateDeliveryRequest): Promise<CreateDeliveryRequestResponse> {
    return this.post<CreateDeliveryRequestResponse, CreateDeliveryRequest>(
      '/api/sales/delivery-requests',
      data,
      CreateDeliveryRequestResponseSchema,
      CreateDeliveryRequestSchema,
    );
  }

  async updateDeliveryRequest(id: string, data: UpdateDeliveryRequest): Promise<void> {
    return this.patch<void, UpdateDeliveryRequest>(
      `/api/sales/delivery-requests/${id}`,
      data,
      undefined,
      UpdateDeliveryRequestSchema,
    );
  }

  async updateDeliveryStatus(id: string, data: UpdateDeliveryStatus): Promise<void> {
    return this.patch<void, UpdateDeliveryStatus>(
      `/api/sales/delivery-requests/${id}/status`,
      data,
      undefined,
      UpdateDeliveryStatusSchema,
    );
  }

  async uploadDeliveryPhotos(id: string, data: UploadPhotos): Promise<void> {
    return this.post<void, UploadPhotos>(
      `/api/sales/delivery-requests/${id}/photos`,
      {
        photoUrls: data.photoUrls.map((url) => {
          if (url.includes('mock')) {
            return '/photos/no-photo.svg';
          }
          return url;
        }),
      },
      undefined,
      UploadPhotosSchema,
    );
  }

  async completeDelivery(id: string, data: CompleteDelivery): Promise<void> {
    return this.post<void, CompleteDelivery>(
      `/api/sales/delivery-requests/${id}/complete`,
      data,
      undefined,
      CompleteDeliverySchema,
    );
  }

  async updateDeliveryOrderInDay(data: UpdateDeliveryOrderInDay): Promise<void> {
    await this.post<void, UpdateDeliveryOrderInDay>(
      '/api/sales/delivery-requests/update-delivery-order-in-day',
      data,
      undefined,
      UpdateDeliveryOrderInDaySchema,
    );
  }
}
