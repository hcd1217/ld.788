import { deliveryRequestApi } from '@/lib/api';
import {
  type DeliveryRequest as ApiDeliveryRequest,
  type DeliveryRequestDetail as ApiDeliveryRequestDetail,
  type CreateDeliveryRequest,
  type UpdateDeliveryRequest,
  type DeliveryStatus,
} from '@/lib/api/schemas/deliveryRequest.schemas';
import { logError, logInfo } from '@/utils/logger';

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
  purchaseOrderNumber?: string;
};

export type DeliveryRequestDetail = Omit<ApiDeliveryRequestDetail, 'metadata'> & {
  purchaseOrderNumber?: string;
};

/**
 * Transform API DeliveryRequest to Frontend DeliveryRequest
 */
function transformApiToFrontend(apiDR: ApiDeliveryRequest): DeliveryRequest {
  const { ...rest } = apiDR;
  return {
    ...rest,
    purchaseOrderNumber: apiDR.poNumber,
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

  async getDeliveryRequestById(id: string): Promise<DeliveryRequestDetail | undefined> {
    try {
      const dr = await deliveryRequestApi.getDeliveryRequestById(id);
      if (dr) {
        return transformApiToFrontend(dr);
      }
    } catch (error) {
      logError('Failed to get delivery request by ID', {
        module: 'DeliveryRequestService',
        action: 'getDeliveryRequestById',
        metadata: { id, error },
      });
      throw error;
    }
  },

  async createDeliveryRequest(data: CreateDeliveryRequest): Promise<DeliveryRequest> {
    try {
      logInfo('Creating delivery request', {
        module: 'DeliveryRequestService',
        action: 'createDeliveryRequest',
        metadata: { purchaseOrderId: data.purchaseOrderId },
      });

      const response = await deliveryRequestApi.createDeliveryRequest(data);
      return transformApiToFrontend(response);
    } catch (error) {
      logError('Failed to create delivery request', {
        module: 'DeliveryRequestService',
        action: 'createDeliveryRequest',
        metadata: { data, error },
      });
      throw error;
    }
  },

  async updateDeliveryRequest(id: string, data: UpdateDeliveryRequest): Promise<void> {
    try {
      logInfo('Updating delivery request', {
        module: 'DeliveryRequestService',
        action: 'updateDeliveryRequest',
        metadata: { id, data },
      });

      await deliveryRequestApi.updateDeliveryRequest(id, data);
    } catch (error) {
      logError('Failed to update delivery request', {
        module: 'DeliveryRequestService',
        action: 'updateDeliveryRequest',
        metadata: { id, data, error },
      });
      throw error;
    }
  },

  async updateDeliveryStatus(id: string, status: DeliveryStatus, notes?: string): Promise<void> {
    try {
      logInfo('Updating delivery status', {
        module: 'DeliveryRequestService',
        action: 'updateDeliveryStatus',
        metadata: { id, status, notes },
      });

      await deliveryRequestApi.updateDeliveryStatus(id, { status, notes });
    } catch (error) {
      logError('Failed to update delivery status', {
        module: 'DeliveryRequestService',
        action: 'updateDeliveryStatus',
        metadata: { id, status, notes, error },
      });
      throw error;
    }
  },

  async uploadPhotos(id: string, photoUrls: string[]): Promise<void> {
    try {
      logInfo('Uploading delivery photos', {
        module: 'DeliveryRequestService',
        action: 'uploadPhotos',
        metadata: { id, photoCount: photoUrls.length },
      });

      await deliveryRequestApi.uploadDeliveryPhotos(id, { photoUrls });
    } catch (error) {
      logError('Failed to upload delivery photos', {
        module: 'DeliveryRequestService',
        action: 'uploadPhotos',
        metadata: { id, photoCount: photoUrls.length, error },
      });
      throw error;
    }
  },

  async completeDelivery(
    id: string,
    data?: { photoUrls?: string[]; notes?: string },
  ): Promise<void> {
    try {
      logInfo('Completing delivery', {
        module: 'DeliveryRequestService',
        action: 'completeDelivery',
        metadata: { id, hasPhotos: !!data?.photoUrls, hasNotes: !!data?.notes },
      });

      await deliveryRequestApi.completeDelivery(id, data || {});
    } catch (error) {
      logError('Failed to complete delivery', {
        module: 'DeliveryRequestService',
        action: 'completeDelivery',
        metadata: { id, data, error },
      });
      throw error;
    }
  },

  // Helper to check if status transition is valid
  isValidStatusTransition(currentStatus: DeliveryStatus, newStatus: DeliveryStatus): boolean {
    const transitions: Record<DeliveryStatus, DeliveryStatus[]> = {
      PENDING: ['IN_TRANSIT'],
      IN_TRANSIT: ['COMPLETED'],
      COMPLETED: [], // Terminal status
    };

    return transitions[currentStatus]?.includes(newStatus) ?? false;
  },

  // Helper to get next valid statuses
  getNextValidStatuses(currentStatus: DeliveryStatus): DeliveryStatus[] {
    const transitions: Record<DeliveryStatus, DeliveryStatus[]> = {
      PENDING: ['IN_TRANSIT'],
      IN_TRANSIT: ['COMPLETED'],
      COMPLETED: [],
    };

    return transitions[currentStatus] ?? [];
  },
};
