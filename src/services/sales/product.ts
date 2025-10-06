import { salesApi } from '@/lib/api';
import {
  type BulkUpsertProductsRequest,
  type BulkUpsertProductsResponse,
  type CreateProductRequest,
  type Product,
  type UpdateProductRequest,
} from '@/lib/api/schemas/sales.schemas';

// Re-export types for compatibility
export type {
  Product,
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
  unit?: string;
};

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    const response = await salesApi.getProducts();
    return response.products.sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return a.name.localeCompare(b.name);
    });
  },

  async createProduct(data: CreateProductRequest): Promise<Product> {
    return salesApi.createProduct(data);
  },

  async updateProduct(id: string, data: UpdateProductRequest): Promise<void> {
    await salesApi.updateProduct(id, data);
  },

  async activateProduct(id: string): Promise<void> {
    await salesApi.updateProduct(id, {
      metadata: {
        isActive: true,
      },
    });
  },

  async deactivateProduct(id: string): Promise<void> {
    await salesApi.updateProduct(id, {
      metadata: {
        isActive: false,
      },
    });
  },

  async bulkUpsertProducts(data: BulkUpsertProductsRequest): Promise<BulkUpsertProductsResponse> {
    return salesApi.bulkUpsertProducts(data);
  },
};
