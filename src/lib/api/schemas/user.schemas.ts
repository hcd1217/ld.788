import * as z from 'zod/v4';

import { booleanSchema, idSchema, optionalStringSchema } from './common.schemas';

export const GetUsersRequestSchema = z.object({
  cursor: optionalStringSchema,
  limit: z.number().optional(),
  search: optionalStringSchema,
  role: optionalStringSchema,
  status: optionalStringSchema,
  sortBy: optionalStringSchema,
  sortOrder: optionalStringSchema,
});

export const GetUsersResponseSchema = z.object({
  data: z.object({
    users: z.array(
      z.object({
        id: idSchema,
        userName: optionalStringSchema,
        email: optionalStringSchema,
        isRoot: z.boolean().optional(),
        firstName: optionalStringSchema,
        lastName: optionalStringSchema,
      }),
    ),
    pagination: z.object({
      limit: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  }),
});

export const GetMagicLinkResponseSchema = z.object({
  magicToken: z.string(),
});

export const RevokeSessionsResponseSchema = z.object({
  success: booleanSchema,
});

export type GetUsersRequest = z.infer<typeof GetUsersRequestSchema>;

export type GetUsersResponse = z.infer<typeof GetUsersResponseSchema>;

export type GetMagicLinkResponse = z.infer<typeof GetMagicLinkResponseSchema>;

export type RevokeSessionsResponse = z.infer<typeof RevokeSessionsResponseSchema>;
