import * as z from 'zod/v4';
import {
  idSchema,
  numberSchema,
  optionalStringSchema,
  paginationSchema,
  stringSchema,
  timestampSchema,
} from './common.schemas';

// ========== Product Schemas ==========

// Product Status enum
export const ProductStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'DISCONTINUED',
  'OUT_OF_STOCK',
  'LOW_STOCK',
]);

// Product schema
export const ProductSchema = z.object({
  id: idSchema,
  productCode: stringSchema,
  name: stringSchema,
  description: optionalStringSchema,
  category: optionalStringSchema,
  color: optionalStringSchema,
  status: ProductStatusSchema,
  unit: optionalStringSchema,
  sku: optionalStringSchema,
  barcode: optionalStringSchema,
  weight: numberSchema.optional(),
  dimensions: z
    .object({
      length: numberSchema,
      width: numberSchema,
      height: numberSchema,
    })
    .optional(),
  metadata: z.looseObject({}).optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Product request schemas
export const CreateProductRequestSchema = z.object({
  productCode: stringSchema,
  name: stringSchema,
  description: optionalStringSchema,
  category: optionalStringSchema,
  color: optionalStringSchema,
  status: ProductStatusSchema.optional(),
  unit: optionalStringSchema,
  sku: optionalStringSchema,
  barcode: optionalStringSchema,
  weight: numberSchema.min(0).optional(),
  dimensions: z
    .object({
      length: numberSchema.min(0),
      width: numberSchema.min(0),
      height: numberSchema.min(0),
    })
    .optional(),
  metadata: z.looseObject({}).optional(),
});

export const UpdateProductRequestSchema = z.object({
  productCode: stringSchema.optional(),
  name: stringSchema.optional(),
  description: optionalStringSchema,
  category: optionalStringSchema,
  color: optionalStringSchema,
  status: ProductStatusSchema.optional(),
  unit: optionalStringSchema,
  sku: optionalStringSchema,
  barcode: optionalStringSchema,
  weight: numberSchema.min(0).optional(),
  dimensions: z
    .object({
      length: numberSchema.min(0),
      width: numberSchema.min(0),
      height: numberSchema.min(0),
    })
    .optional(),
  metadata: z.looseObject({}).optional(),
});

// Product response schemas
export const GetProductsResponseSchema = z.object({
  products: z.array(ProductSchema),
  pagination: paginationSchema,
});

export const CreateProductResponseSchema = ProductSchema;
export const UpdateProductResponseSchema = ProductSchema;
export const GetProductResponseSchema = ProductSchema;

// Bulk Upsert schemas
export const BulkUpsertProductItemSchema = z.object({
  productCode: stringSchema,
  name: stringSchema,
  description: optionalStringSchema,
  category: optionalStringSchema,
  color: optionalStringSchema,
  status: ProductStatusSchema.optional(),
  unit: optionalStringSchema,
  sku: optionalStringSchema,
  barcode: optionalStringSchema,
  weight: numberSchema.min(0).optional(),
  dimensions: z
    .object({
      length: numberSchema.min(0),
      width: numberSchema.min(0),
      height: numberSchema.min(0),
    })
    .optional(),
  metadata: z.looseObject({}).optional(),
});

export const BulkUpsertProductsRequestSchema = z.object({
  products: z.array(BulkUpsertProductItemSchema).min(1),
  skipInvalid: z.boolean().optional().default(false),
});

export const BulkUpsertProductsResponseSchema = z.object({
  created: numberSchema,
  updated: numberSchema,
  failed: numberSchema,
  errors: z
    .array(
      z.object({
        product: BulkUpsertProductItemSchema.optional(),
        error: stringSchema,
      }),
    )
    .optional(),
});

// ========== Type Exports ==========

export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;
export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;
export type GetProductsResponse = z.infer<typeof GetProductsResponseSchema>;
export type CreateProductResponse = z.infer<typeof CreateProductResponseSchema>;
export type UpdateProductResponse = z.infer<typeof UpdateProductResponseSchema>;
export type GetProductResponse = z.infer<typeof GetProductResponseSchema>;
export type BulkUpsertProductItem = z.infer<typeof BulkUpsertProductItemSchema>;
export type BulkUpsertProductsRequest = z.infer<typeof BulkUpsertProductsRequestSchema>;
export type BulkUpsertProductsResponse = z.infer<typeof BulkUpsertProductsResponseSchema>;
