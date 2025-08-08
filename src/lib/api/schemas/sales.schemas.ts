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
  creditLimit: numberSchema.optional(),
  creditUsed: numberSchema,
  isActive: z.boolean(),
  metadata: z.looseObject({}).optional(),
  deletedAt: timestampSchema.optional(),
  deletedBy: optionalStringSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Customer request schemas
export const CreateCustomerRequestSchema = z.object({
  name: stringSchema,
  companyName: optionalStringSchema,
  contactEmail: emailSchema.optional(),
  contactPhone: optionalStringSchema,
  address: optionalStringSchema,
  creditLimit: numberSchema.min(0).optional(),
  metadata: z.looseObject({}).optional(),
});

export const UpdateCustomerRequestSchema = z.object({
  name: stringSchema.optional(),
  companyName: optionalStringSchema,
  contactEmail: emailSchema.optional(),
  contactPhone: optionalStringSchema,
  address: optionalStringSchema,
  creditLimit: numberSchema.min(0).optional(),
  isActive: z.boolean().optional(),
  metadata: z.looseObject({}).optional(),
});

// Customer response schemas
export const GetCustomersResponseSchema = z.object({
  customers: z.array(CustomerSchema),
  pagination: paginationSchema,
});

export const CreateCustomerResponseSchema = CustomerSchema;
export const UpdateCustomerResponseSchema = CustomerSchema;
export const GetCustomerResponseSchema = CustomerSchema;

// ========== Purchase Order Schemas ==========

// Address schema
export const AddressSchema = z.object({
  street: stringSchema,
  city: stringSchema,
  state: optionalStringSchema,
  postalCode: optionalStringSchema,
  country: stringSchema,
});

// PO Item schemas
export const POItemSchema = z.object({
  id: idSchema,
  purchaseOrderId: idSchema,
  productCode: stringSchema,
  description: stringSchema,
  quantity: numberSchema,
  unitPrice: numberSchema,
  totalPrice: numberSchema,
  discount: numberSchema.optional(),
  category: optionalStringSchema,
  metadata: z.looseObject({}).optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const CreatePOItemSchema = z.object({
  productCode: stringSchema,
  description: stringSchema,
  quantity: numberSchema.min(0),
  unitPrice: numberSchema.min(0),
  discount: numberSchema.min(0).optional(),
  category: optionalStringSchema,
  metadata: z.looseObject({}).optional(),
});

// PO Status enum
export const POStatusSchema = z.enum([
  'NEW',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]);

// Purchase Order schema
export const PurchaseOrderSchema = z.object({
  id: idSchema,
  clientId: idSchema,
  poNumber: stringSchema,
  customerId: idSchema,
  customer: CustomerSchema.optional(),
  status: POStatusSchema,
  totalAmount: numberSchema,
  orderDate: timestampSchema,
  deliveryDate: timestampSchema.optional(),
  completedDate: timestampSchema.optional(),
  shippingAddress: AddressSchema.optional(),
  billingAddress: AddressSchema.optional(),
  paymentTerms: optionalStringSchema,
  notes: optionalStringSchema,
  createdBy: stringSchema,
  processedBy: optionalStringSchema,
  shippedBy: optionalStringSchema,
  deliveredBy: optionalStringSchema,
  cancelledBy: optionalStringSchema,
  cancelReason: optionalStringSchema,
  refundedBy: optionalStringSchema,
  refundReason: optionalStringSchema,
  refundAmount: numberSchema.optional(),
  items: z.array(POItemSchema),
  metadata: z.looseObject({}).optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Purchase Order request schemas
export const CreatePurchaseOrderRequestSchema = z.object({
  customerId: idSchema,
  orderDate: stringSchema,
  deliveryDate: optionalStringSchema,
  items: z.array(CreatePOItemSchema).min(1),
  shippingAddress: AddressSchema.optional(),
  billingAddress: AddressSchema.optional(),
  paymentTerms: optionalStringSchema,
  notes: optionalStringSchema,
  metadata: z.looseObject({}).optional(),
});

export const UpdatePurchaseOrderRequestSchema = z.object({
  customerId: idSchema.optional(),
  status: POStatusSchema.optional(),
  orderDate: stringSchema.optional(),
  deliveryDate: optionalStringSchema,
  completedDate: optionalStringSchema,
  items: z.array(CreatePOItemSchema).optional(),
  shippingAddress: AddressSchema.optional(),
  billingAddress: AddressSchema.optional(),
  paymentTerms: optionalStringSchema,
  notes: optionalStringSchema,
  metadata: z.looseObject({}).optional(),
});

export const UpdatePOStatusRequestSchema = z.object({
  reason: optionalStringSchema,
  refundAmount: numberSchema.optional(),
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
  unitPrice: numberSchema,
  costPrice: numberSchema.optional(),
  status: ProductStatusSchema,
  stockLevel: numberSchema,
  minStock: numberSchema.optional(),
  maxStock: numberSchema.optional(),
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
  unitPrice: numberSchema.min(0),
  costPrice: numberSchema.min(0).optional(),
  status: ProductStatusSchema.optional(),
  stockLevel: numberSchema.min(0),
  minStock: numberSchema.min(0).optional(),
  maxStock: numberSchema.min(0).optional(),
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
  unitPrice: numberSchema.min(0).optional(),
  costPrice: numberSchema.min(0).optional(),
  status: ProductStatusSchema.optional(),
  stockLevel: numberSchema.min(0).optional(),
  minStock: numberSchema.min(0).optional(),
  maxStock: numberSchema.min(0).optional(),
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

// ========== Type Exports ==========

// Customer types
export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomerRequest = z.infer<typeof CreateCustomerRequestSchema>;
export type UpdateCustomerRequest = z.infer<typeof UpdateCustomerRequestSchema>;
export type GetCustomersResponse = z.infer<typeof GetCustomersResponseSchema>;
export type CreateCustomerResponse = z.infer<typeof CreateCustomerResponseSchema>;
export type UpdateCustomerResponse = z.infer<typeof UpdateCustomerResponseSchema>;
export type GetCustomerResponse = z.infer<typeof GetCustomerResponseSchema>;

// Purchase Order types
export type Address = z.infer<typeof AddressSchema>;
export type POItem = z.infer<typeof POItemSchema>;
export type CreatePOItem = z.infer<typeof CreatePOItemSchema>;
export type POStatus = z.infer<typeof POStatusSchema>;
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
