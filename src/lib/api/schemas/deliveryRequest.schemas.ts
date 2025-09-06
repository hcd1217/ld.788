import * as z from 'zod/v4';
import {
  idSchema,
  optionalStringSchema,
  paginationSchema,
  stringSchema,
  timestampSchema,
  AddressSchema,
} from './common.schemas';

// ========== Delivery Request Schemas ==========

// Delivery Status enum
export const DeliveryStatusSchema = z.enum(['PENDING', 'IN_TRANSIT', 'COMPLETED']);
export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>;

// PIC Type enum
export const PICTypeSchema = z.enum(['EMPLOYEE', 'USER']);
export type PICType = z.infer<typeof PICTypeSchema>;

// Delivery Request base schema
export const DeliveryRequestSchema = z.object({
  id: idSchema,
  deliveryRequestNumber: stringSchema,
  status: DeliveryStatusSchema,
  assignedTo: idSchema.optional(),
  assignedType: PICTypeSchema.optional(),
  scheduledDate: timestampSchema,
  completedDate: timestampSchema.optional(),
  metadata: z.looseObject({
    photoUrls: z.array(stringSchema).optional(),
    deliveryAddress: AddressSchema.optional(),
    po: z
      .looseObject({
        poId: idSchema,
        poNumber: stringSchema,
        customerName: stringSchema,
        customerId: idSchema,
      })
      .optional(),
  }),
  notes: stringSchema.optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// ========== Request Schemas ==========

export const CreateDeliveryRequestSchema = z.object({
  purchaseOrderId: idSchema,
  assignedTo: idSchema,
  assignedType: PICTypeSchema,
  scheduledDate: stringSchema,
  notes: optionalStringSchema,
});

export const UpdateDeliveryRequestSchema = z.object({
  assignedTo: idSchema.optional(),
  assignedType: PICTypeSchema.optional(),
  scheduledDate: stringSchema.optional(),
  notes: optionalStringSchema,
});

export const UpdateDeliveryStatusSchema = z.object({
  status: DeliveryStatusSchema,
  notes: optionalStringSchema,
});

export const UploadPhotosSchema = z.object({
  photoUrls: z.array(stringSchema),
});

export const CompleteDeliverySchema = z.object({
  photoUrls: z.array(stringSchema).optional(),
  notes: optionalStringSchema,
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
export type CompleteDelivery = z.infer<typeof CompleteDeliverySchema>;

export type GetDeliveryRequestsResponse = z.infer<typeof GetDeliveryRequestsResponseSchema>;
export type CreateDeliveryRequestResponse = z.infer<typeof CreateDeliveryRequestResponseSchema>;
export type UpdateDeliveryRequestResponse = z.infer<typeof UpdateDeliveryRequestResponseSchema>;
export type GetDeliveryRequestResponse = z.infer<typeof GetDeliveryRequestResponseSchema>;
