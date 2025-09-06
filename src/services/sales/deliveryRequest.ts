import { deliveryRequestApi } from '@/lib/api';
import {
  type DeliveryRequest as ApiDeliveryRequest,
  type CreateDeliveryRequest,
  type UpdateDeliveryRequest,
  type DeliveryStatus,
} from '@/lib/api/schemas/deliveryRequest.schemas';

// Re-export types for compatibility
export type {
  DeliveryStatus,
  PICType,
  CreateDeliveryRequest,
  UpdateDeliveryRequest,
  UpdateDeliveryStatus,
} from '@/lib/api/schemas/deliveryRequest.schemas';

// Frontend types with transformed metadata
export type DeliveryRequest = Omit<ApiDeliveryRequest, 'metadata'> & {
  deliveryRequestNumber: string;
  purchaseOrderNumber?: string | undefined;
  purchaseOrderId?: string | undefined;
  customerName?: string | undefined;
  customerId?: string | undefined;
  photoUrls: string[];
  deliveryAddress?: {
    oneLineAddress?: string;
    googleMapsUrl?: string;
  };
};

/**
 * Transform API DeliveryRequest to Frontend DeliveryRequest
 */
function transformApiToFrontend(apiDR: ApiDeliveryRequest): DeliveryRequest {
  const { ...rest } = apiDR;
  return {
    ...rest,
    purchaseOrderId: apiDR.metadata?.po?.poId,
    purchaseOrderNumber: apiDR.metadata?.po?.poNumber,
    customerName: apiDR.metadata?.po?.customerName,
    customerId: apiDR.metadata?.po?.customerId,
    photoUrls: apiDR.metadata?.photoUrls ?? [],
    deliveryAddress: apiDR.metadata?.deliveryAddress ?? {},
  };
}

// Filter parameters for delivery requests
export type DeliveryRequestFilterParams = {
  status?: DeliveryStatus;
  assignedTo?: string;
  scheduledDate?: string | Date;
  scheduledDateFrom?: string | Date;
  scheduledDateTo?: string | Date;
  purchaseOrderId?: string;
  customerId?: string;
  cursor?: string;
  limit?: number;
  sortBy?: 'createdAt' | 'scheduledDate' | 'status' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
};

export const deliveryRequestService = {
  async getDeliveryRequestsWithFilter(filters?: DeliveryRequestFilterParams): Promise<{
    deliveryRequests: DeliveryRequest[];
    pagination: {
      hasNext: boolean;
      hasPrev: boolean;
      nextCursor?: string;
      prevCursor?: string;
      limit: number;
    };
  }> {
    // Transform Date objects to ISO strings for API
    const apiParams = filters
      ? {
          status: filters.status,
          assignedTo: filters.assignedTo,
          scheduledDate:
            filters.scheduledDate instanceof Date
              ? filters.scheduledDate.toISOString()
              : filters.scheduledDate,
          scheduledDateFrom:
            filters.scheduledDateFrom instanceof Date
              ? filters.scheduledDateFrom.toISOString()
              : filters.scheduledDateFrom,
          scheduledDateTo:
            filters.scheduledDateTo instanceof Date
              ? filters.scheduledDateTo.toISOString()
              : filters.scheduledDateTo,
          purchaseOrderId: filters.purchaseOrderId,
          customerId: filters.customerId,
          cursor: filters.cursor,
          limit: filters.limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        }
      : undefined;

    const response = await deliveryRequestApi.getDeliveryRequests(apiParams);

    return {
      deliveryRequests: response.deliveryRequests.map(transformApiToFrontend),
      pagination: response.pagination,
    };
  },

  async getDeliveryRequestById(id: string): Promise<DeliveryRequest | undefined> {
    try {
      const dr = await deliveryRequestApi.getDeliveryRequestById(id);
      return dr ? transformApiToFrontend(dr) : undefined;
    } catch {
      return undefined;
    }
  },

  async createDeliveryRequest(data: CreateDeliveryRequest): Promise<DeliveryRequest> {
    const response = await deliveryRequestApi.createDeliveryRequest(data);
    return transformApiToFrontend(response);
  },

  async updateDeliveryRequest(id: string, data: UpdateDeliveryRequest): Promise<void> {
    await deliveryRequestApi.updateDeliveryRequest(id, data);
  },

  async updateDeliveryStatus(id: string, status: DeliveryStatus, notes?: string): Promise<void> {
    await deliveryRequestApi.updateDeliveryStatus(id, { status, notes });
  },

  async uploadPhotos(id: string, photoUrls: string[]): Promise<void> {
    await deliveryRequestApi.uploadDeliveryPhotos(id, { photoUrls });
  },

  async completeDelivery(
    id: string,
    data?: { photoUrls?: string[]; notes?: string },
  ): Promise<void> {
    await deliveryRequestApi.completeDelivery(id, data || {});
  },
};
