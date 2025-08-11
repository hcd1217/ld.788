import { salesApi } from '@/lib/api';
import {
  type PurchaseOrder,
  type CreatePurchaseOrderRequest,
  type UpdatePurchaseOrderRequest,
} from '@/lib/api/schemas/sales.schemas';
import { customerService } from './customer';

// Re-export types for compatibility
export type { POStatus, POItem, Address, PurchaseOrder } from '@/lib/api/schemas/sales.schemas';

export type { Customer } from './customer';

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
      console.error('Failed to get PO by ID:', error);
      return undefined;
    }
  },

  async createPO(
    data: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>,
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

    const newPO = await salesApi.createPurchaseOrder(createRequest);

    // Attach customer data
    const customer = await customerService.getCustomer(newPO.customerId);
    return {
      ...newPO,
      customer,
    };
  },

  async updatePO(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const updateRequest: UpdatePurchaseOrderRequest = {
      customerId: data.customerId,
      status: data.status,
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

    const updatedPO = await salesApi.updatePurchaseOrder(id, updateRequest);

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

  async cancelPO(id: string): Promise<PurchaseOrder> {
    const updatedPO = await salesApi.cancelPurchaseOrder(id);
    const customer = await customerService.getCustomer(updatedPO.customerId);
    return {
      ...updatedPO,
      customer,
    };
  },

  async refundPO(id: string): Promise<PurchaseOrder> {
    const updatedPO = await salesApi.refundPurchaseOrder(id);
    const customer = await customerService.getCustomer(updatedPO.customerId);
    return {
      ...updatedPO,
      customer,
    };
  },
};
