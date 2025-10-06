import { deliveryRequestApi } from '@/lib/api';
import {
  type DeliveryRequest as ApiDeliveryRequest,
  type CompleteDelivery,
  type CreateDeliveryRequest,
  type DeliveryRequestType,
  type DeliveryStatus,
  type StartTransit,
  type UpdateDeliveryRequest,
} from '@/lib/api/schemas/deliveryRequest.schemas';
import type { CustomerOverview, EmployeeOverview } from '@/services/client/overview';
import type { Address, PhotoData } from '@/types';

import { overviewService } from '../client/overview';

// Re-export types for compatibility
export type {
  DeliveryStatus,
  CreateDeliveryRequest,
  UpdateDeliveryRequest,
  UpdateDeliveryStatus,
} from '@/lib/api/schemas/deliveryRequest.schemas';

// Frontend types with transformed metadata
export type DeliveryRequest = Omit<ApiDeliveryRequest, 'metadata'> & {
  isReceive: boolean;
  isDelivery: boolean;
  isUrgentDelivery?: boolean;
  type: DeliveryRequestType;
  deliveryRequestNumber: string;
  purchaseOrderNumber?: string | undefined;
  purchaseOrderId?: string | undefined;
  customerName?: string | undefined;
  customerId?: string | undefined;
  deliveryPerson: string | undefined;
  deliveryAddress?: Address | undefined;
  receiveAddress?: Address | undefined;
  photos: PhotoData[];
};

/**
 * Transform API DeliveryRequest to Frontend DeliveryRequest
 */
function transformApiToFrontend(
  apiDR: ApiDeliveryRequest,
  customerMapByCustomerId: Map<string, CustomerOverview>,
  employeeMapByEmployeeId: Map<string, EmployeeOverview>,
): DeliveryRequest {
  const { ...rest } = apiDR;
  const customerId = apiDR.purchaseOrder?.customerId;
  const customerName = customerId ? (customerMapByCustomerId.get(customerId)?.name ?? '') : '';

  const employee = apiDR.assignedTo ? employeeMapByEmployeeId.get(apiDR.assignedTo) : undefined;
  const deliveryPerson = employee?.fullName ?? '';
  return {
    ...rest,
    deliveryPerson,
    isReceive: apiDR.type === 'RECEIVE',
    isDelivery: apiDR.type === 'DELIVERY',
    isUrgentDelivery: apiDR?.isUrgentDelivery ?? false,
    type: apiDR.type,
    purchaseOrderId: apiDR?.purchaseOrder?.poId,
    purchaseOrderNumber: apiDR?.purchaseOrder?.poNumber as string,
    customerName,
    customerId: apiDR?.purchaseOrder?.customerId,
    photos: apiDR.photos ?? [],
    deliveryAddress: apiDR.deliveryAddress ?? {},
    receiveAddress: apiDR.receiveAddress ?? {},
  };
}

// Filter parameters for delivery requests
export type DeliveryRequestFilterParams = {
  status?: DeliveryStatus;
  statuses?: DeliveryStatus[];
  assignedTo?: string;
  scheduledDateFrom?: string | Date;
  scheduledDateTo?: string | Date;
  deliveryRequestNumber?: string;
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
    const customerMapByCustomerId = await overviewService.getCustomerOverview();
    const employeeMapByEmployeeId = await overviewService.getEmployeeOverview();
    // Transform Date objects to ISO strings for API
    const apiParams = filters
      ? {
          status: filters.status,
          statuses: filters.statuses,
          assignedTo: filters.assignedTo,
          scheduledDateFrom:
            filters.scheduledDateFrom instanceof Date
              ? filters.scheduledDateFrom.toISOString()
              : filters.scheduledDateFrom,
          scheduledDateTo:
            filters.scheduledDateTo instanceof Date
              ? filters.scheduledDateTo.toISOString()
              : filters.scheduledDateTo,
          deliveryRequestNumber: filters.deliveryRequestNumber,
          customerId: filters.customerId,
          cursor: filters.cursor,
          limit: filters.limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        }
      : undefined;

    const response = await deliveryRequestApi.getDeliveryRequests(apiParams);
    const deliveryRequests = response.deliveryRequests
      .sort((a, b) => {
        if (a.isUrgentDelivery && !b.isUrgentDelivery) return -1;
        if (!a.isUrgentDelivery && b.isUrgentDelivery) return 1;
        const _a = a.scheduledDate.setHours(0, 0, 0, 0);
        const _b = b.scheduledDate.setHours(0, 0, 0, 0);
        if (_a === _b) {
          const _a = a.deliveryOrderInDay ?? 0;
          const _b = b.deliveryOrderInDay ?? 0;
          return _a - _b;
        }
        return _a - _b;
      })
      .map((dr) => transformApiToFrontend(dr, customerMapByCustomerId, employeeMapByEmployeeId));

    return {
      deliveryRequests,
      pagination: response.pagination,
    };
  },

  async getDeliveryRequestById(id: string): Promise<DeliveryRequest | undefined> {
    try {
      const customerMapByCustomerId = await overviewService.getCustomerOverview();
      const employeeMapByEmployeeId = await overviewService.getEmployeeOverview();
      const dr = await deliveryRequestApi.getDeliveryRequestById(id);
      return dr
        ? transformApiToFrontend(dr, customerMapByCustomerId, employeeMapByEmployeeId)
        : undefined;
    } catch {
      return undefined;
    }
  },

  async createDeliveryRequest(data: CreateDeliveryRequest): Promise<DeliveryRequest> {
    const customerMapByCustomerId = await overviewService.getCustomerOverview();
    const employeeMapByEmployeeId = await overviewService.getEmployeeOverview();
    const response = await deliveryRequestApi.createDeliveryRequest(data);
    return transformApiToFrontend(response, customerMapByCustomerId, employeeMapByEmployeeId);
  },

  async updateDeliveryRequest(id: string, data: UpdateDeliveryRequest): Promise<void> {
    await deliveryRequestApi.updateDeliveryRequest(id, data);
  },

  async updateDeliveryStatus(id: string, status: DeliveryStatus, notes?: string): Promise<void> {
    await deliveryRequestApi.updateDeliveryStatus(id, { status, notes });
  },

  async uploadPhotos(
    id: string,
    photos: {
      caption?: string;
      publicUrl: string;
      key: string;
    }[],
  ): Promise<void> {
    await deliveryRequestApi.uploadDeliveryPhotos(id, {
      photos: photos.map((photo) => ({
        publicUrl: photo.publicUrl,
        key: photo.key,
        caption: photo.caption,
      })),
    });
  },

  async deletePhoto(id: string, photoId: string): Promise<void> {
    await deliveryRequestApi.deleteDeliveryPhoto(id, { photoId });
  },

  async startTransit(id: string, data: StartTransit): Promise<void> {
    await deliveryRequestApi.startTransit(id, data);
  },

  async completeDelivery(id: string, data: CompleteDelivery): Promise<void> {
    await deliveryRequestApi.completeDelivery(id, data);
  },

  async deleteDeliveryRequest(id: string): Promise<void> {
    await deliveryRequestApi.deleteDeliveryRequest(id);
  },

  async updateDeliveryOrderInDay(
    assignedTo: string,
    orderedDeliveryRequestIds: string[],
  ): Promise<void> {
    const sortOrder = orderedDeliveryRequestIds.map((id, index) => ({
      id,
      deliveryOrderInDay: index + 1,
    }));
    await deliveryRequestApi.updateDeliveryOrderInDay({
      assignedTo: assignedTo,
      sortOrder,
    });
  },
};
