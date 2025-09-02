import { BaseApiClient } from '../base';
import {
  // Customer schemas
  GetCustomersResponseSchema,
  CreateCustomerRequestSchema,
  CreateCustomerResponseSchema,
  UpdateCustomerRequestSchema,
  UpdateCustomerResponseSchema,
  BulkUpsertCustomersRequestSchema,
  BulkUpsertCustomersResponseSchema,
  type GetCustomersResponse,
  type CreateCustomerRequest,
  type CreateCustomerResponse,
  type UpdateCustomerRequest,
  type UpdateCustomerResponse,
  type BulkUpsertCustomersRequest,
  type BulkUpsertCustomersResponse,
  // Purchase Order schemas
  GetPurchaseOrdersResponseSchema,
  CreatePurchaseOrderRequestSchema,
  CreatePurchaseOrderResponseSchema,
  UpdatePurchaseOrderRequestSchema,
  UpdatePurchaseOrderResponseSchema,
  GetPurchaseOrderResponseSchema,
  UpdatePOStatusRequestSchema,
  type GetPurchaseOrdersResponse,
  type CreatePurchaseOrderRequest,
  type CreatePurchaseOrderResponse,
  type UpdatePurchaseOrderRequest,
  type UpdatePurchaseOrderResponse,
  type GetPurchaseOrderResponse,
  type UpdatePOStatusRequest,
  type POStatus,
  // Product schemas
  GetProductsResponseSchema,
  CreateProductRequestSchema,
  CreateProductResponseSchema,
  UpdateProductRequestSchema,
  UpdateProductResponseSchema,
  GetProductResponseSchema,
  BulkUpsertProductsRequestSchema,
  BulkUpsertProductsResponseSchema,
  type GetProductsResponse,
  type CreateProductRequest,
  type CreateProductResponse,
  type UpdateProductRequest,
  type UpdateProductResponse,
  type GetProductResponse,
  type BulkUpsertProductsRequest,
  type BulkUpsertProductsResponse,
  type ProductStatus,
} from '../schemas/sales.schemas';

export class SalesApi extends BaseApiClient {
  // ========== Customer APIs ==========
  async getCustomers(params?: {
    search?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<GetCustomersResponse> {
    const queryParams = new URLSearchParams();
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

  async updateCustomer(id: string, data: UpdateCustomerRequest): Promise<UpdateCustomerResponse> {
    return this.patch<UpdateCustomerResponse, UpdateCustomerRequest>(
      `/api/sales/customers/${id}`,
      data,
      UpdateCustomerResponseSchema,
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

  // ========== Purchase Order APIs ==========
  async getPurchaseOrders(params?: {
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

  async updatePurchaseOrder(
    id: string,
    data: UpdatePurchaseOrderRequest,
  ): Promise<UpdatePurchaseOrderResponse> {
    return this.patch<UpdatePurchaseOrderResponse, UpdatePurchaseOrderRequest>(
      `/api/sales/purchase-orders/${id}`,
      data,
      UpdatePurchaseOrderResponseSchema,
      UpdatePurchaseOrderRequestSchema,
    );
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

  // ========== Product APIs ==========
  async getProducts(params?: {
    search?: string;
    category?: string;
    color?: string;
    status?: ProductStatus;
    minPrice?: number;
    maxPrice?: number;
    lowStock?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'name' | 'productCode' | 'status' | 'category' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<GetProductsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.color) queryParams.append('color', params.color);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.minPrice !== undefined) queryParams.append('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) queryParams.append('maxPrice', String(params.maxPrice));
    if (params?.lowStock !== undefined) queryParams.append('lowStock', String(params.lowStock));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    // Default limit if not provided
    if (!params?.limit) queryParams.append('limit', '1000');

    const url = `/api/sales/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<GetProductsResponse, void>(url, undefined, GetProductsResponseSchema);
  }

  async getProductById(id: string): Promise<GetProductResponse> {
    return this.get<GetProductResponse, void>(
      `/api/sales/products/${id}`,
      undefined,
      GetProductResponseSchema,
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

  async updateProduct(id: string, data: UpdateProductRequest): Promise<UpdateProductResponse> {
    return this.patch<UpdateProductResponse, UpdateProductRequest>(
      `/api/sales/products/${id}`,
      data,
      UpdateProductResponseSchema,
      UpdateProductRequestSchema,
    );
  }

  async deleteProduct(id: string): Promise<void> {
    return this.delete(`/api/sales/products/${id}`);
  }

  async updateProductStock(
    id: string,
    data: { stockLevel: number },
  ): Promise<UpdateProductResponse> {
    return this.patch<UpdateProductResponse, { stockLevel: number }>(
      `/api/sales/products/${id}/stock`,
      data,
      UpdateProductResponseSchema,
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
