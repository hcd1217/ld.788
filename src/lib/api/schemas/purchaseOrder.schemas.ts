import * as z from 'zod/v4';

import {
  AddressSchema,
  backEndTimestampSchema,
  booleanSchema,
  idSchema,
  numberSchema,
  optionalBackEndTimestampSchema,
  optionalBooleanSchema,
  optionalIdSchema,
  optionalStringSchema,
  optionalTimestampSchema,
  paginationSchema,
  PhotoDataSchema,
  stringSchema,
  timestampSchema,
  UploadPhotoSchema,
} from './common.schemas';
import { DeliveryStatusSchema } from './deliveryRequest.schemas';

// ========== Purchase Order Schemas ==========
// PO Metadata schema
const POUpsertMetadataSchema = z.object({
  notes: optionalStringSchema,
  shippingAddress: AddressSchema.optional(),
  isInternalDelivery: optionalBooleanSchema,
});

// PO Item schemas
export const POItemSchema = z.object({
  id: idSchema,
  purchaseOrderId: idSchema,
  productId: idSchema,
  productCode: stringSchema,
  description: stringSchema,
  color: optionalStringSchema,
  quantity: numberSchema,
  category: optionalStringSchema,
  notes: optionalStringSchema,
  unit: optionalStringSchema,
});

const UpsertPOItemSchema = z.object({
  metadata: z.object({
    productId: idSchema,
    productCode: stringSchema,
    description: optionalStringSchema,
    color: optionalStringSchema,
    quantity: numberSchema.min(1),
    category: optionalStringSchema,
    notes: optionalStringSchema,
    unit: optionalStringSchema,
  }),
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
  poNumber: stringSchema,
  customerId: idSchema,
  salesId: optionalIdSchema,
  status: POStatusSchema,
  orderDate: timestampSchema,
  deliveryDate: optionalTimestampSchema,
  isInternalDelivery: booleanSchema,
  completedDate: optionalTimestampSchema,
  notes: optionalStringSchema,
  items: z.array(POItemSchema),
  shippingAddress: AddressSchema.optional(),
  statusHistory: z.array(POStatusHistorySchema).optional(),
  photos: z.array(PhotoDataSchema).optional(),
  deliveryRequest: z
    .object({
      deliveryRequestId: idSchema,
      deliveryRequestNumber: stringSchema,
      assignedTo: optionalIdSchema,
      isUrgentDelivery: optionalBooleanSchema,
      status: DeliveryStatusSchema,
      deliveryPerson: optionalStringSchema,
      scheduledDate: timestampSchema,
    })
    .optional(),
});

// Purchase Order request schemas
export const CreatePurchaseOrderRequestSchema = z.object({
  customerId: idSchema,
  salesId: optionalIdSchema,
  orderDate: backEndTimestampSchema,
  deliveryDate: optionalBackEndTimestampSchema,
  items: z.array(UpsertPOItemSchema).min(1),
  metadata: POUpsertMetadataSchema,
});

export const UpdatePurchaseOrderRequestSchema = z.object({
  salesId: optionalIdSchema,
  orderDate: optionalBackEndTimestampSchema,
  deliveryDate: optionalBackEndTimestampSchema,
  items: z.array(UpsertPOItemSchema).optional(),
  metadata: POUpsertMetadataSchema,
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

export const UploadPhotosRequestSchema = z.object({
  photos: z.array(UploadPhotoSchema),
});

export const DeletePhotoRequestSchema = z.object({
  photoId: idSchema,
});

// Purchase Order response schemas
export const GetPurchaseOrdersResponseSchema = z.object({
  purchaseOrders: z.array(PurchaseOrderSchema),
  pagination: paginationSchema,
});

export const CreatePurchaseOrderResponseSchema = PurchaseOrderSchema;
export const GetPurchaseOrderResponseSchema = PurchaseOrderSchema;

// ========== Type Exports ==========
export type POItem = z.infer<typeof POItemSchema>;
export type POStatus = z.infer<typeof POStatusSchema>;
export type POStatusHistory = z.infer<typeof POStatusHistorySchema>;
export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;
export type CreatePurchaseOrderRequest = z.infer<typeof CreatePurchaseOrderRequestSchema>;
export type UpdatePurchaseOrderRequest = z.infer<typeof UpdatePurchaseOrderRequestSchema>;
export type UpdatePOStatusRequest = z.infer<typeof UpdatePOStatusRequestSchema>;
export type UploadPhotosRequest = z.infer<typeof UploadPhotosRequestSchema>;
export type DeletePhotoRequest = z.infer<typeof DeletePhotoRequestSchema>;
export type GetPurchaseOrdersResponse = z.infer<typeof GetPurchaseOrdersResponseSchema>;
export type CreatePurchaseOrderResponse = z.infer<typeof CreatePurchaseOrderResponseSchema>;
export type GetPurchaseOrderResponse = z.infer<typeof GetPurchaseOrderResponseSchema>;
