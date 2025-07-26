import * as z from 'zod/v4';
import {
  emailSchema,
  idSchema,
  optionalStringSchema,
  paginationSchema,
  timestampSchema,
} from './common.schemas';
import {generateRandomString} from '@/utils/string';
import {permissionMatrix} from '@/services/staff';

// Store schemas
export const StoreSchema = z.object({
  id: idSchema,
  clientId: idSchema,
  name: z.string(),
  code: z.string(),
  address: z.string(),
  city: z.string(),
  state: optionalStringSchema,
  postalCode: optionalStringSchema,
  country: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phoneNumber: optionalStringSchema,
  email: emailSchema.optional(),
  isActive: z.boolean(),
  metadata: z.record(z.string(), z.any()).optional(),
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
  email: emailSchema.optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  operatingHours: z
    .array(
      z.object({
        dayOfWeek: z.number().min(0).max(6),
        openTime: z.string(),
        closeTime: z.string(),
        isClosed: z.boolean(),
      }),
    )
    .optional(),
});

export const CreateStoreResponseSchema = StoreSchema;

export const UpdateStoreRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(20).optional(),
  address: z.string().min(1).max(200).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().min(1).max(100).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phoneNumber: z.string().max(50).optional(),
  email: emailSchema.optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const UpdateStoreResponseSchema = z.object({
  store: StoreSchema,
});

export const GetStoresResponseSchema = z.object({
  stores: z.array(StoreSchema),
  pagination: paginationSchema,
});

// Store Staff schemas
export const StoreStaffSchema = z
  .object({
    id: idSchema,
    storeId: idSchema,
    fullName: z.string(),
    isActive: z.boolean(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
  })
  .transform((val) => {
    const roles = Object.keys(permissionMatrix);
    const role = roles[Math.floor(roles.length * Math.random())];
    return {
      ...val,
      email: `${generateRandomString(4)}.${Date.now()}@example.com`,
      phoneNumber: '+84938765432',
      clockInUrl: 'https://app.credo.com/clock-in/',
      clockInQrCode: '',
      workingPattern: 'fulltime',
      weeklyContractedHours: 40,
      defaultWeeklyHours: 40,
      hourlyRate: 28,
      overtimeRate: 42,
      holidayRate: 56,
      bookableLeaveDays: 20,
      leaveBalance: {
        vacation: 18,
        sick: 2,
        other: 0,
      },
      carryOverDays: 5,
      role,
      accessPermissions:
        permissionMatrix[role as keyof typeof permissionMatrix],
      status: val.isActive ? 'active' : 'inactive',
    };
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
  id: idSchema,
  storeId: idSchema,
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
export type GetStoresResponse = z.infer<typeof GetStoresResponseSchema>;

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
