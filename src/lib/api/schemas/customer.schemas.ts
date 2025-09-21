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

// ========== Customer Schemas ==========

const CustomerMetadataSchema = z.looseObject({
  companyName: optionalStringSchema,
  contactEmail: emailSchema.optional(),
  contactPhone: phoneNumberSchema.optional(),
  address: optionalStringSchema,
  deliveryAddress: optionalStringSchema,
  taxCode: optionalStringSchema,
  isActive: optionalBooleanSchema,
  googleMapsUrl: optionalStringSchema,
  memo: optionalStringSchema,
  pic: optionalStringSchema,
});

// Customer base schema
export const CustomerSchema = z.object({
  id: idSchema,
  name: stringSchema,
  companyName: optionalStringSchema,
  contactEmail: emailSchema.optional(),
  contactPhone: phoneNumberSchema.optional(),
  address: optionalStringSchema,
  deliveryAddress: optionalStringSchema,
  taxCode: optionalStringSchema,
  isActive: optionalBooleanSchema,
  googleMapsUrl: optionalStringSchema,
  memo: optionalStringSchema,
  pic: optionalStringSchema,
});

// Customer request schemas
export const CreateCustomerRequestSchema = z.object({
  name: stringSchema,
  metadata: CustomerMetadataSchema,
});

export const UpdateCustomerRequestSchema = z.object({
  metadata: CustomerMetadataSchema.partial(),
});

// Bulk upsert schema for customers
export const BulkUpsertCustomerItemSchema = z.object({
  name: stringSchema,
  metadata: CustomerMetadataSchema.partial(),
});

export const BulkUpsertCustomersRequestSchema = z.object({
  customers: z.array(BulkUpsertCustomerItemSchema),
  skipInvalid: optionalBooleanSchema.default(false),
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
});

export const CreateCustomerResponseSchema = CustomerSchema;

// ========== Type Exports ==========

export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomerRequest = z.infer<typeof CreateCustomerRequestSchema>;
export type UpdateCustomerRequest = z.infer<typeof UpdateCustomerRequestSchema>;
export type BulkUpsertCustomerItem = z.infer<typeof BulkUpsertCustomerItemSchema>;
export type BulkUpsertCustomersRequest = z.infer<typeof BulkUpsertCustomersRequestSchema>;
export type BulkUpsertCustomersResponse = z.infer<typeof BulkUpsertCustomersResponseSchema>;
export type GetCustomersResponse = z.infer<typeof GetCustomersResponseSchema>;
export type CreateCustomerResponse = z.infer<typeof CreateCustomerResponseSchema>;
