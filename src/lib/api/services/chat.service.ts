import { BaseApiClient } from '../base';
import {
  type GetChatHistoryRequest,
  GetChatHistoryRequestSchema,
  type GetChatHistoryResponse,
  GetChatHistoryResponseSchema,
  type SendMessageRequest,
  SendMessageRequestSchema,
  type SendMessageResponse,
  SendMessageResponseSchema,
} from '../schemas/chat.schemas';

export class ChatApi extends BaseApiClient {
  /**
   * Get chat history with all messages for a specific target
   *
   * @param type - Chat type: "PO" or "DR"
   * @param targetId - Target ID (PO ID or DR ID based on type)
   * @returns Chat history with messages
   */
  async getChatHistory({ type, targetId }: GetChatHistoryRequest): Promise<GetChatHistoryResponse> {
    return this.get(
      `/api/chat/${type}/${targetId}`,
      undefined,
      GetChatHistoryResponseSchema,
      GetChatHistoryRequestSchema,
    );
  }

  /**
   * Send a message to a chat. Auto-creates chat if it doesn't exist.
   *
   * @param data - Message data including type, targetId, content, and optional metadata
   * @returns Created message with chatId and timestamps
   */
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    return this.post(
      '/api/chat/messages',
      data,
      SendMessageResponseSchema,
      SendMessageRequestSchema,
    );
  }
}
