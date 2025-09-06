import { salesApi } from '@/lib/api';
import {
  type Product,
  type ProductStatus,
  type CreateProductRequest,
  type UpdateProductRequest,
  type BulkUpsertProductsRequest,
  type BulkUpsertProductsResponse,
} from '@/lib/api/schemas/sales.schemas';

// Re-export types for compatibility
export type {
  Product,
  ProductStatus,
  CreateProductRequest,
  UpdateProductRequest,
  BulkUpsertProductsRequest,
  BulkUpsertProductsResponse,
} from '@/lib/api/schemas/sales.schemas';

// Legacy type for backward compatibility with Excel import
export type BulkUpsertProductItem = {
  productCode: string;
  name: string;
  description?: string;
  category?: string;
  color?: string;
  status?: ProductStatus;
  unit?: string;
  sku?: string;
  barcode?: string;
};

export const productService = {
  async getAllProducts(params?: {
    search?: string;
    category?: string;
    status?: ProductStatus;
    lowStock?: boolean;
  }): Promise<Product[]> {
    const response = await salesApi.getProducts({
      ...params,
      limit: 100,
    });
    return response.products;
  },

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      return await salesApi.getProductById(id);
    } catch {
      return undefined;
    }
  },

  async createProduct(data: CreateProductRequest): Promise<Product> {
    return salesApi.createProduct(data);
  },

  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    return salesApi.updateProduct(id, data);
  },

  async deleteProduct(id: string): Promise<void> {
    await salesApi.deleteProduct(id);
  },

  async bulkUpsertProducts(data: BulkUpsertProductsRequest): Promise<BulkUpsertProductsResponse> {
    return salesApi.bulkUpsertProducts(data);
  },
};
