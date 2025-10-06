/* eslint-disable sort-imports */
import { BaseApiClient } from '../base';
import {
  // Customer schemas
  BulkUpsertCustomersRequestSchema,
  BulkUpsertCustomersResponseSchema,
  CreateCustomerRequestSchema,
  CreateCustomerResponseSchema,
  GetCustomersResponseSchema,
  UpdateCustomerRequestSchema,

  // Vendor schemas
  BulkUpsertVendorsRequestSchema,
  BulkUpsertVendorsResponseSchema,
  CreateVendorRequestSchema,
  CreateVendorResponseSchema,
  GetVendorsResponseSchema,
  UpdateVendorRequestSchema,

  // Purchase Order schemas
  type BulkUpsertCustomersRequest,
  type BulkUpsertCustomersResponse,
  type CreateCustomerRequest,
  type CreateCustomerResponse,
  type GetCustomersResponse,
  type UpdateCustomerRequest,

  // Vendor types
  type BulkUpsertVendorsRequest,
  type BulkUpsertVendorsResponse,
  type CreateVendorRequest,
  type CreateVendorResponse,
  type GetVendorsResponse,
  type UpdateVendorRequest,

  // Purchase Order schemas
  GetPurchaseOrdersResponseSchema,
  CreatePurchaseOrderRequestSchema,
  CreatePurchaseOrderResponseSchema,
  UpdatePurchaseOrderRequestSchema,
  GetPurchaseOrderResponseSchema,
  UpdatePOStatusRequestSchema,
  type GetPurchaseOrdersResponse,
  type CreatePurchaseOrderRequest,
  type CreatePurchaseOrderResponse,
  type UpdatePurchaseOrderRequest,
  type GetPurchaseOrderResponse,
  type UpdatePOStatusRequest,
  type POStatus,
  // Product schemas
  GetProductsResponseSchema,
  CreateProductRequestSchema,
  CreateProductResponseSchema,
  UpdateProductRequestSchema,
  BulkUpsertProductsRequestSchema,
  BulkUpsertProductsResponseSchema,
  type GetProductsResponse,
  type CreateProductRequest,
  type CreateProductResponse,
  type UpdateProductRequest,
  type BulkUpsertProductsRequest,
  type BulkUpsertProductsResponse,
  type UploadPhotosRequest,
  UploadPhotosRequestSchema,
  DeletePhotoRequestSchema,
  type DeletePhotoRequest,
} from '../schemas/sales.schemas';

export class SalesApi extends BaseApiClient {
  // ========== Customer APIs ==========
  async getCustomers(params?: {
    search?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    salesId?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<GetCustomersResponse> {
    const queryParams = new URLSearchParams();
    if (params?.salesId) queryParams.append('salesId', params.salesId);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    // Default limit if not provided
    if (!params?.limit) queryParams.append('limit', '1000');

    const url = `/api/sales/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<GetCustomersResponse, void>(url, undefined, GetCustomersResponseSchema);
  }

  async createCustomer(data: CreateCustomerRequest): Promise<CreateCustomerResponse> {
    return this.post<CreateCustomerResponse, CreateCustomerRequest>(
      '/api/sales/customers',
      data,
      CreateCustomerResponseSchema,
      CreateCustomerRequestSchema,
    );
  }

  async updateCustomer(id: string, data: UpdateCustomerRequest): Promise<void> {
    return this.patch<void, UpdateCustomerRequest>(
      `/api/sales/customers/${id}`,
      data,
      undefined,
      UpdateCustomerRequestSchema,
    );
  }

  async deleteCustomer(id: string): Promise<void> {
    return this.delete(`/api/sales/customers/${id}`);
  }

  async bulkUpsertCustomers(
    data: BulkUpsertCustomersRequest,
  ): Promise<BulkUpsertCustomersResponse> {
    return this.post<BulkUpsertCustomersResponse, BulkUpsertCustomersRequest>(
      '/api/sales/customers/bulk-upsert',
      data,
      BulkUpsertCustomersResponseSchema,
      BulkUpsertCustomersRequestSchema,
    );
  }

  // ========== Vendor APIs ==========
  async getVendors(): Promise<GetVendorsResponse> {
    return this.get<GetVendorsResponse, void>('/api/vendors', undefined, GetVendorsResponseSchema);
  }

  async createVendor(data: CreateVendorRequest): Promise<CreateVendorResponse> {
    return this.post<CreateVendorResponse, CreateVendorRequest>(
      '/api/vendors',
      data,
      CreateVendorResponseSchema,
      CreateVendorRequestSchema,
    );
  }

  async updateVendor(id: string, data: UpdateVendorRequest): Promise<void> {
    return this.patch<void, UpdateVendorRequest>(
      `/api/vendors/${id}`,
      data,
      undefined,
      UpdateVendorRequestSchema,
    );
  }

  async deleteVendor(id: string): Promise<void> {
    return this.delete(`/api/vendors/${id}`);
  }

  async bulkUpsertVendors(data: BulkUpsertVendorsRequest): Promise<BulkUpsertVendorsResponse> {
    return this.post<BulkUpsertVendorsResponse, BulkUpsertVendorsRequest>(
      '/api/vendors/bulk-upsert',
      data,
      BulkUpsertVendorsResponseSchema,
      BulkUpsertVendorsRequestSchema,
    );
  }

  // ========== Purchase Order APIs ==========
  async getPurchaseOrders(params?: {
    salesId?: string;
    poNumber?: string;
    customerId?: string;
    status?: POStatus;
    statuses?: POStatus[];
    orderDateFrom?: string;
    orderDateTo?: string;
    deliveryDateFrom?: string;
    deliveryDateTo?: string;
    cursor?: string;
    limit?: number;
    sortBy?: 'createdAt' | 'orderDate' | 'poNumber' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<GetPurchaseOrdersResponse> {
    const queryParams = new URLSearchParams();
    if (params?.salesId) queryParams.append('salesId', params.salesId);
    if (params?.poNumber) queryParams.append('poNumber', params.poNumber);
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.statuses) {
      params.statuses.forEach((status) => {
        queryParams.append('statuses', status);
      });
    }
    if (params?.orderDateFrom) queryParams.append('orderDateFrom', params.orderDateFrom);
    if (params?.orderDateTo) queryParams.append('orderDateTo', params.orderDateTo);
    if (params?.deliveryDateFrom) queryParams.append('deliveryDateFrom', params.deliveryDateFrom);
    if (params?.deliveryDateTo) queryParams.append('deliveryDateTo', params.deliveryDateTo);
    if (params?.cursor) queryParams.append('cursor', params.cursor);
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    // Use default limit from swagger (20) or specified limit, max 1000
    if (!params?.limit) queryParams.append('limit', '20');

    const url = `/api/sales/purchase-orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<GetPurchaseOrdersResponse, void>(
      url,
      undefined,
      GetPurchaseOrdersResponseSchema,
    );
  }

  async getPurchaseOrderById(id: string): Promise<GetPurchaseOrderResponse> {
    return this.get<GetPurchaseOrderResponse, void>(
      `/api/sales/purchase-orders/${id}`,
      undefined,
      GetPurchaseOrderResponseSchema,
    );
  }

  async createPurchaseOrder(
    data: CreatePurchaseOrderRequest,
  ): Promise<CreatePurchaseOrderResponse> {
    return this.post<CreatePurchaseOrderResponse, CreatePurchaseOrderRequest>(
      '/api/sales/purchase-orders',
      data,
      CreatePurchaseOrderResponseSchema,
      CreatePurchaseOrderRequestSchema,
    );
  }

  async updatePurchaseOrder(id: string, data: UpdatePurchaseOrderRequest): Promise<void> {
    await this.patch<void, UpdatePurchaseOrderRequest>(
      `/api/sales/purchase-orders/${id}`,
      data,
      undefined,
      UpdatePurchaseOrderRequestSchema,
    );
  }

  async toggleInternalDelivery(id: string): Promise<void> {
    await this.patch<void, void>(`/api/sales/purchase-orders/${id}/toggle-internal-delivery`);
  }

  async confirmPurchaseOrder(id: string, data?: UpdatePOStatusRequest): Promise<void> {
    return this.patch<void, UpdatePOStatusRequest | undefined>(
      `/api/sales/purchase-orders/${id}/confirm`,
      data,
      undefined,
      data ? UpdatePOStatusRequestSchema : undefined,
    );
  }

  async markPurchaseOrderReady(id: string, data?: UpdatePOStatusRequest): Promise<void> {
    return this.patch<void, UpdatePOStatusRequest | undefined>(
      `/api/sales/purchase-orders/${id}/ready`,
      data,
      undefined,
      data ? UpdatePOStatusRequestSchema : undefined,
    );
  }

  async shipPurchaseOrder(id: string, data?: UpdatePOStatusRequest): Promise<void> {
    return this.patch<void, UpdatePOStatusRequest | undefined>(
      `/api/sales/purchase-orders/${id}/ship`,
      data,
      undefined,
      data ? UpdatePOStatusRequestSchema : undefined,
    );
  }

  async deliverPurchaseOrder(id: string, data?: UpdatePOStatusRequest): Promise<void> {
    return this.patch<void, UpdatePOStatusRequest | undefined>(
      `/api/sales/purchase-orders/${id}/deliver`,
      data,
      undefined,
      data ? UpdatePOStatusRequestSchema : undefined,
    );
  }

  async cancelPurchaseOrder(id: string, data?: UpdatePOStatusRequest): Promise<void> {
    return this.patch<void, UpdatePOStatusRequest | undefined>(
      `/api/sales/purchase-orders/${id}/cancel`,
      data,
      undefined,
      data ? UpdatePOStatusRequestSchema : undefined,
    );
  }

  async refundPurchaseOrder(id: string, data?: UpdatePOStatusRequest): Promise<void> {
    return this.patch<void, UpdatePOStatusRequest | undefined>(
      `/api/sales/purchase-orders/${id}/refund`,
      data,
      undefined,
      data ? UpdatePOStatusRequestSchema : undefined,
    );
  }

  async processPurchaseOrder(id: string, data?: UpdatePOStatusRequest): Promise<void> {
    return this.patch<void, UpdatePOStatusRequest | undefined>(
      `/api/sales/purchase-orders/${id}/process`,
      data,
      undefined,
      data ? UpdatePOStatusRequestSchema : undefined,
    );
  }

  async uploadPhotos(id: string, data: UploadPhotosRequest): Promise<void> {
    return this.post<void, UploadPhotosRequest>(
      `/api/sales/purchase-orders/${id}/photos`,
      data,
      undefined,
      UploadPhotosRequestSchema,
    );
  }

  async deletePhoto(id: string, data: DeletePhotoRequest): Promise<void> {
    await this.delete(
      `/api/sales/purchase-orders/${id}/photos`,
      data,
      undefined,
      DeletePhotoRequestSchema,
    );
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    return this.delete<void>(`/api/sales/purchase-orders/${id}`, undefined, undefined);
  }

  // ========== Product APIs ==========
  async getProducts(): Promise<GetProductsResponse> {
    return this.get<GetProductsResponse, void>(
      '/api/sales/products',
      undefined,
      GetProductsResponseSchema,
    );
  }

  async createProduct(data: CreateProductRequest): Promise<CreateProductResponse> {
    return this.post<CreateProductResponse, CreateProductRequest>(
      '/api/sales/products',
      data,
      CreateProductResponseSchema,
      CreateProductRequestSchema,
    );
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<void> {
    await this.patch<void, UpdateProductRequest>(
      `/api/sales/products/${id}`,
      data,
      undefined,
      UpdateProductRequestSchema,
    );
  }

  async bulkUpsertProducts(data: BulkUpsertProductsRequest): Promise<BulkUpsertProductsResponse> {
    return this.post<BulkUpsertProductsResponse, BulkUpsertProductsRequest>(
      '/api/sales/products/bulk-upsert',
      data,
      BulkUpsertProductsResponseSchema,
      BulkUpsertProductsRequestSchema,
    );
  }
}
