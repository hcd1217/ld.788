import { z } from 'zod/v4';

// Request schemas
export const UploadUrlRequestSchema = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  purpose: z.enum(['DELIVERY_REQUEST_PHOTO', 'PURCHASE_ORDER_PHOTO', 'PURCHASE_ORDER_ATTACHMENT']),
  prefix: z.string().optional(),
});

// Response schemas - follow the API response pattern from your sample
export const UploadUrlResponseSchema = z.object({
  uploadUrl: z.url(),
  fileUrl: z.url(),
  expiresIn: z.number(),
  key: z.string(),
});

// Export types
export type UploadUrlRequest = z.infer<typeof UploadUrlRequestSchema>;
export type UploadUrlResponse = z.infer<typeof UploadUrlResponseSchema>;
