import * as z from 'zod/v4';
import {
  idSchema,
  numberSchema,
  optionalStringSchema,
  paginationSchema,
  stringSchema,
  timestampSchema,
  AddressSchema,
} from './common.schemas';
import { DeliveryStatusSchema, PICTypeSchema } from './deliveryRequest.schemas';

// ========== Purchase Order Schemas ==========

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

export const CreatePOItemSchema = z.object({
  productCode: stringSchema,
  description: stringSchema,
  color: optionalStringSchema,
  quantity: numberSchema.min(0),
  category: optionalStringSchema,
});

// PO Status enum
export const POStatusSchema = z.enum([
  'NEW',
  'CONFIRMED',
  'PROCESSING',
  'READY_FOR_PICKUP',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]);

// PO Status History schema
export const POStatusHistorySchema = z.object({
  status: POStatusSchema,
  timestamp: timestampSchema,
  userId: idSchema,
  reason: optionalStringSchema,
  carrier: optionalStringSchema,
  trackingNumber: optionalStringSchema,
  deliveryNotes: optionalStringSchema,
  pickupLocation: optionalStringSchema,
  notificationMessage: optionalStringSchema,
});

// Purchase Order schema
export const PurchaseOrderSchema = z.object({
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
      deliveryRequest: z
        .object({
          deliveryRequestId: idSchema,
          deliveryRequestNumber: optionalStringSchema,
          assignedType: PICTypeSchema,
          assignedTo: idSchema.optional(),
          status: DeliveryStatusSchema,
          scheduledDate: timestampSchema,
        })
        .optional(),
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
  pickupLocation: optionalStringSchema,
  notificationMessage: optionalStringSchema,
});

// Purchase Order response schemas
export const GetPurchaseOrdersResponseSchema = z.object({
  purchaseOrders: z.array(PurchaseOrderSchema),
  pagination: paginationSchema,
});

export const CreatePurchaseOrderResponseSchema = PurchaseOrderSchema;
export const UpdatePurchaseOrderResponseSchema = PurchaseOrderSchema;
export const GetPurchaseOrderResponseSchema = PurchaseOrderSchema;

// ========== Type Exports ==========
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
