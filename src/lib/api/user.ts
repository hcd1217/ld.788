import * as z from 'zod/v4';
import {BaseApiClient} from './base';

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
        userName: z.string().nullable(),
        email: z.string().nullable(),
        isRoot: z.boolean().optional(),
        firstName: z.string().nullable(),
        lastName: z.string().nullable(),
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

export class UserApi extends BaseApiClient {
  async getUsers(params?: GetUsersRequest): Promise<GetUsersResponse> {
    return this.get(
      '/users',
      params,
      GetUsersResponseSchema,
      GetUsersRequestSchema,
    );
  }
}
