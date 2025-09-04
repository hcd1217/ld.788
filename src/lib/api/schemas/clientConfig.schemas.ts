import * as z from 'zod/v4';
import { ClientPublicConfigSchema, dictionarySchema } from './common.schemas';
import {
  NavigationItemSchema,
  DEFAULT_NAVIGATION_CONFIG,
  DEFAULT_MOBILE_NAVIGATION_CONFIG,
} from './navigation.schemas';
// Import is handled by re-export below

// Re-export types from navigation and route config
export type { NavigationItem, NavigationItemType } from './navigation.schemas';

// Schema for client config
export const ClientConfigSchema = z.object({
  translations: dictionarySchema.optional(),
  navigation: z.array(NavigationItemSchema).optional().default(DEFAULT_NAVIGATION_CONFIG), // Backend-driven navigation
  mobileNavigation: z
    .array(NavigationItemSchema)
    .optional()
    .default(DEFAULT_MOBILE_NAVIGATION_CONFIG), // Backend-driven mobile navigation
  ...ClientPublicConfigSchema.shape,
});

// Types derived from schemas
export type ClientConfig = z.infer<typeof ClientConfigSchema>;
