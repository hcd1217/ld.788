import * as z from 'zod/v4';
import { idSchema, timestampSchema } from './common.schemas';
import { generateRandomString } from '@/utils/string';
import { permissionMatrix } from '@/services/staff';

// Base staff schema from API
export const StaffSchema = z
  .object({
    id: idSchema,
    storeId: idSchema,
    fullName: z.string(),
    isActive: z.boolean(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
  })
  .transform((val) => {
    // Generate random role
    const roles = Object.keys(permissionMatrix);
    const role = roles[Math.floor(roles.length * Math.random())] as keyof typeof permissionMatrix;

    // Generate random working pattern
    const workingPattern: 'fulltime' | 'shift' = Math.random() > 0.5 ? 'fulltime' : 'shift';

    // Transform to include all UI fields with mock data
    return {
      ...val,
      email: `${generateRandomString(4)}.${Date.now()}@example.com`,
      phoneNumber: '+84938765432',
      clockInUrl: 'https://app.credo.com/clock-in/',
      clockInQrCode: '',
      workingPattern,
      weeklyContractedHours: workingPattern === 'fulltime' ? 40 : 32,
      defaultWeeklyHours: workingPattern === 'fulltime' ? 40 : undefined,
      hourlyRate: 28,
      overtimeRate: 42,
      holidayRate: 56,
      bookableLeaveDays: 20,
      leaveHoursEquivalent: 8,
      leaveBalance: {
        vacation: 18,
        sick: 2,
        other: 0,
      },
      carryOverDays: 5,
      role,
      accessPermissions: permissionMatrix[role],
      status: val.isActive ? ('active' as const) : ('inactive' as const),
    };
  });

// Create staff request - API only accepts fullName
export const CreateStaffRequestSchema = z.object({
  fullName: z.string().min(1).max(100),
});

export const CreateStaffResponseSchema = StaffSchema;

// Update staff request - API only accepts isActive
export const UpdateStaffRequestSchema = z.object({
  isActive: z.boolean(),
});

export const UpdateStaffResponseSchema = z.object({
  staff: StaffSchema,
});

// Get staff list response
export const GetStaffListResponseSchema = z.object({
  staffs: z.array(StaffSchema),
});

// Delete staff response
export const DeleteStaffResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
});

// Type exports
export type Staff = z.infer<typeof StaffSchema>;
export type CreateStaffRequest = z.infer<typeof CreateStaffRequestSchema>;
export type CreateStaffResponse = z.infer<typeof CreateStaffResponseSchema>;
export type UpdateStaffRequest = z.infer<typeof UpdateStaffRequestSchema>;
export type UpdateStaffResponse = z.infer<typeof UpdateStaffResponseSchema>;
export type GetStaffListResponse = z.infer<typeof GetStaffListResponseSchema>;
export type DeleteStaffResponse = z.infer<typeof DeleteStaffResponseSchema>;

// UI types for forms (includes all fields but only sends supported ones to API)
export type StaffFormData = Omit<Staff, 'id' | 'storeId' | 'createdAt' | 'updatedAt'>;

// Form initial values type (partial for form initialization)
export type StaffFormInitialValues = Pick<
  StaffFormData,
  | 'fullName'
  | 'email'
  | 'phoneNumber'
  | 'workingPattern'
  | 'weeklyContractedHours'
  | 'defaultWeeklyHours'
  | 'hourlyRate'
  | 'overtimeRate'
  | 'holidayRate'
  | 'bookableLeaveDays'
  | 'leaveHoursEquivalent'
  | 'leaveBalance'
  | 'carryOverDays'
  | 'role'
>;
