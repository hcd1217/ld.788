import { salesApi } from '@/lib/api';
import {
  type PurchaseOrder as ApiPurchaseOrder,
  type CreatePurchaseOrderRequest,
  type UpdatePurchaseOrderRequest,
  type UpdatePOStatusRequest,
  type POStatusHistory,
  type POStatus,
} from '@/lib/api/schemas/sales.schemas';
import { logError, logInfo } from '@/utils/logger';
import { RETRY_DELAY_MS } from '@/constants/po.constants';
import type { DeliveryStatus, PICType } from './deliveryRequest';

// Re-export types for compatibility
export type { POStatus, POItem, UpdatePOStatusRequest } from '@/lib/api/schemas/sales.schemas';

export type PurchaseOrder = Omit<ApiPurchaseOrder, 'metadata'> & {
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

export type { Customer } from './customer';

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
  };
}

/**
 * Simple retry helper for critical operations only
 * Only retries on 5xx server errors with a single retry attempt
 */
async function retryOnServerError<T>(
  operation: () => Promise<T>,
  enableRetry: boolean = false,
): Promise<T> {
  if (!enableRetry) {
    return operation();
  }

  try {
    return await operation();
  } catch (error: any) {
    // Only retry on 5xx server errors
    const isServerError =
      (error?.status >= 500 && error?.status < 600) ||
      (error?.response?.status >= 500 && error?.response?.status < 600);

    if (isServerError) {
      logInfo('Retrying after server error', {
        module: 'PurchaseOrderService',
        action: 'retryOnServerError',
        metadata: { error },
      });
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return operation(); // Single retry attempt
    }

    throw error;
  }
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
      purchaseOrders: response.purchaseOrders.map(transformApiToFrontend),
      pagination: response.pagination,
    };
  },

  async getPOById(id: string): Promise<PurchaseOrder | undefined> {
    try {
      const po = await salesApi.getPurchaseOrderById(id);
      if (po) {
        return transformApiToFrontend(po);
      }
      return undefined;
    } catch (error) {
      logError('Failed to get PO by ID', error, {
        module: 'PurchaseOrderService',
        action: 'getPOById',
        metadata: { id },
      });
      return undefined;
    }
  },

  async createPO(
    data: Omit<CreatePurchaseOrderRequest, 'orderDate' | 'deliveryDate' | 'completedDate'> & {
      address?: string;
      googleMapsUrl?: string;
      orderDate?: Date;
      deliveryDate?: Date;
    },
    enableRetry: boolean = false,
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
      })),
      notes: data.notes,
      metadata: {
        shippingAddress: {
          oneLineAddress: data.address,
          googleMapsUrl: data.googleMapsUrl,
        },
      },
    };

    // Only critical operations get retry capability
    await retryOnServerError(() => salesApi.createPurchaseOrder(createRequest), enableRetry);
  },

  async updatePO(
    id: string,
    data: Partial<PurchaseOrder>,
    enableRetry: boolean = false,
  ): Promise<void> {
    const updateRequest: UpdatePurchaseOrderRequest = {
      status: data.status,
      items: data.items,
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

    // Only critical operations get retry capability
    await retryOnServerError(() => salesApi.updatePurchaseOrder(id, updateRequest), enableRetry);
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
