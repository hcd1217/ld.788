import * as z from 'zod/v4';

import {
  booleanSchema,
  ClientPublicConfigSchema,
  dictionarySchema,
  idSchema,
  optionalBooleanSchema,
} from './common.schemas';
import {
  DEFAULT_MOBILE_NAVIGATION_CONFIG,
  DEFAULT_NAVIGATION_CONFIG,
  NavigationItemSchema,
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
  publicConfig: ClientPublicConfigSchema,
  features: z
    .object({
      apiCall: z
        .object({
          delay: z.number(),
        })
        .partial(),
      deliveryRequest: z
        .object({
          assigneeIds: z.array(idSchema),
        })
        .partial(),
      purchaseOrder: z
        .object({
          assigneeIds: z.array(idSchema),
        })
        .partial(),
      employee: z
        .object({
          workType: booleanSchema,
          forceSetPasswordOnFirstLogin: optionalBooleanSchema,
        })
        .partial(),
      customer: z
        .object({
          noTaxCode: optionalBooleanSchema,
          noEmail: optionalBooleanSchema,
        })
        .partial(),
      vendor: z
        .object({
          noTaxCode: optionalBooleanSchema,
          noEmail: optionalBooleanSchema,
        })
        .partial(),
    })
    .partial()
    .optional(),
});

// Types derived from schemas
export type ClientConfig = z.infer<typeof ClientConfigSchema>;
