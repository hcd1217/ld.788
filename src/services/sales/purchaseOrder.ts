import { type CustomerOverview, type ProductOverview, salesApi } from '@/lib/api';
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
import type { PhotoData } from '@/types';

import { overviewService } from '../client/overview';

import type { DeliveryStatus } from './deliveryRequest';

// Re-export types for compatibility
export type { POStatus, UpdatePOStatusRequest } from '@/lib/api/schemas/sales.schemas';

export type POItem = ApiPOItem;

export type PurchaseOrder = Omit<ApiPurchaseOrder, 'deliveryRequest' | 'items'> & {
  items: POItem[];
  address?: string;
  customerName: string;
  googleMapsUrl?: string;
  statusHistory?: POStatusHistory[];
  salesPerson?: string;
  isInternalDelivery: boolean;
  isPersonalCustomer?: boolean;
  personalCustomerName?: string;
  isUrgentPO: boolean;
  customerPONumber?: string;
  deliveryRequest?: {
    deliveryRequestId: string;
    deliveryRequestNumber?: string;
    isUrgentDelivery?: boolean;
    status: DeliveryStatus;
    deliveryPerson?: string;
    scheduledDate: Date | string;
    photos?: PhotoData[];
  };
};

// Type for creating/updating PO - uses simplified photo structure for upload
type POUploadPhoto = {
  publicUrl: string;
  key: string;
  caption?: string;
};

/**
 * Transform API PurchaseOrder to Frontend PurchaseOrder
 */
function transformApiToFrontend(
  apiPO: ApiPurchaseOrder,
  employeeMapByEmployeeId: Map<string, EmployeeOverview>,
  productMapByProductId: Map<string, ProductOverview>,
  customerMapByCustomerId: Map<string, CustomerOverview>,
): Omit<PurchaseOrder, 'customer'> {
  const salesPerson = apiPO.salesId
    ? employeeMapByEmployeeId.get(apiPO.salesId)?.fullName
    : undefined;
  const deliveryRequest = apiPO?.deliveryRequest;
  const deliveryPerson = deliveryRequest?.assignedTo
    ? employeeMapByEmployeeId.get(deliveryRequest.assignedTo)?.fullName
    : undefined;
  let customerName = '';

  if (apiPO.customerId) {
    customerName = customerMapByCustomerId.get(apiPO.customerId)?.name ?? '';
  }
  if (apiPO.isPersonalCustomer) {
    customerName = apiPO.personalCustomerName || '';
  }
  return {
    ...apiPO,
    salesPerson,
    isUrgentPO: apiPO.isUrgentPO ?? false,
    isInternalDelivery: apiPO.isInternalDelivery,
    isPersonalCustomer: apiPO.isPersonalCustomer,
    personalCustomerName: apiPO.personalCustomerName,
    customerPONumber: apiPO.customerPONumber,
    customerId: apiPO.customerId,
    customerName,
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
          photos: apiPO.deliveryRequest.photos,
        }
      : undefined,
    items: apiPO.items.map((item) => ({
      ...item,
      deliveryPerson: 'TODO',
      notes: item.notes ?? '',
      unit: item.unit ?? productMapByProductId.get(item.productId)?.unit ?? '',
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
    const productMapByProductId = await overviewService.getProductOverview();
    const customerMapByCustomerId = await overviewService.getCustomerOverview();
    const purchaseOrders = response.purchaseOrders
      .sort((a, b) => {
        if (a.isUrgentPO && !b.isUrgentPO) return -1;
        if (!a.isUrgentPO && b.isUrgentPO) return 1;
        return a.poNumber.localeCompare(b.poNumber);
      })
      .map((po) =>
        transformApiToFrontend(
          po,
          employeeMapByEmployeeId,
          productMapByProductId,
          customerMapByCustomerId,
        ),
      );
    return {
      purchaseOrders,
      pagination: response.pagination,
    };
  },

  async getPOById(id: string): Promise<PurchaseOrder | undefined> {
    const po = await salesApi.getPurchaseOrderById(id);
    const employeeMapByEmployeeId = await overviewService.getEmployeeOverview();
    const productMapByProductId = await overviewService.getProductOverview();
    const customerMapByCustomerId = await overviewService.getCustomerOverview();
    return po
      ? transformApiToFrontend(
          po,
          employeeMapByEmployeeId,
          productMapByProductId,
          customerMapByCustomerId,
        )
      : undefined;
  },

  async createPO(
    data: Omit<
      PurchaseOrder,
      'id' | 'status' | 'createdAt' | 'updatedAt' | 'clientId' | 'poNumber' | 'photos'
    > & {
      photos?: POUploadPhoto[];
    },
  ): Promise<void> {
    const createRequest: CreatePurchaseOrderRequest = {
      customerId: data.isPersonalCustomer ? undefined : data.customerId,
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
        customerPONumber: data.customerPONumber,
        isPersonalCustomer: data.isPersonalCustomer,
        personalCustomerName: data.personalCustomerName,
        isUrgentPO: data.isUrgentPO,
        notes: data.notes,
        shippingAddress: {
          oneLineAddress: data.address,
          googleMapsUrl: data.googleMapsUrl,
        },
        attachments: data.photos ?? [],
      },
    };

    await salesApi.createPurchaseOrder(createRequest);
  },

  async updatePO(
    id: string,
    data: Omit<
      PurchaseOrder,
      'id' | 'createdAt' | 'updatedAt' | 'clientId' | 'poNumber' | 'status' | 'photos'
    > & {
      photos?: POUploadPhoto[];
    },
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
        isPersonalCustomer: data.isPersonalCustomer,
        personalCustomerName: data.personalCustomerName,
        customerPONumber: data.customerPONumber,
        isUrgentPO: data.isUrgentPO,
        notes: data.notes,
        shippingAddress: {
          oneLineAddress: data.address,
          googleMapsUrl: data.googleMapsUrl,
        },
        attachments: data.photos ?? [],
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

  async deletePhoto(id: string, photoId: string): Promise<void> {
    await salesApi.deletePhoto(id, { photoId });
  },

  async deletePurchaseOrder(id: string): Promise<void> {
    await salesApi.deletePurchaseOrder(id);
  },

  async toggleInternalDelivery(id: string): Promise<void> {
    await salesApi.toggleInternalDelivery(id);
  },
};
