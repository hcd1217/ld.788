import * as z from 'zod/v4';

import { renderFullName } from '@/utils/string';

import { ClientConfigSchema } from './clientConfig.schemas';
import {
  booleanSchema,
  emailSchema,
  idSchema,
  jwtTokenSchema,
  numberSchema,
  optionalStringSchema,
  passwordSchema,
  stringSchema,
} from './common.schemas';
import { DepartmentSchema, EmployeeSchema } from './hr.schemas';

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
    actions: z
      .object({
        canSetPassword: booleanSchema,
      })
      .optional(),
  }),
  purchaseOrder: z.object({
    canView: booleanSchema,
    canCreate: booleanSchema,
    canEdit: booleanSchema,
    canDelete: booleanSchema,
    query: z.object({
      canFilter: booleanSchema,
      canViewAll: booleanSchema,
    }),
    actions: z.object({
      canConfirm: booleanSchema,
      canProcess: booleanSchema,
      canShip: booleanSchema,
      canDeliver: booleanSchema,
      canMarkReady: booleanSchema,
      canRefund: booleanSchema,
      canCancel: booleanSchema,
    }),
  }),
  deliveryRequest: z.object({
    canView: booleanSchema,
    canCreate: booleanSchema,
    canEdit: booleanSchema,
    canDelete: booleanSchema,
    query: z.object({
      canFilter: booleanSchema,
      canViewAll: booleanSchema,
    }),
    actions: z.object({
      canUpdateDeliveryOrderInDay: booleanSchema,
      canStartTransit: booleanSchema,
      canComplete: booleanSchema,
      canTakePhoto: booleanSchema,
    }),
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
    navigationOverrides: z
      .object({
        granted: z.array(stringSchema),
        denied: z.array(stringSchema),
      })
      .optional(),
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
