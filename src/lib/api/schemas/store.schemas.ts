import * as z from 'zod/v4';
import {timestampSchema} from './common.schemas';

// Store schemas
export const StoreSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  name: z.string(),
  code: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  isActive: z.boolean(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const CreateStoreRequestSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  address: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().min(1).max(100),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phoneNumber: z.string().max(50).optional(),
  email: z.string().email().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CreateStoreResponseSchema = z.object({
  store: StoreSchema,
});

export const UpdateStoreRequestSchema = z.object({
  isActive: z.boolean().optional(),
});

export const UpdateStoreResponseSchema = z.object({
  store: StoreSchema,
});

export const GetStoresRequestSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  sortBy: z
    .enum(['createdAt', 'name', 'code', 'city'])
    .default('createdAt')
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  name: z.string().optional(),
  code: z.string().optional(),
  city: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const GetStoresResponseSchema = z.object({
  stores: z.array(StoreSchema),
  pagination: z.object({
    limit: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
    nextCursor: z.string().optional(),
    prevCursor: z.string().optional(),
  }),
});

export const DeleteStoreResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
});

// Store Staff schemas
export const StoreStaffSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  fullName: z.string(),
  isActive: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const CreateStoreStaffRequestSchema = z.object({
  fullName: z.string().min(1).max(100),
});

export const CreateStoreStaffResponseSchema = StoreStaffSchema;

export const GetStoreStaffResponseSchema = z.object({
  staff: z.array(StoreStaffSchema),
});

export const UpdateStoreStaffRequestSchema = z.object({
  isActive: z.boolean().optional(),
});

export const UpdateStoreStaffResponseSchema = StoreStaffSchema;

export const DeleteStoreStaffResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
});

// Store Operating Hours schemas
export const StoreOperatingHoursSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  dayOfWeek: z.number().min(0).max(6), // 0=Sunday, 6=Saturday
  openTime: z.string(),
  closeTime: z.string(),
  isClosed: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const StoreOperatingHoursRequestSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string(),
  closeTime: z.string(),
  isClosed: z.boolean(),
});

export const GetStoreOperatingHoursResponseSchema = z.array(
  StoreOperatingHoursSchema,
);

export const UpdateStoreOperatingHoursRequestSchema = z.array(
  StoreOperatingHoursRequestSchema,
);

export const UpdateStoreOperatingHoursResponseSchema = z.array(
  StoreOperatingHoursSchema,
);

// Type exports
export type Store = z.infer<typeof StoreSchema>;
export type CreateStoreRequest = z.infer<typeof CreateStoreRequestSchema>;
export type CreateStoreResponse = z.infer<typeof CreateStoreResponseSchema>;
export type UpdateStoreRequest = z.infer<typeof UpdateStoreRequestSchema>;
export type UpdateStoreResponse = z.infer<typeof UpdateStoreResponseSchema>;
export type GetStoresRequest = z.infer<typeof GetStoresRequestSchema>;
export type GetStoresResponse = z.infer<typeof GetStoresResponseSchema>;
export type DeleteStoreResponse = z.infer<typeof DeleteStoreResponseSchema>;

export type StoreStaff = z.infer<typeof StoreStaffSchema>;
export type CreateStoreStaffRequest = z.infer<
  typeof CreateStoreStaffRequestSchema
>;
export type CreateStoreStaffResponse = z.infer<
  typeof CreateStoreStaffResponseSchema
>;
export type GetStoreStaffResponse = z.infer<typeof GetStoreStaffResponseSchema>;
export type UpdateStoreStaffRequest = z.infer<
  typeof UpdateStoreStaffRequestSchema
>;
export type UpdateStoreStaffResponse = z.infer<
  typeof UpdateStoreStaffResponseSchema
>;
export type DeleteStoreStaffResponse = z.infer<
  typeof DeleteStoreStaffResponseSchema
>;

export type StoreOperatingHours = z.infer<typeof StoreOperatingHoursSchema>;
export type StoreOperatingHoursRequest = z.infer<
  typeof StoreOperatingHoursRequestSchema
>;
export type GetStoreOperatingHoursResponse = z.infer<
  typeof GetStoreOperatingHoursResponseSchema
>;
export type UpdateStoreOperatingHoursRequest = z.infer<
  typeof UpdateStoreOperatingHoursRequestSchema
>;
export type UpdateStoreOperatingHoursResponse = z.infer<
  typeof UpdateStoreOperatingHoursResponseSchema
>;
