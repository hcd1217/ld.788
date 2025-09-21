import * as z from 'zod/v4';

import {
  idSchema,
  numberSchema,
  optionalBooleanSchema,
  optionalStringSchema,
  stringSchema,
} from './common.schemas';

// ========== Product Schemas ==========

export const ProductSchema = z.object({
  id: idSchema,
  productCode: stringSchema,
  name: stringSchema,
  description: optionalStringSchema,
  category: optionalStringSchema,
  unit: optionalStringSchema,
  color: optionalStringSchema,
  isDeleted: optionalBooleanSchema,
});

export const CreateProductRequestSchema = z.object({
  productCode: stringSchema,
  metadata: z.object({
    name: stringSchema,
    description: optionalStringSchema,
    category: optionalStringSchema,
    unit: optionalStringSchema,
    color: optionalStringSchema,
  }),
});

export const UpdateProductRequestSchema = z.object({
  productCode: stringSchema.optional(),
  metadata: z
    .object({
      isDeleted: optionalBooleanSchema,
      name: optionalStringSchema,
      description: optionalStringSchema,
      category: optionalStringSchema,
      unit: optionalStringSchema,
      color: optionalStringSchema,
    })
    .partial(),
});

export const GetProductsResponseSchema = z.object({
  products: z.array(ProductSchema),
});

export const CreateProductResponseSchema = ProductSchema;
export const UpdateProductResponseSchema = ProductSchema;
export const GetProductResponseSchema = ProductSchema;

export const BulkUpsertProductItemSchema = CreateProductRequestSchema;

export const BulkUpsertProductsRequestSchema = z.object({
  products: z.array(BulkUpsertProductItemSchema).min(1),
  skipInvalid: optionalBooleanSchema.default(false),
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

export type Product = z.infer<typeof ProductSchema>;
export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;
export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;
export type GetProductsResponse = z.infer<typeof GetProductsResponseSchema>;
export type CreateProductResponse = z.infer<typeof CreateProductResponseSchema>;
export type UpdateProductResponse = z.infer<typeof UpdateProductResponseSchema>;
export type BulkUpsertProductItem = z.infer<typeof BulkUpsertProductItemSchema>;
export type BulkUpsertProductsRequest = z.infer<typeof BulkUpsertProductsRequestSchema>;
export type BulkUpsertProductsResponse = z.infer<typeof BulkUpsertProductsResponseSchema>;
