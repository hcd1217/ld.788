import { chatApi } from '@/lib/api';
import type {
  GetChatHistoryRequest,
  GetChatHistoryResponse,
  SendMessageRequest,
} from '@/lib/api/schemas/chat.schemas';

// Re-export types for compatibility
export type {
  ChatType,
  Chat,
  GetChatHistoryRequest,
  GetChatHistoryResponse,
  SendMessageRequest,
  SendMessageResponse,
} from '@/lib/api/schemas/chat.schemas';
import type { Message as ApiMessage } from '@/lib/api/schemas/chat.schemas';
import { overviewService } from '@/services/client/overview';

export type Message = ApiMessage & {
  sendBy: string;
};

export const chatService = {
  async getChatHistory({ type, targetId }: GetChatHistoryRequest): Promise<Message[]> {
    const response: GetChatHistoryResponse = await chatApi.getChatHistory({ type, targetId });
    const employee = await overviewService.getEmployeeOverview();
    const employeeMapByUserId = new Map([...employee.values()].map((el) => [el.userId, el]));

    return response.messages.map((el) => {
      const employee = employeeMapByUserId.get(el.userId);
      return {
        ...el,
        sendBy: employee?.fullName ?? '',
      };
    });
  },

  async sendMessage(data: SendMessageRequest): Promise<Message> {
    const message = await chatApi.sendMessage(data);
    const employee = await overviewService.getEmployeeOverview();
    const employeeMapByUserId = new Map([...employee.values()].map((el) => [el.userId, el]));
    const employeeData = employeeMapByUserId.get(message.userId);

    return {
      ...message,
      sendBy: employeeData?.fullName ?? '',
    };
  },
};
