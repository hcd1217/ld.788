import * as z from 'zod/v4';

import { idSchema, timestampSchema } from './common.schemas';

// Chat types enum
export const ChatTypeSchema = z.enum(['PO', 'DR']);

// Message schema
export const MessageSchema = z.object({
  id: idSchema,
  chatId: idSchema,
  userId: idSchema,
  content: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Chat schema
export const ChatSchema = z.object({
  id: idSchema,
  type: ChatTypeSchema,
  targetId: idSchema,
  createdAt: timestampSchema,
});

// Get Chat History Request Schema
export const GetChatHistoryRequestSchema = z.object({
  type: ChatTypeSchema,
  targetId: idSchema,
});

// Get Chat History Response Schema
export const GetChatHistoryResponseSchema = z.object({
  // chat: ChatSchema.nullable(),
  messages: z.array(MessageSchema),
  total: z.number(),
});

// Send Message Request Schema
export const SendMessageRequestSchema = z.object({
  type: ChatTypeSchema,
  targetId: idSchema,
  content: z.string(),
});

// Send Message Response Schema
export const SendMessageResponseSchema = MessageSchema;

// Type exports
export type ChatType = z.infer<typeof ChatTypeSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Chat = z.infer<typeof ChatSchema>;
export type GetChatHistoryRequest = z.infer<typeof GetChatHistoryRequestSchema>;
export type GetChatHistoryResponse = z.infer<typeof GetChatHistoryResponseSchema>;
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>;
