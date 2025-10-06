import * as z from 'zod/v4';

import {
  booleanSchema,
  idSchema,
  numberSchema,
  optionalBooleanSchema,
  optionalStringSchema,
  stringSchema,
} from './common.schemas';

// Employee overview schema
export const EmployeeOverviewSchema = z.object({
  id: idSchema.describe('Employee ID'),
  userId: z.unknown().nullable().describe('Associated user ID'),
  firstName: stringSchema.describe('Employee first name'),
  lastName: stringSchema.describe('Employee last name'),
  departmentId: idSchema.optional().describe('Department ID'),
  departmentName: stringSchema.optional().describe('Department name'),
  employeeCode: optionalStringSchema.describe('Employee code'),
});

// Department overview schema
export const DepartmentOverviewSchema = z.object({
  id: idSchema.describe('Department ID'),
  name: stringSchema.describe('Department name'),
  code: stringSchema.describe('Department code'),
});

// Product overview schema
export const ProductOverviewSchema = z.object({
  id: idSchema.describe('Product ID'),
  name: stringSchema.describe('Product name'),
  code: stringSchema.describe('Product code'),
  unit: stringSchema.describe('Product unit'),
  isActive: optionalBooleanSchema.describe('Product is active'),
});

export const CustomerOverviewSchema = z.object({
  id: idSchema.describe('Customer ID'),
  name: stringSchema.describe('Customer name'),
  isActive: booleanSchema.describe('Customer is active'),
  address: optionalStringSchema.describe('Customer address'),
  deliveryAddress: optionalStringSchema.describe('Customer delivery address'),
  pic: optionalStringSchema.describe('Customer PIC'),
  phone: optionalStringSchema.describe('Customer phone'),
  email: optionalStringSchema.describe('Customer email'),
  googleMapsUrl: optionalStringSchema.describe('Google Maps URL'),
});

export const VendorOverviewSchema = z.object({
  id: idSchema.describe('Vendor ID'),
  name: stringSchema.describe('Vendor name'),
  isActive: booleanSchema.describe('Customer is active'),
  address: optionalStringSchema.describe('Vendor address'),
  googleMapsUrl: optionalStringSchema.describe('Google Maps URL'),
});

// Combined overview response schema
export const CombinedOverviewSchema = z.object({
  employees: z.array(EmployeeOverviewSchema).describe('List of employees'),
  departments: z.array(DepartmentOverviewSchema).describe('List of departments'),
  products: z.array(ProductOverviewSchema).describe('List of products'),
  customers: z.array(CustomerOverviewSchema).describe('List of customers'),
  vendors: z.array(VendorOverviewSchema).describe('List of vendors'),
});

// Request params schema
export const OverviewParamsSchema = z.object({
  limit: numberSchema.min(1).max(1000).default(50).optional().describe('Number of items to return'),
  offset: numberSchema.min(0).default(0).optional().describe('Number of items to skip'),
});

// Type exports
export type EmployeeOverview = z.infer<typeof EmployeeOverviewSchema>;
export type DepartmentOverview = z.infer<typeof DepartmentOverviewSchema>;
export type ProductOverview = z.infer<typeof ProductOverviewSchema>;
export type CustomerOverview = z.infer<typeof CustomerOverviewSchema>;
export type VendorOverview = z.infer<typeof VendorOverviewSchema>;
export type CombinedOverview = z.infer<typeof CombinedOverviewSchema>;
export type OverviewParams = z.infer<typeof OverviewParamsSchema>;
