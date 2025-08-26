import * as z from 'zod/v4';
import {
  idSchema,
  optionalStringSchema,
  paginationSchema,
  stringSchema,
  timestampSchema,
  numberSchema,
} from './common.schemas';

// ========== Delivery Request Schemas ==========

// Delivery Status enum
export const DeliveryStatusSchema = z.enum(['PENDING', 'IN_TRANSIT', 'COMPLETED']);
export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>;

// PIC Type enum
export const PICTypeSchema = z.enum(['EMPLOYEE', 'USER']);
export type PICType = z.infer<typeof PICTypeSchema>;

// Status History schema
const DeliveryStatusHistorySchema = z.object({
  status: DeliveryStatusSchema,
  timestamp: timestampSchema,
  userId: idSchema,
  notes: optionalStringSchema,
});

// Delivery Request base schema
export const DeliveryRequestSchema = z.object({
  id: idSchema,
  purchaseOrderId: idSchema,
  status: DeliveryStatusSchema,
  assignedTo: optionalStringSchema,
  assignedType: PICTypeSchema.optional(),
  assignedName: optionalStringSchema,
  scheduledDate: timestampSchema,
  completedDate: timestampSchema.optional(),
  notes: optionalStringSchema,
  photoUrls: z.array(stringSchema).optional(),
  metadata: z
    .looseObject({
      statusHistory: z.array(DeliveryStatusHistorySchema).optional(),
      deliveryOrder: numberSchema.optional(),
    })
    .optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Delivery Request with PO info (for detail endpoints)
export const DeliveryRequestDetailSchema = DeliveryRequestSchema.extend({
  purchaseOrder: z
    .object({
      id: idSchema,
      poNumber: stringSchema,
      customer: z.object({
        id: idSchema,
        name: stringSchema,
      }),
      items: z.array(
        z.object({
          id: idSchema,
          productCode: stringSchema,
          description: stringSchema,
          quantity: numberSchema,
          color: optionalStringSchema,
          category: optionalStringSchema,
        }),
      ),
    })
    .optional(),
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
export const GetDeliveryRequestResponseSchema = DeliveryRequestDetailSchema;

// ========== Type Exports ==========

export type DeliveryRequest = z.infer<typeof DeliveryRequestSchema>;
export type DeliveryRequestDetail = z.infer<typeof DeliveryRequestDetailSchema>;
export type DeliveryStatusHistory = z.infer<typeof DeliveryStatusHistorySchema>;

export type CreateDeliveryRequest = z.infer<typeof CreateDeliveryRequestSchema>;
export type UpdateDeliveryRequest = z.infer<typeof UpdateDeliveryRequestSchema>;
export type UpdateDeliveryStatus = z.infer<typeof UpdateDeliveryStatusSchema>;
export type UploadPhotos = z.infer<typeof UploadPhotosSchema>;
export type CompleteDelivery = z.infer<typeof CompleteDeliverySchema>;

export type GetDeliveryRequestsResponse = z.infer<typeof GetDeliveryRequestsResponseSchema>;
export type CreateDeliveryRequestResponse = z.infer<typeof CreateDeliveryRequestResponseSchema>;
export type UpdateDeliveryRequestResponse = z.infer<typeof UpdateDeliveryRequestResponseSchema>;
export type GetDeliveryRequestResponse = z.infer<typeof GetDeliveryRequestResponseSchema>;
