import z from 'zod';
import {BaseApiClient} from './base';

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

export type RegisterClientRequest = z.infer<typeof RegisterClientRequestSchema>;
export type RegisterClientResponse = z.infer<
  typeof RegisterClientResponseSchema
>;

export class ClientApi extends BaseApiClient {
  async register(data: RegisterClientRequest): Promise<RegisterClientResponse> {
    const validatedData = RegisterClientRequestSchema.parse(data);
    return this.post<RegisterClientResponse>(
      '/clients/register',
      validatedData,
      RegisterClientResponseSchema,
    );
  }
}
