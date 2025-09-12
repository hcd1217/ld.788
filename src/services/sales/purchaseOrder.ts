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

import type { DeliveryStatus, PICType } from './deliveryRequest';

// Re-export types for compatibility
export type { POStatus, UpdatePOStatusRequest } from '@/lib/api/schemas/sales.schemas';

export type POItem = Omit<ApiPOItem, 'metadata'> & {
  notes: string;
  unit: string;
  productId: string;
};

export type PurchaseOrder = Omit<ApiPurchaseOrder, 'metadata' | 'items'> & {
  items: POItem[];
  address?: string;
  googleMapsUrl?: string;
  statusHistory?: POStatusHistory[];
  deliveryRequest?: {
    deliveryRequestId: string;
    deliveryRequestNumber?: string;
    status: DeliveryStatus;
    assignedType: PICType;
    scheduledDate: Date | string;
    assignedTo?: string;
    createdAt?: string;
    createdBy?: string;
  };
};

/**
 * Transform API PurchaseOrder to Frontend PurchaseOrder
 */
function transformApiToFrontend(apiPO: ApiPurchaseOrder): Omit<PurchaseOrder, 'customer'> {
  const { metadata, ...rest } = apiPO;
  return {
    ...rest,
    customerId: apiPO.customerId,
    address: metadata?.shippingAddress?.oneLineAddress,
    googleMapsUrl: metadata?.shippingAddress?.googleMapsUrl,
    statusHistory: metadata?.statusHistory,
    deliveryRequest: metadata?.deliveryRequest,
    items: apiPO.items.map(({ metadata, ...item }) => ({
      ...item,
      notes: metadata.notes ?? '',
      unit: metadata.unit ?? '',
      productId: metadata.productId ?? '',
    })),
  };
}

// Filter parameters for purchase orders
export type POFilterParams = {
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

    return {
      purchaseOrders: response.purchaseOrders.map((po) => transformApiToFrontend(po)),
      pagination: response.pagination,
    };
  },

  async getPOById(id: string): Promise<PurchaseOrder | undefined> {
    const po = await salesApi.getPurchaseOrderById(id);
    return po ? transformApiToFrontend(po) : undefined;
  },

  async createPO(
    data: Omit<
      PurchaseOrder,
      'id' | 'status' | 'createdAt' | 'updatedAt' | 'clientId' | 'poNumber'
    >,
  ): Promise<void> {
    const createRequest: CreatePurchaseOrderRequest = {
      customerId: data.customerId,
      orderDate: data.orderDate ? data.orderDate.toISOString() : new Date().toISOString(),
      deliveryDate: data.deliveryDate ? data.deliveryDate.toISOString() : undefined,
      items: data.items.map((item) => ({
        productCode: item.productCode,
        description: item.description,
        color: item.color,
        quantity: item.quantity,
        category: item.category,
        metadata: {
          productId: item.productId,
          notes: item.notes,
          unit: item.unit,
        },
      })),
      notes: data.notes,
      metadata: {
        shippingAddress: {
          oneLineAddress: data.address,
          googleMapsUrl: data.googleMapsUrl,
        },
      },
    };

    await salesApi.createPurchaseOrder(createRequest);
  },

  async updatePO(id: string, data: Partial<PurchaseOrder>): Promise<void> {
    if (!data.items) {
      throw new Error('Items are required');
    }

    const updateRequest: UpdatePurchaseOrderRequest = {
      status: data.status,
      items: data.items.map(({ productId, notes, unit, ...item }) => ({
        ...item,
        metadata: {
          productId,
          notes,
          unit,
        },
      })),
      orderDate:
        data.orderDate instanceof Date
          ? data.orderDate.toISOString()
          : data.orderDate
            ? String(data.orderDate)
            : undefined,
      deliveryDate:
        data.deliveryDate instanceof Date
          ? data.deliveryDate.toISOString()
          : data.deliveryDate
            ? String(data.deliveryDate)
            : undefined,
      completedDate:
        data.completedDate instanceof Date
          ? data.completedDate.toISOString()
          : data.completedDate
            ? String(data.completedDate)
            : undefined,
      notes: data.notes,
      metadata:
        data.address || data.googleMapsUrl
          ? {
              shippingAddress: {
                oneLineAddress: data.address,
                googleMapsUrl: data.googleMapsUrl,
              },
            }
          : undefined,
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
};
