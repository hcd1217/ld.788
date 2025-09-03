import * as z from 'zod/v4';
import {
  emailSchema,
  idSchema,
  numberSchema,
  optionalStringSchema,
  paginationSchema,
  stringSchema,
  timestampSchema,
  backendPhoneNumberSchema,
  phoneNumberSchema,
} from './common.schemas';

// Department schema
export const UnitSchema = z.object({
  id: idSchema,
  name: stringSchema,
});

// Position schema
export const PositionSchema = z.object({
  id: idSchema,
  title: stringSchema,
  departmentId: idSchema.optional(),
  code: stringSchema,
});

// Employee schema
export const EmployeeSchema = z.object({
  id: stringSchema,
  userId: idSchema,
  firstName: stringSchema,
  lastName: stringSchema,
  employeeCode: stringSchema,
  email: emailSchema.optional(),
  phoneNumber: phoneNumberSchema,
  employmentType: z
    .enum(['FULL_TIME', 'PART_TIME'])
    .optional()
    .transform((val) => val ?? 'FULL_TIME'),
  hireDate: timestampSchema,
  terminationDate: timestampSchema.optional(),
  departmentId: idSchema.optional(),
  positionId: idSchema.optional(),
  isActive: z.boolean(),
  metadata: z
    .looseObject({
      displayOrder: numberSchema.optional(),
      hourRate: numberSchema.optional(),
      monthlySalary: numberSchema.optional(),
    })
    .optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const DepartmentSchema = z.object({
  id: idSchema,
  name: stringSchema,
  code: stringSchema,
});

// Request schemas
export const CreateEmployeeSchema = z.object({
  firstName: stringSchema,
  lastName: stringSchema,
  email: emailSchema.optional(),
  phoneNumber: backendPhoneNumberSchema,
  employeeCode: optionalStringSchema,
  employmentType: z
    .enum(['FULL_TIME', 'PART_TIME'])
    .optional()
    .transform((val) => val ?? 'FULL_TIME'),
  metadata: z
    .object({
      displayOrder: numberSchema.optional(),
      hourRate: numberSchema.optional(),
      monthlySalary: numberSchema.optional(),
    })
    .optional(),
  departmentId: z.string().optional(),
});

export const CreateEmployeesRequestSchema = CreateEmployeeSchema;
export const CreateBulkEmployeesRequestSchema = z.object({
  employees: CreateEmployeeSchema.array(),
});

export const UpdateEmployeeRequestSchema = z.object({
  firstName: stringSchema,
  lastName: stringSchema,
  departmentId: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME']).optional(),
  email: emailSchema.optional(),
  phoneNumber: backendPhoneNumberSchema,
  hireDate: stringSchema.optional(),
  terminationDate: stringSchema.optional(),
  metadata: z
    .object({
      displayOrder: numberSchema.optional(),
      hourRate: numberSchema.optional(),
      monthlySalary: numberSchema.optional(),
    })
    .optional(),
});

// Response schemas
export const GetEmployeesResponseSchema = z.object({
  employees: z.array(EmployeeSchema),
  pagination: paginationSchema,
});

export const GetUnitsResponseSchema = z.object({
  departments: z.array(UnitSchema),
  pagination: paginationSchema,
});

export const GetPositionsResponseSchema = z.object({
  positions: z.array(PositionSchema),
  pagination: paginationSchema,
});

export const CreateEmployeesResponseSchema = EmployeeSchema;

export const UpdateEmployeeResponseSchema = EmployeeSchema;

// Type exports
export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;
export type CreateEmployeesRequest = z.infer<typeof CreateEmployeesRequestSchema>;
export type CreateBulkEmployeesRequest = z.infer<typeof CreateBulkEmployeesRequestSchema>;
export type UpdateEmployeeRequest = z.infer<typeof UpdateEmployeeRequestSchema>;
export type GetEmployeesResponse = z.infer<typeof GetEmployeesResponseSchema>;
export type GetUnitsResponse = z.infer<typeof GetUnitsResponseSchema>;
export type GetPositionsResponse = z.infer<typeof GetPositionsResponseSchema>;
export type CreateEmployeesResponse = z.infer<typeof CreateEmployeesResponseSchema>;
export type UpdateEmployeeResponse = z.infer<typeof UpdateEmployeeResponseSchema>;
