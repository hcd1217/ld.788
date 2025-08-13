import { salesApi } from '@/lib/api';
import {
  type PurchaseOrder,
  type CreatePurchaseOrderRequest,
  type UpdatePurchaseOrderRequest,
  type UpdatePOStatusRequest,
} from '@/lib/api/schemas/sales.schemas';
import { customerService } from './customer';
import { isDevelopment } from '@/utils/env';

// Re-export types for compatibility
export type { POStatus, POItem, Address, PurchaseOrder } from '@/lib/api/schemas/sales.schemas';

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
      if (isDevelopment) {
        console.log('PO Service: Retrying after server error', error);
      }
      // Wait 1 second before retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return operation(); // Single retry attempt
    }

    throw error;
  }
}

export const purchaseOrderService = {
  purchaseOrders: [] as PurchaseOrder[],

  async getAllPOs(): Promise<PurchaseOrder[]> {
    const response = await salesApi.getPurchaseOrders();
    const purchaseOrders = response.purchaseOrders;

    // Fetch customers and attach to POs
    const customers = await customerService.getAllCustomers();
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    return purchaseOrders.map((po) => ({
      ...po,
      customer: customerMap.get(po.customerId),
    }));
  },

  async getPOById(id: string): Promise<PurchaseOrder | undefined> {
    try {
      const po = await salesApi.getPurchaseOrderById(id);
      if (po) {
        // Attach customer data
        const customer = await customerService.getCustomer(po.customerId);
        return {
          ...po,
          customer,
        };
      }
      return undefined;
    } catch (error) {
      if (isDevelopment) {
        console.error('Failed to get PO by ID:', error);
      }
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

    // Attach customer data
    const customer = await customerService.getCustomer(newPO.customerId);
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

    // Attach customer data
    const customer = await customerService.getCustomer(updatedPO.customerId);
    return {
      ...updatedPO,
      customer,
    };
  },

  async confirmPO(id: string): Promise<PurchaseOrder> {
    const updatedPO = await salesApi.confirmPurchaseOrder(id);
    const customer = await customerService.getCustomer(updatedPO.customerId);
    return {
      ...updatedPO,
      customer,
    };
  },

  async processPO(id: string): Promise<PurchaseOrder> {
    const updatedPO = await salesApi.processPurchaseOrder(id);
    const customer = await customerService.getCustomer(updatedPO.customerId);
    return {
      ...updatedPO,
      customer,
    };
  },

  async shipPO(id: string): Promise<PurchaseOrder> {
    const updatedPO = await salesApi.shipPurchaseOrder(id);
    const customer = await customerService.getCustomer(updatedPO.customerId);
    return {
      ...updatedPO,
      customer,
    };
  },

  async deliverPO(id: string): Promise<PurchaseOrder> {
    const updatedPO = await salesApi.deliverPurchaseOrder(id);
    const customer = await customerService.getCustomer(updatedPO.customerId);
    return {
      ...updatedPO,
      customer,
    };
  },

  async cancelPO(id: string, data?: UpdatePOStatusRequest): Promise<PurchaseOrder> {
    const updatedPO = await salesApi.cancelPurchaseOrder(id, data);
    const customer = await customerService.getCustomer(updatedPO.customerId);
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
    const customer = await customerService.getCustomer(updatedPO.customerId);
    return {
      ...updatedPO,
      customer,
    };
  },
};
