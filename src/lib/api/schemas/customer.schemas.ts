import * as z from 'zod/v4';
import {
  emailSchema,
  idSchema,
  numberSchema,
  optionalStringSchema,
  paginationSchema,
  phoneNumberSchema,
  stringSchema,
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

// ========== Type Exports ==========

export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomerRequest = z.infer<typeof CreateCustomerRequestSchema>;
export type UpdateCustomerRequest = z.infer<typeof UpdateCustomerRequestSchema>;
export type BulkUpsertCustomerItem = z.infer<typeof BulkUpsertCustomerItemSchema>;
export type BulkUpsertCustomersRequest = z.infer<typeof BulkUpsertCustomersRequestSchema>;
export type BulkUpsertCustomersResponse = z.infer<typeof BulkUpsertCustomersResponseSchema>;
export type GetCustomersResponse = z.infer<typeof GetCustomersResponseSchema>;
export type CreateCustomerResponse = z.infer<typeof CreateCustomerResponseSchema>;
export type UpdateCustomerResponse = z.infer<typeof UpdateCustomerResponseSchema>;
