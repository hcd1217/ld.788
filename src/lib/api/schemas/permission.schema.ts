import * as z from 'zod/v4';

import { booleanSchema } from './common.schemas';

// Base permission schema
const BasePermissionSchema = z.object({
  canView: booleanSchema,
  canCreate: booleanSchema,
  canEdit: booleanSchema,
  canDelete: booleanSchema,
});

// Customer permission schema
const CustomerPermissionSchema = BasePermissionSchema;

// Product permission schema
const ProductPermissionSchema = BasePermissionSchema;

// Employee permission schema
const EmployeePermissionSchema = BasePermissionSchema.extend({
  actions: z.object({
    canIssueMagicLink: booleanSchema,
    canSetPassword: booleanSchema,
  }),
});

// Purchase Order permission schema
const PurchaseOrderPermissionSchema = BasePermissionSchema.extend({
  query: z.object({
    canFilter: booleanSchema,
    canViewAll: booleanSchema,
  }),
  actions: z.object({
    canConfirm: booleanSchema,
    canTakePhoto: booleanSchema,
    canDeletePhoto: booleanSchema,
    canProcess: booleanSchema,
    canMarkReady: booleanSchema,
    canShip: booleanSchema,
    canDeliver: booleanSchema,
    canRefund: booleanSchema,
    canCancel: booleanSchema,
  }),
});

// Delivery Request permission schema
const DeliveryRequestPermissionSchema = BasePermissionSchema.extend({
  query: z.object({
    canFilter: booleanSchema,
    canViewAll: booleanSchema,
  }),
  actions: z.object({
    canUpdateDeliveryOrderInDay: booleanSchema,
    canStartTransit: booleanSchema,
    canComplete: booleanSchema,
    canTakePhoto: booleanSchema,
    canDeletePhoto: booleanSchema,
  }),
});

export const VendorPermissionSchema = BasePermissionSchema;

// Complete UserPermission schema
export const PermissionSchema = z.object({
  customer: CustomerPermissionSchema,
  product: ProductPermissionSchema,
  employee: EmployeePermissionSchema,
  purchaseOrder: PurchaseOrderPermissionSchema,
  deliveryRequest: DeliveryRequestPermissionSchema,
  vendor: VendorPermissionSchema,
});

// Types
export type Permission = z.infer<typeof PermissionSchema>;
