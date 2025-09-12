import * as z from 'zod/v4';

import { type ClientPublicConfigSchema, idSchema } from './common.schemas';

export const SetPasswordForUserRequestSchema = z.object({
  userId: idSchema,
  password: z.string(),
});

export type ClientPublicConfigResponse = z.infer<typeof ClientPublicConfigSchema>;
export type SetPasswordForUserRequest = z.infer<typeof SetPasswordForUserRequestSchema>;
