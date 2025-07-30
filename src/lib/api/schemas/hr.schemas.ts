import * as z from 'zod/v4';
import {
  idSchema,
  paginationSchema,
  stringSchema,
  timestampSchema,
} from './common.schemas';

// Department schema
export const DepartmentSchema = z.object({
  id: idSchema,
  name: stringSchema,
});

// Employee schema
export const EmployeeSchema = z.object({
  id: stringSchema,
  firstName: stringSchema,
  lastName: stringSchema,
  employeeCode: stringSchema,
  departmentId: idSchema.optional(),
  isActive: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Request schemas
export const CreateEmployeeSchema = z.object({
  firstName: stringSchema,
  lastName: stringSchema,
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
  isActive: z.boolean().optional(),
});

// Response schemas
export const GetEmployeesResponseSchema = z.object({
  employees: z.array(EmployeeSchema),
  pagination: paginationSchema,
});

export const GetDepartmentsResponseSchema = z.object({
  departments: z.array(DepartmentSchema),
  pagination: paginationSchema,
});

export const CreateEmployeesResponseSchema = EmployeeSchema;

export const UpdateEmployeeResponseSchema = EmployeeSchema;

// Type exports
export type Employee = z.infer<typeof EmployeeSchema>;
export type Department = z.infer<typeof DepartmentSchema>;
export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;
export type CreateEmployeesRequest = z.infer<
  typeof CreateEmployeesRequestSchema
>;
export type CreateBulkEmployeesRequest = z.infer<
  typeof CreateBulkEmployeesRequestSchema
>;
export type UpdateEmployeeRequest = z.infer<typeof UpdateEmployeeRequestSchema>;
export type GetEmployeesResponse = z.infer<typeof GetEmployeesResponseSchema>;
export type GetDepartmentsResponse = z.infer<
  typeof GetDepartmentsResponseSchema
>;
export type CreateEmployeesResponse = z.infer<
  typeof CreateEmployeesResponseSchema
>;
export type UpdateEmployeeResponse = z.infer<
  typeof UpdateEmployeeResponseSchema
>;
