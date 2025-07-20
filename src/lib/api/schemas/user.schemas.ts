import * as z from 'zod/v4';

export const GetUsersRequestSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
});

export const GetUsersResponseSchema = z.object({
  data: z.object({
    users: z.array(
      z.object({
        id: z.string(),
        userName: z.string().optional(),
        email: z.string().optional(),
        isRoot: z.boolean().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      }),
    ),
    pagination: z.object({
      limit: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  }),
});

export type GetUsersRequest = z.infer<typeof GetUsersRequestSchema>;

export type GetUsersResponse = z.infer<typeof GetUsersResponseSchema>;
