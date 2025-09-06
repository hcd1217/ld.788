import * as z from 'zod/v4';
import { type ClientPublicConfigSchema } from './common.schemas';

export type ClientPublicConfigResponse = z.infer<typeof ClientPublicConfigSchema>;
