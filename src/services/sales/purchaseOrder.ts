import { salesApi } from '@/lib/api';
import {
  type PurchaseOrder as ApiPurchaseOrder,
  type CreatePurchaseOrderRequest,
  type UpdatePurchaseOrderRequest,
  type UpdatePOStatusRequest,
} from '@/lib/api/schemas/sales.schemas';
import { customerService, type Customer } from './customer';
import { logError, logInfo } from '@/utils/logger';
import { RETRY_DELAY_MS } from '@/constants/po.constants';

// Re-export types for compatibility
export type {
  POStatus,
  POItem,
  Address,
  UpdatePOStatusRequest,
} from '@/lib/api/schemas/sales.schemas';

export type PurchaseOrder = Omit<ApiPurchaseOrder, 'metadata'> & {
  address?: string;
  googleMapsUrl?: string;
  createdBy?: string;
  createdAt?: Date;
  confirmedBy?: string;
  confirmedAt?: Date;
  processedBy?: string;
  processedAt?: Date;
  shippedBy?: string;
  shippedAt?: Date;
  deliveredBy?: string;
  deliveredAt?: Date;
  cancelledBy?: string;
  cancelledAt?: Date;
  refundedBy?: string;
  refundedAt?: Date;
};

export type { Customer } from './customer';

/**
 * Transform API PurchaseOrder to Frontend PurchaseOrder
 */
function transformApiToFrontend(apiPO: ApiPurchaseOrder): Omit<PurchaseOrder, 'customer'> {
  const { metadata, ...rest } = apiPO;
  const statusHistory = metadata?.statusHistory || [];
  const statusHistoryMap = new Map(statusHistory.map((status) => [status.status, status]));
  return {
    ...rest,
    customerId: apiPO.customerId,
    address: metadata?.shippingAddress?.oneLineAddress,
    googleMapsUrl: metadata?.shippingAddress?.googleMapsUrl,
    createdBy: statusHistoryMap.get('NEW')?.userId,
    createdAt: statusHistoryMap.get('NEW')?.timestamp || rest.createdAt,
    confirmedBy: statusHistoryMap.get('CONFIRMED')?.userId,
    confirmedAt: statusHistoryMap.get('CONFIRMED')?.timestamp,
    processedBy: statusHistoryMap.get('PROCESSING')?.userId,
    processedAt: statusHistoryMap.get('PROCESSING')?.timestamp,
    shippedBy: statusHistoryMap.get('SHIPPED')?.userId,
    shippedAt: statusHistoryMap.get('SHIPPED')?.timestamp,
    deliveredBy: statusHistoryMap.get('DELIVERED')?.userId,
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

export const purchaseOrderService = {
  purchaseOrders: [] as PurchaseOrder[],
  // Customer cache to prevent N+1 queries
  customerCache: new Map<string, Customer>(),
  cacheLastUpdated: 0,
  // Cache TTL: 10 minutes
  CACHE_TTL: 10 * 60 * 1000,

  /**
   * Get customer data from cache or API
   * Checks cache first, falls back to API if not found
   */
  async getCustomerWithCache(customerId: string): Promise<Customer | undefined> {
    // Check if we have cached data for this customer
    if (this.customerCache.has(customerId)) {
      const customer = this.customerCache.get(customerId);
      if (customer) {
        logInfo('Customer found in cache', {
          module: 'PurchaseOrderService',
          action: 'getCustomerWithCache',
          metadata: { customerId, cacheSize: this.customerCache.size },
        });
        return customer;
      }
    }

    // Cache miss - fetch from API
    logInfo('Customer not in cache, fetching from API', {
      module: 'PurchaseOrderService',
      action: 'getCustomerWithCache',
      metadata: { customerId, cacheSize: this.customerCache.size },
    });

    const customer = await customerService.getCustomer(customerId);
    // Add to cache for future use only if customer exists
    if (customer) {
      this.customerCache.set(customerId, customer);
    }
    return customer;
  },

  /**
   * Update customer cache with batch-loaded customers
   * Called when getAllPOs() loads all customers at once
   */
  updateCustomerCache(customers: Customer[]): void {
    // Clear existing cache and rebuild
    this.customerCache.clear();
    customers.forEach((customer) => {
      this.customerCache.set(customer.id, customer);
    });
    this.cacheLastUpdated = Date.now();

    logInfo('Customer cache updated', {
      module: 'PurchaseOrderService',
      action: 'updateCustomerCache',
      metadata: {
        customerCount: customers.length,
        cacheSize: this.customerCache.size,
        timestamp: this.cacheLastUpdated,
      },
    });
  },

  /**
   * Check if cache is still valid based on TTL
   */
  isCacheValid(): boolean {
    return Date.now() - this.cacheLastUpdated < this.CACHE_TTL;
  },

  /**
   * Clear customer cache manually if needed
   */
  clearCustomerCache(): void {
    this.customerCache.clear();
    this.cacheLastUpdated = 0;
    logInfo('Customer cache cleared', {
      module: 'PurchaseOrderService',
      action: 'clearCustomerCache',
    });
  },

  async getAllPOs(): Promise<PurchaseOrder[]> {
    const response = await salesApi.getPurchaseOrders();
    return response.purchaseOrders.map(transformApiToFrontend);
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

  async confirmPO(id: string): Promise<void> {
    await salesApi.confirmPurchaseOrder(id);
  },

  async processPO(id: string): Promise<void> {
    await salesApi.processPurchaseOrder(id);
  },

  async shipPO(id: string, data?: UpdatePOStatusRequest): Promise<void> {
    await salesApi.shipPurchaseOrder(id, data);
  },

  async deliverPO(id: string): Promise<void> {
    await salesApi.deliverPurchaseOrder(id);
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
