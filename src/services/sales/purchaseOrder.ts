import { salesApi } from '@/lib/api';
import {
  type POItem as ApiPOItem,
  type PurchaseOrder as ApiPurchaseOrder,
  type CreatePurchaseOrderRequest,
  type POStatus,
  type POStatusHistory,
  type UpdatePOStatusRequest,
  type UpdatePurchaseOrderRequest,
} from '@/lib/api/schemas/sales.schemas';
import type { EmployeeOverview } from '@/services/client/overview';

import { overviewService } from '../client/overview';

import type { DeliveryStatus } from './deliveryRequest';

// Re-export types for compatibility
export type { POStatus, UpdatePOStatusRequest } from '@/lib/api/schemas/sales.schemas';

export type POItem = ApiPOItem;

export type PurchaseOrder = Omit<ApiPurchaseOrder, 'deliveryRequest' | 'items'> & {
  items: POItem[];
  address?: string;
  googleMapsUrl?: string;
  statusHistory?: POStatusHistory[];
  salesPerson?: string;
  isInternalDelivery: boolean;
  deliveryRequest?: {
    deliveryRequestId: string;
    deliveryRequestNumber?: string;
    isUrgentDelivery?: boolean;
    status: DeliveryStatus;
    deliveryPerson?: string;
    scheduledDate: Date | string;
  };
};

/**
 * Transform API PurchaseOrder to Frontend PurchaseOrder
 */
function transformApiToFrontend(
  apiPO: ApiPurchaseOrder,
  employeeMapByEmployeeId: Map<string, EmployeeOverview>,
): Omit<PurchaseOrder, 'customer'> {
  const salesPerson = apiPO.salesId
    ? employeeMapByEmployeeId.get(apiPO.salesId)?.fullName
    : undefined;
  const deliveryRequest = apiPO?.deliveryRequest;
  const deliveryPerson = deliveryRequest?.assignedTo
    ? employeeMapByEmployeeId.get(deliveryRequest.assignedTo)?.fullName
    : undefined;
  return {
    ...apiPO,
    salesPerson,
    isInternalDelivery: apiPO.isInternalDelivery,
    customerId: apiPO.customerId,
    address: apiPO?.shippingAddress?.oneLineAddress,
    googleMapsUrl: apiPO?.shippingAddress?.googleMapsUrl,
    statusHistory: apiPO?.statusHistory,
    deliveryRequest: apiPO?.deliveryRequest
      ? {
          deliveryRequestId: apiPO.deliveryRequest.deliveryRequestId,
          deliveryRequestNumber: apiPO.deliveryRequest.deliveryRequestNumber,
          deliveryPerson,
          isUrgentDelivery: apiPO.deliveryRequest.isUrgentDelivery,
          status: apiPO.deliveryRequest.status,
          scheduledDate: apiPO.deliveryRequest.scheduledDate,
        }
      : undefined,
    items: apiPO.items.map((item) => ({
      ...item,
      deliveryPerson: 'TODO',
      notes: item.notes ?? '',
      unit: item.unit ?? '',
      productId: item.productId ?? '',
    })),
  };
}

// Filter parameters for purchase orders
export type POFilterParams = {
  salesId?: string;
  poNumber?: string;
  customerId?: string;
  status?: POStatus; // Single status for backward compatibility
  statuses?: POStatus[]; // Multiple statuses for multi-select
  orderDateFrom?: string | Date;
  orderDateTo?: string | Date;
  deliveryDateFrom?: string | Date;
  deliveryDateTo?: string | Date;
  cursor?: string;
  limit?: number;
  sortBy?: 'createdAt' | 'orderDate' | 'poNumber' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
};

export const purchaseOrderService = {
  purchaseOrders: [] as PurchaseOrder[],

  async getPOsWithFilter(filters?: POFilterParams): Promise<{
    purchaseOrders: PurchaseOrder[];
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
          poNumber: filters.poNumber,
          customerId: filters.customerId,
          salesId: filters.salesId,
          // Support both single status and multiple statuses
          status: filters.statuses?.length === 1 ? filters.statuses[0] : filters.status,
          statuses:
            filters.statuses?.length && filters.statuses.length > 1 ? filters.statuses : undefined,
          orderDateFrom:
            filters.orderDateFrom instanceof Date
              ? filters.orderDateFrom.toISOString()
              : filters.orderDateFrom,
          orderDateTo:
            filters.orderDateTo instanceof Date
              ? filters.orderDateTo.toISOString()
              : filters.orderDateTo,
          deliveryDateFrom:
            filters.deliveryDateFrom instanceof Date
              ? filters.deliveryDateFrom.toISOString()
              : filters.deliveryDateFrom,
          deliveryDateTo:
            filters.deliveryDateTo instanceof Date
              ? filters.deliveryDateTo.toISOString()
              : filters.deliveryDateTo,
          cursor: filters.cursor,
          limit: filters.limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        }
      : undefined;

    const response = await salesApi.getPurchaseOrders(apiParams);
    const employeeMapByEmployeeId = await overviewService.getEmployeeOverview();

    return {
      purchaseOrders: response.purchaseOrders.map((po) =>
        transformApiToFrontend(po, employeeMapByEmployeeId),
      ),
      pagination: response.pagination,
    };
  },

  async getPOById(id: string): Promise<PurchaseOrder | undefined> {
    const po = await salesApi.getPurchaseOrderById(id);
    const employeeMapByEmployeeId = await overviewService.getEmployeeOverview();
    return po ? transformApiToFrontend(po, employeeMapByEmployeeId) : undefined;
  },

  async createPO(
    data: Omit<
      PurchaseOrder,
      'id' | 'status' | 'createdAt' | 'updatedAt' | 'clientId' | 'poNumber'
    >,
  ): Promise<void> {
    const createRequest: CreatePurchaseOrderRequest = {
      customerId: data.customerId,
      salesId: data.salesId,
      orderDate: data.orderDate ? data.orderDate.toISOString() : new Date().toISOString(),
      deliveryDate: data.deliveryDate ? data.deliveryDate.toISOString() : undefined,
      items: data.items.map((item) => ({
        metadata: {
          productId: item.productId,
          productCode: item.productCode,
          description: item.description,
          color: item.color,
          quantity: item.quantity,
          category: item.category,
          notes: item.notes,
          unit: item.unit,
        },
      })),
      metadata: {
        isInternalDelivery: data.isInternalDelivery,
        notes: data.notes,
        shippingAddress: {
          oneLineAddress: data.address,
          googleMapsUrl: data.googleMapsUrl,
        },
      },
    };

    await salesApi.createPurchaseOrder(createRequest);
  },

  async updatePO(
    id: string,
    data: Omit<
      PurchaseOrder,
      'id' | 'createdAt' | 'updatedAt' | 'clientId' | 'poNumber' | 'status'
    >,
  ): Promise<void> {
    if (!data.items) {
      throw new Error('Items are required');
    }
    const updateRequest: UpdatePurchaseOrderRequest = {
      salesId: data.salesId,
      items: data.items.map((item) => ({
        metadata: {
          productCode: item.productCode,
          description: item.description,
          color: item.color,
          quantity: item.quantity,
          category: item.category,
          productId: item.productId,
          notes: item.notes,
          unit: item.unit,
        },
      })),
      orderDate: data.orderDate.toISOString(),
      deliveryDate: data.deliveryDate?.toISOString(),
      metadata: {
        isInternalDelivery: data.isInternalDelivery,
        notes: data.notes,
        shippingAddress: {
          oneLineAddress: data.address,
          googleMapsUrl: data.googleMapsUrl,
        },
      },
    };

    await salesApi.updatePurchaseOrder(id, updateRequest);
  },

  // ========== Update Purchase Order Status ==========
  async confirmPO(id: string): Promise<void> {
    await salesApi.confirmPurchaseOrder(id);
  },

  async processPO(id: string): Promise<void> {
    await salesApi.processPurchaseOrder(id);
  },

  async markPOReady(id: string, data?: UpdatePOStatusRequest): Promise<void> {
    await salesApi.markPurchaseOrderReady(id, data);
  },

  async shipPO(id: string, data?: UpdatePOStatusRequest): Promise<void> {
    await salesApi.shipPurchaseOrder(id, data);
  },

  async deliverPO(id: string, data?: { deliveryNotes?: string }): Promise<void> {
    await salesApi.deliverPurchaseOrder(id, data);
  },

  async cancelPO(id: string, data?: UpdatePOStatusRequest): Promise<void> {
    await salesApi.cancelPurchaseOrder(id, data);
  },

  async refundPO(id: string, data?: { refundReason?: string }): Promise<void> {
    await salesApi.refundPurchaseOrder(id, {
      refundReason: data?.refundReason,
    });
  },

  async uploadPhotos(
    id: string,
    photos: {
      publicUrl: string;
      key: string;
      caption?: string;
    }[],
  ): Promise<void> {
    await salesApi.uploadPhotos(id, {
      photos: photos.map((photo) => ({
        publicUrl: photo.publicUrl,
        key: photo.key,
        caption: photo.caption,
      })),
    });
  },
};
