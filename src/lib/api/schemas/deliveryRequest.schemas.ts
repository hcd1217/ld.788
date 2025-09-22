import * as z from 'zod/v4';

import {
  AddressSchema,
  idSchema,
  numberSchema,
  optionalBooleanSchema,
  optionalIdSchema,
  optionalNumberSchema,
  optionalStringSchema,
  optionalTimestampSchema,
  paginationSchema,
  PhotoDataSchema,
  stringSchema,
  timestampSchema,
  UploadPhotoSchema,
} from './common.schemas';

// ========== Delivery Request Schemas ==========

// Delivery Status enum
export const DeliveryStatusSchema = z.enum(['PENDING', 'IN_TRANSIT', 'COMPLETED']);
export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>;

// Delivery Request base schema
export const DeliveryRequestSchema = z.object({
  id: idSchema,
  deliveryRequestNumber: stringSchema,
  status: DeliveryStatusSchema,
  assignedTo: optionalIdSchema,
  scheduledDate: timestampSchema,
  completedDate: optionalTimestampSchema,
  isUrgentDelivery: optionalBooleanSchema,
  deliveryOrderInDay: optionalNumberSchema,
  purchaseOrder: z
    .object({
      poId: idSchema,
      poNumber: stringSchema,
      customerId: idSchema,
    })
    .optional(),
  photos: z.array(PhotoDataSchema).optional(),
  deliveryAddress: AddressSchema.optional(),
  notes: optionalStringSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// ========== Request Schemas ==========

export const CreateDeliveryRequestSchema = z.object({
  purchaseOrderId: idSchema,
  assignedTo: idSchema,
  scheduledDate: stringSchema,
  notes: optionalStringSchema,
  isUrgentDelivery: optionalBooleanSchema,
});

export const UpdateDeliveryRequestSchema = z.object({
  assignedTo: optionalIdSchema,
  scheduledDate: optionalStringSchema,
  notes: optionalStringSchema,
  isUrgentDelivery: optionalBooleanSchema,
});

export const UpdateDeliveryStatusSchema = z.object({
  status: DeliveryStatusSchema,
  notes: optionalStringSchema,
});

export const UploadPhotosSchema = z.object({
  photos: z.array(UploadPhotoSchema),
});

export const DeletePhotoRequestSchema = z.object({
  photoId: idSchema,
});

export const CompleteDeliverySchema = z.object({
  photos: z.array(UploadPhotoSchema),
  deliveryNotes: optionalStringSchema,
  receivedBy: stringSchema,
});

export const UpdateDeliveryOrderInDaySchema = z.object({
  assignedTo: idSchema,
  startOfDay: stringSchema,
  endOfDay: stringSchema,
  sortOrder: z.array(
    z.object({
      id: idSchema,
      deliveryOrderInDay: numberSchema,
    }),
  ),
});

// ========== Response Schemas ==========

export const GetDeliveryRequestsResponseSchema = z.object({
  deliveryRequests: z.array(DeliveryRequestSchema),
  pagination: paginationSchema,
});

export const CreateDeliveryRequestResponseSchema = DeliveryRequestSchema;
export const UpdateDeliveryRequestResponseSchema = DeliveryRequestSchema;
export const GetDeliveryRequestResponseSchema = DeliveryRequestSchema;

// ========== Type Exports ==========

export type DeliveryRequest = z.infer<typeof DeliveryRequestSchema>;
export type DeliveryRequestDetail = z.infer<typeof DeliveryRequestSchema>;

export type CreateDeliveryRequest = z.infer<typeof CreateDeliveryRequestSchema>;
export type UpdateDeliveryRequest = z.infer<typeof UpdateDeliveryRequestSchema>;
export type UpdateDeliveryStatus = z.infer<typeof UpdateDeliveryStatusSchema>;
export type UploadPhotos = z.infer<typeof UploadPhotosSchema>;
export type DeletePhotoRequest = z.infer<typeof DeletePhotoRequestSchema>;
export type CompleteDelivery = z.infer<typeof CompleteDeliverySchema>;
export type UpdateDeliveryOrderInDay = z.infer<typeof UpdateDeliveryOrderInDaySchema>;

export type GetDeliveryRequestsResponse = z.infer<typeof GetDeliveryRequestsResponseSchema>;
export type CreateDeliveryRequestResponse = z.infer<typeof CreateDeliveryRequestResponseSchema>;
export type UpdateDeliveryRequestResponse = z.infer<typeof UpdateDeliveryRequestResponseSchema>;
export type GetDeliveryRequestResponse = z.infer<typeof GetDeliveryRequestResponseSchema>;
