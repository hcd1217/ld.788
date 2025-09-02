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
import { isDevelopment } from '@/utils/env';

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

const PermissionSchema = z
  .object({
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
        return {
          ...val,
          actions: {
            canStartTransit: val.canEdit,
            canComplete: val.canEdit,
            canTakePhoto: val.canEdit,
          },
        };
      }),
  })
  .transform((val) => {
    const debug = false;
    if (debug && isDevelopment) {
      return {
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
            canRefund: true,
            canCancel: true,
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
        customer: {
          canView: true,
          canCreate: false,
          canEdit: false,
          canDelete: false,
        },
        product: {
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: false,
        },
        employee: {
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
        },
      } satisfies typeof val;
    }
    return val;
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
    roles: z.array(RoleSchema),
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
