import z from 'zod';
import {BaseApiClient} from './base';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&()^])[A-Za-z\d@#$!%*?&()^]{8,}$/;
const passwordSchema = z.string().regex(passwordRegex);
const emailSchema = z.email();

export const RegisterClientRequestSchema = z.object({
  name: z.string(),
  code: z.string(),
  email: z.email(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

export const RegisterClientResponseSchema = z.object({
  client: z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
  }),
  rootUser: z.object({
    id: z.string(),
    email: z.email(),
    firstName: z.string(),
    lastName: z.string(),
  }),
});

export const RegisterUserByRootUserRequestSchema = z.object({
  email: emailSchema.optional(),
  userName: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  password: passwordSchema,
});

export const RegisterUserByRootUserResponseSchema = z.object({
  id: z.string(),
});

export const RegisterBulkUsersByRootUserRequestSchema = z.array(
  RegisterUserByRootUserRequestSchema,
);

export const RegisterBulkUsersByRootUserResponseSchema = z.object({
  summary: z.object({
    total: z.number(),
    success: z.number(),
    failed: z.number(),
  }),
  success: z.array(
    z.object({
      id: z.string(),
      email: z.string().optional(),
      userName: z.string().optional(),
      firstName: z.string(),
      lastName: z.string(),
      password: z.string().optional(),
    }),
  ),
  failed: z.array(
    z.object({
      user: RegisterUserByRootUserRequestSchema,
      error: z.string(),
    }),
  ),
});

export type RegisterClientRequest = z.infer<typeof RegisterClientRequestSchema>;
export type RegisterClientResponse = z.infer<
  typeof RegisterClientResponseSchema
>;

export type RegisterUserByRootUserRequest = z.infer<
  typeof RegisterUserByRootUserRequestSchema
>;
export type RegisterUserByRootUserResponse = z.infer<
  typeof RegisterUserByRootUserResponseSchema
>;

export type RegisterBulkUsersByRootUserRequest = z.infer<
  typeof RegisterBulkUsersByRootUserRequestSchema
>;
export type RegisterBulkUsersByRootUserResponse = z.infer<
  typeof RegisterBulkUsersByRootUserResponseSchema
>;

export class ClientApi extends BaseApiClient {
  async register(data: RegisterClientRequest): Promise<RegisterClientResponse> {
    return this.post<RegisterClientResponse, RegisterClientRequest>(
      '/clients/register',
      data,
      RegisterClientResponseSchema,
      RegisterClientRequestSchema,
    );
  }

  async registerUserByRootUser(
    data: RegisterUserByRootUserRequest,
  ): Promise<RegisterUserByRootUserResponse> {
    return this.post<
      RegisterUserByRootUserResponse,
      RegisterUserByRootUserRequest
    >(
      '/clients/user/register',
      data,
      RegisterUserByRootUserResponseSchema,
      RegisterUserByRootUserRequestSchema,
    );
  }

  async registerBulkUsersByRootUser(
    data: RegisterBulkUsersByRootUserRequest,
  ): Promise<RegisterBulkUsersByRootUserResponse> {
    return this.post<
      RegisterBulkUsersByRootUserResponse,
      RegisterBulkUsersByRootUserRequest
    >(
      '/clients/user/register/bulk',
      data,
      RegisterBulkUsersByRootUserResponseSchema,
      RegisterBulkUsersByRootUserRequestSchema,
    );
  }
}
