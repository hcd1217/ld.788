import * as z from 'zod/v4';
import {
  emailSchema,
  idSchema,
  numberSchema,
  optionalStringSchema,
  paginationSchema,
  phoneNumberSchema,
  stringSchema,
  timestampSchema,
} from './common.schemas';

// ========== Customer Schemas ==========

// Customer base schema
export const CustomerSchema = z.object({
  id: idSchema,
  clientId: idSchema,
  name: stringSchema,
  companyName: optionalStringSchema,
  contactEmail: optionalStringSchema,
  contactPhone: phoneNumberSchema,
  address: optionalStringSchema,
  metadata: z.looseObject({
    googleMapsUrl: optionalStringSchema,
  }),
  taxCode: optionalStringSchema,
  isActive: z.boolean(),
});

const BulkUpsertCustomerMetadataSchema = z
  .looseObject({
    googleMapsUrl: optionalStringSchema,
  })
  .optional();

// Customer request schemas
export const CreateCustomerRequestSchema = z.object({
  name: stringSchema,
  companyName: optionalStringSchema,
  contactEmail: emailSchema.optional(),
  contactPhone: optionalStringSchema,
  address: optionalStringSchema,
  metadata: BulkUpsertCustomerMetadataSchema,
  taxCode: optionalStringSchema,
});

export const UpdateCustomerRequestSchema = z.object({
  name: stringSchema.optional(),
  companyName: optionalStringSchema,
  contactEmail: emailSchema.optional(),
  contactPhone: optionalStringSchema,
  address: optionalStringSchema,
  metadata: BulkUpsertCustomerMetadataSchema,
  taxCode: optionalStringSchema,
  isActive: z.boolean().optional(),
});

// Bulk upsert schema for customers
export const BulkUpsertCustomerItemSchema = z.object({
  name: stringSchema,
  companyName: optionalStringSchema,
  contactEmail: emailSchema.optional(),
  contactPhone: optionalStringSchema,
  address: optionalStringSchema,
  taxCode: optionalStringSchema,
  metadata: BulkUpsertCustomerMetadataSchema,
});

export const BulkUpsertCustomersRequestSchema = z.object({
  customers: z.array(BulkUpsertCustomerItemSchema),
  skipInvalid: z.boolean().optional().default(false),
});

export const BulkUpsertCustomersResponseSchema = z.object({
  created: numberSchema,
  updated: numberSchema,
  failed: numberSchema,
  errors: z
    .array(
      z.object({
        customer: BulkUpsertCustomerItemSchema.optional(),
        error: stringSchema,
      }),
    )
    .optional(),
});

// Customer response schemas
export const GetCustomersResponseSchema = z.object({
  customers: z.array(CustomerSchema),
  pagination: paginationSchema,
});

export const CreateCustomerResponseSchema = CustomerSchema;
export const UpdateCustomerResponseSchema = CustomerSchema;

// ========== Purchase Order Schemas ==========

// Address schema
const AddressSchema = z.object({
  oneLineAddress: optionalStringSchema,
  googleMapsUrl: optionalStringSchema,
});

// PO Item schemas
export const POItemSchema = z.object({
  id: idSchema,
  purchaseOrderId: idSchema,
  productCode: stringSchema,
  description: stringSchema,
  color: optionalStringSchema,
  quantity: numberSchema,
  category: optionalStringSchema,
});

const CreatePOItemSchema = z.object({
  productCode: stringSchema,
  description: stringSchema,
  color: optionalStringSchema,
  quantity: numberSchema.min(0),
  category: optionalStringSchema,
});

// PO Status enum
const POStatusSchema = z.enum([
  'NEW',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]);

// PO Status History schema
const POStatusHistorySchema = z.object({
  status: POStatusSchema,
  timestamp: timestampSchema,
  userId: idSchema,
  reason: optionalStringSchema,
  carrier: optionalStringSchema,
  trackingNumber: optionalStringSchema,
  deliveryNotes: optionalStringSchema,
});

// Purchase Order schema
const PurchaseOrderSchema = z.object({
  id: idSchema,
  clientId: idSchema,
  poNumber: stringSchema,
  customerId: idSchema,
  status: POStatusSchema,
  orderDate: timestampSchema,
  deliveryDate: timestampSchema.optional(),
  completedDate: timestampSchema.optional(),
  notes: optionalStringSchema,
  items: z.array(POItemSchema),
  metadata: z
    .looseObject({
      shippingAddress: AddressSchema.optional(),
      statusHistory: z.array(POStatusHistorySchema).optional(),
    })
    .optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Purchase Order request schemas
export const CreatePurchaseOrderRequestSchema = z.object({
  customerId: idSchema,
  orderDate: optionalStringSchema,
  deliveryDate: optionalStringSchema,
  items: z.array(CreatePOItemSchema).min(1),
  notes: optionalStringSchema,
  metadata: z.looseObject({
    shippingAddress: AddressSchema.optional(),
  }),
});

export const UpdatePurchaseOrderRequestSchema = z.object({
  customerId: idSchema.optional(),
  status: POStatusSchema.optional(),
  orderDate: stringSchema.optional(),
  deliveryDate: optionalStringSchema,
  completedDate: optionalStringSchema,
  items: z.array(CreatePOItemSchema).optional(),
  notes: optionalStringSchema,
  metadata: z
    .looseObject({
      shippingAddress: AddressSchema.optional(),
    })
    .optional(),
});

export const UpdatePOStatusRequestSchema = z.object({
  cancelReason: optionalStringSchema,
  refundReason: optionalStringSchema,
  trackingNumber: optionalStringSchema,
  carrier: optionalStringSchema,
  deliveryNotes: optionalStringSchema,
});

// Purchase Order response schemas
export const GetPurchaseOrdersResponseSchema = z.object({
  purchaseOrders: z.array(PurchaseOrderSchema),
  pagination: paginationSchema,
});

export const CreatePurchaseOrderResponseSchema = PurchaseOrderSchema;
export const UpdatePurchaseOrderResponseSchema = PurchaseOrderSchema;
export const GetPurchaseOrderResponseSchema = PurchaseOrderSchema;

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

// Customer types
export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomerRequest = z.infer<typeof CreateCustomerRequestSchema>;
export type UpdateCustomerRequest = z.infer<typeof UpdateCustomerRequestSchema>;
export type BulkUpsertCustomerItem = z.infer<typeof BulkUpsertCustomerItemSchema>;
export type BulkUpsertCustomersRequest = z.infer<typeof BulkUpsertCustomersRequestSchema>;
export type BulkUpsertCustomersResponse = z.infer<typeof BulkUpsertCustomersResponseSchema>;
export type GetCustomersResponse = z.infer<typeof GetCustomersResponseSchema>;
export type CreateCustomerResponse = z.infer<typeof CreateCustomerResponseSchema>;
export type UpdateCustomerResponse = z.infer<typeof UpdateCustomerResponseSchema>;

// Purchase Order types
export type Address = z.infer<typeof AddressSchema>;
export type POItem = z.infer<typeof POItemSchema>;
export type CreatePOItem = z.infer<typeof CreatePOItemSchema>;
export type POStatus = z.infer<typeof POStatusSchema>;
export type POStatusHistory = z.infer<typeof POStatusHistorySchema>;
export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;
export type CreatePurchaseOrderRequest = z.infer<typeof CreatePurchaseOrderRequestSchema>;
export type UpdatePurchaseOrderRequest = z.infer<typeof UpdatePurchaseOrderRequestSchema>;
export type UpdatePOStatusRequest = z.infer<typeof UpdatePOStatusRequestSchema>;
export type GetPurchaseOrdersResponse = z.infer<typeof GetPurchaseOrdersResponseSchema>;
export type CreatePurchaseOrderResponse = z.infer<typeof CreatePurchaseOrderResponseSchema>;
export type UpdatePurchaseOrderResponse = z.infer<typeof UpdatePurchaseOrderResponseSchema>;
export type GetPurchaseOrderResponse = z.infer<typeof GetPurchaseOrderResponseSchema>;

// Product types
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
