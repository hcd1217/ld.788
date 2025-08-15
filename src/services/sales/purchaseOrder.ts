import { salesApi } from '@/lib/api';
import {
  type PurchaseOrder,
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
  PurchaseOrder,
  UpdatePOStatusRequest,
} from '@/lib/api/schemas/sales.schemas';

export type { Customer } from './customer';

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
    const purchaseOrders = response.purchaseOrders;

    // Fetch customers and attach to POs
    const customers = await customerService.getAllCustomers();
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    // Update the customer cache for future use
    this.updateCustomerCache(customers);

    return purchaseOrders.map((po) => ({
      ...po,
      customer: customerMap.get(po.customerId),
    }));
  },

  async getPOById(id: string): Promise<PurchaseOrder | undefined> {
    try {
      const po = await salesApi.getPurchaseOrderById(id);
      if (po) {
        // Attach customer data using cache
        const customer = await this.getCustomerWithCache(po.customerId);
        return {
          ...po,
          customer,
        };
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
    data: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>,
    enableRetry: boolean = false,
  ): Promise<PurchaseOrder> {
    const createRequest: CreatePurchaseOrderRequest = {
      customerId: data.customerId,
      orderDate:
        data.orderDate instanceof Date ? data.orderDate.toISOString() : String(data.orderDate),
      items: data.items.map((item) => ({
        productCode: item.productCode,
        description: item.description,
        color: item.color,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        category: item.category,
        metadata: item.metadata,
      })),
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      paymentTerms: data.paymentTerms,
      notes: data.notes,
      metadata: data.metadata,
    };

    // Only critical operations get retry capability
    const newPO = await retryOnServerError(
      () => salesApi.createPurchaseOrder(createRequest),
      enableRetry,
    );

    // Attach customer data using cache
    const customer = await this.getCustomerWithCache(newPO.customerId);
    return {
      ...newPO,
      customer,
    };
  },

  async updatePO(
    id: string,
    data: Partial<PurchaseOrder>,
    enableRetry: boolean = false,
  ): Promise<PurchaseOrder> {
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
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      paymentTerms: data.paymentTerms,
      notes: data.notes,
      metadata: data.metadata,
    };

    // Only critical operations get retry capability
    const updatedPO = await retryOnServerError(
      () => salesApi.updatePurchaseOrder(id, updateRequest),
      enableRetry,
    );

    // Attach customer data using cache
    const customer = await this.getCustomerWithCache(updatedPO.customerId);
    return {
      ...updatedPO,
      customer,
    };
  },

  async confirmPO(id: string): Promise<PurchaseOrder> {
    const updatedPO = await salesApi.confirmPurchaseOrder(id);
    const customer = await this.getCustomerWithCache(updatedPO.customerId);
    return {
      ...updatedPO,
      customer,
    };
  },

  async processPO(id: string): Promise<PurchaseOrder> {
    const updatedPO = await salesApi.processPurchaseOrder(id);
    const customer = await this.getCustomerWithCache(updatedPO.customerId);
    return {
      ...updatedPO,
      customer,
    };
  },

  async shipPO(id: string, data?: UpdatePOStatusRequest): Promise<PurchaseOrder> {
    const updatedPO = await salesApi.shipPurchaseOrder(id, data);
    const customer = await this.getCustomerWithCache(updatedPO.customerId);
    return {
      ...updatedPO,
      customer,
    };
  },

  async deliverPO(id: string): Promise<PurchaseOrder> {
    const updatedPO = await salesApi.deliverPurchaseOrder(id);
    const customer = await this.getCustomerWithCache(updatedPO.customerId);
    return {
      ...updatedPO,
      customer,
    };
  },

  async cancelPO(id: string, data?: UpdatePOStatusRequest): Promise<PurchaseOrder> {
    const updatedPO = await salesApi.cancelPurchaseOrder(id, data);
    const customer = await this.getCustomerWithCache(updatedPO.customerId);
    return {
      ...updatedPO,
      customer,
    };
  },

  async refundPO(
    id: string,
    data?: { refundReason?: string; refundAmount?: number },
  ): Promise<PurchaseOrder> {
    const updatedPO = await salesApi.refundPurchaseOrder(id, data);
    const customer = await this.getCustomerWithCache(updatedPO.customerId);
    return {
      ...updatedPO,
      customer,
    };
  },
};
