import * as z from 'zod/v4';

import {
  emailSchema,
  idSchema,
  numberSchema,
  optionalBooleanSchema,
  optionalStringSchema,
  phoneNumberSchema,
  stringSchema,
} from './common.schemas';

// ========== Vendor Schemas ==========

const VendorMetadataSchema = z.looseObject({
  contactEmail: emailSchema.optional(),
  contactPhone: phoneNumberSchema.optional(),
  address: optionalStringSchema,
  taxCode: optionalStringSchema,
  isActive: optionalBooleanSchema,
  googleMapsUrl: optionalStringSchema,
  memo: optionalStringSchema,
  pic: optionalStringSchema,
});

// Vendor base schema
export const VendorSchema = z.object({
  id: idSchema,
  name: stringSchema,
  contactEmail: emailSchema.optional(),
  contactPhone: phoneNumberSchema.optional(),
  address: optionalStringSchema,
  taxCode: optionalStringSchema,
  isActive: optionalBooleanSchema,
  googleMapsUrl: optionalStringSchema,
  memo: optionalStringSchema,
  pic: optionalStringSchema,
});

// Vendor request schemas
export const CreateVendorRequestSchema = z.object({
  name: stringSchema,
  metadata: VendorMetadataSchema,
});

export const UpdateVendorRequestSchema = z.object({
  metadata: VendorMetadataSchema.partial(),
});

// Bulk upsert schema for vendors
export const BulkUpsertVendorItemSchema = z.object({
  name: stringSchema,
  metadata: VendorMetadataSchema.partial(),
});

export const BulkUpsertVendorsRequestSchema = z.object({
  vendors: z.array(BulkUpsertVendorItemSchema),
  skipInvalid: optionalBooleanSchema.default(false),
});

export const BulkUpsertVendorsResponseSchema = z.object({
  created: numberSchema,
  updated: numberSchema,
  failed: numberSchema,
  errors: z
    .array(
      z.object({
        vendor: BulkUpsertVendorItemSchema.optional(),
        error: stringSchema,
      }),
    )
    .optional(),
});

// Vendor response schemas
export const GetVendorsResponseSchema = z.object({
  vendors: z.array(VendorSchema),
});

export const CreateVendorResponseSchema = VendorSchema;

// ========== Type Exports ==========

export type Vendor = z.infer<typeof VendorSchema>;
export type CreateVendorRequest = z.infer<typeof CreateVendorRequestSchema>;
export type UpdateVendorRequest = z.infer<typeof UpdateVendorRequestSchema>;
export type BulkUpsertVendorItem = z.infer<typeof BulkUpsertVendorItemSchema>;
export type BulkUpsertVendorsRequest = z.infer<typeof BulkUpsertVendorsRequestSchema>;
export type BulkUpsertVendorsResponse = z.infer<typeof BulkUpsertVendorsResponseSchema>;
export type GetVendorsResponse = z.infer<typeof GetVendorsResponseSchema>;
export type CreateVendorResponse = z.infer<typeof CreateVendorResponseSchema>;
