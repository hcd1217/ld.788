import * as z from 'zod/v4';
import {
  booleanSchema,
  emailSchema,
  idSchema,
  jwtTokenSchema,
  numberSchema,
  optionalBooleanSchema,
  optionalStringSchema,
  passwordSchema,
  stringSchema,
} from './common.schemas';
import { ClientConfigSchema } from './clientConfig.schemas';
import { DepartmentSchema, EmployeeSchema } from './hr.schemas';
import { renderFullName } from '@/utils/string';
import { isDebug } from '@/utils/env';
import { STORAGE_KEYS } from '@/utils/storageKeys';

// Schemas
export const LoginRequestSchema = z.object({
  identifier: stringSchema,
  password: passwordSchema,
  clientCode: z.string().min(2),
});

export const LoginResponseSchema = z.object({
  accessToken: jwtTokenSchema,
  refreshToken: jwtTokenSchema,
});

export const VerifyMagicLinkRequestSchema = z.object({
  token: stringSchema,
});

export const VerifyMagicLinkResponseSchema = z.object({
  accessToken: jwtTokenSchema,
  refreshToken: jwtTokenSchema,
});

export const RenewTokenRequestSchema = z.object({
  refreshToken: jwtTokenSchema,
});

export const RenewTokenResponseSchema = z.object({
  accessToken: jwtTokenSchema,
  refreshToken: jwtTokenSchema,
});

export const JWTPayloadSchema = z.object({
  sub: stringSchema,
  clientId: stringSchema,
  sessionId: stringSchema,
  iat: numberSchema,
  exp: numberSchema,
});

// Schema for role object
export const RoleSchema = z.object({
  name: stringSchema,
  level: numberSchema,
});

const PermissionSchema = z.object({
  customer: z.object({
    canView: booleanSchema,
    canCreate: booleanSchema,
    canEdit: booleanSchema,
    canDelete: booleanSchema,
  }),
  product: z.object({
    canView: booleanSchema,
    canCreate: booleanSchema,
    canEdit: booleanSchema,
    canDelete: booleanSchema,
  }),
  employee: z.object({
    canView: booleanSchema,
    canCreate: booleanSchema,
    canEdit: booleanSchema,
    canDelete: booleanSchema,
  }),
  purchaseOrder: z.object({
    canView: booleanSchema,
    canCreate: booleanSchema,
    canEdit: booleanSchema,
    canDelete: booleanSchema,
    actions: z
      .object({
        canConfirm: optionalBooleanSchema,
        canProcess: optionalBooleanSchema,
        canShip: optionalBooleanSchema,
        canDeliver: optionalBooleanSchema,
        canMarkReady: optionalBooleanSchema,
        canRefund: optionalBooleanSchema,
        canCancel: optionalBooleanSchema,
      })
      .optional(),
  }),
  deliveryRequest: z
    .object({
      canView: booleanSchema,
      canCreate: booleanSchema,
      canEdit: booleanSchema,
      canDelete: booleanSchema,
      actions: z
        .object({
          canStartTransit: optionalBooleanSchema,
          canComplete: optionalBooleanSchema,
          canTakePhoto: optionalBooleanSchema,
        })
        .optional(),
    })
    .transform((val) => {
      if (!val.canEdit) {
        return val;
      }
      return {
        ...val,
        actions: {
          canStartTransit: val.canEdit ?? undefined,
          canComplete: val.canEdit ?? undefined,
          canTakePhoto: val.canEdit ?? undefined,
        },
      };
    }),
});

// Schema for GET /auth/me response
export const GetMeResponseSchema = z
  .object({
    id: idSchema,
    email: emailSchema.optional(),
    userName: optionalStringSchema,
    clientId: idSchema,
    clientCode: stringSchema,
    isRoot: booleanSchema,
    clientConfig: ClientConfigSchema.optional(),
    employee: EmployeeSchema.optional(),
    department: DepartmentSchema.optional(),
    permissions: PermissionSchema,
  })
  .transform((val) => {
    if (val.userName) {
      return val;
    }
    if (val.employee) {
      val.userName = renderFullName(val.employee);
      return val;
    }

    return {
      ...val,
      userName: 'User',
    };
  })
  .transform((val) => {
    if (!isDebug) {
      return val;
    }
    const role: DepartmentCode = localStorage.getItem(
      STORAGE_KEYS.DEBUG.CURRENT_ROLE,
    ) as DepartmentCode;
    if (!role) {
      return val;
    }
    val.permissions = fakePermission(role);
    val.isRoot = false;
    val.department = {
      id: role,
      code: role,
      name: 'Department',
    };
    return val;
  });

// Types derived from schemas
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type VerifyMagicLinkRequest = z.infer<typeof VerifyMagicLinkRequestSchema>;
export type VerifyMagicLinkResponse = z.infer<typeof VerifyMagicLinkResponseSchema>;
export type RenewTokenRequest = z.infer<typeof RenewTokenRequestSchema>;
export type RenewTokenResponse = z.infer<typeof RenewTokenResponseSchema>;
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type GetMeResponse = z.infer<typeof GetMeResponseSchema>;

type DepartmentCode = 'sales' | 'delivery' | 'warehouse' | 'accounting' | 'manager';
function fakePermission(code: DepartmentCode) {
  const basePermission = {
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  };

  function generateDefaultPermission(): GetMeResponse['permissions'] {
    return {
      customer: {
        ...basePermission,
      },
      product: {
        ...basePermission,
      },
      employee: {
        ...basePermission,
      },
      purchaseOrder: {
        ...basePermission,
        actions: {
          canConfirm: false,
          canProcess: false,
          canShip: false,
          canMarkReady: false,
          canDeliver: false,
          canCancel: false,
        },
      },
      deliveryRequest: {
        ...basePermission,
        actions: {
          canStartTransit: false,
          canComplete: false,
          canTakePhoto: false,
        },
      },
    };
  }

  const permissions = generateDefaultPermission();

  switch (code) {
    case 'manager': {
      return {
        customer: {
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
        },
        product: {
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
        },
        employee: {
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
        },
        purchaseOrder: {
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
          actions: {
            canConfirm: true,
            canProcess: true,
            canShip: true,
            canMarkReady: true,
            canDeliver: true,
            canCancel: true,
            canRefund: true,
          },
        },
        deliveryRequest: {
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
          actions: {
            canStartTransit: true,
            canComplete: true,
            canTakePhoto: true,
          },
        },
      };
    }
    case 'sales': {
      permissions.purchaseOrder = {
        ...permissions.purchaseOrder,
        canView: true,
        canCreate: true,
        canEdit: true,
        actions: {
          ...permissions.purchaseOrder.actions,
          canConfirm: true,
          canCancel: true,
        },
      };
      permissions.deliveryRequest = {
        ...permissions.deliveryRequest,
        canView: true,
      };
      return permissions;
    }
    case 'delivery': {
      permissions.deliveryRequest = {
        ...permissions.deliveryRequest,
        canView: true,
        actions: {
          canStartTransit: true,
          canComplete: true,
          canTakePhoto: true,
        },
      };
      return permissions;
    }
    case 'warehouse': {
      permissions.purchaseOrder = {
        ...permissions.purchaseOrder,
        canView: true,
        actions: {
          canProcess: true,
          canMarkReady: true,
          canDeliver: true,
          canShip: true,
        },
      };
      permissions.deliveryRequest = {
        ...permissions.deliveryRequest,
        canView: true,
        canCreate: true,
      };
      return permissions;
    }
    case 'accounting': {
      permissions.employee.canView = true;
      permissions.purchaseOrder = {
        ...permissions.purchaseOrder,
        canView: true,
        actions: {
          canRefund: true,
        },
      };
      permissions.deliveryRequest = {
        ...permissions.deliveryRequest,
        canView: true,
      };
      return permissions;
    }
    default: {
      return permissions;
    }
  }
}
