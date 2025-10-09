import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ActionIcon,
  Box,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { IconSend } from '@tabler/icons-react';

import { useTranslation } from '@/hooks/useTranslation';
import { chatService, type Message } from '@/services/chat/chat';
import { useMe } from '@/stores/useAppStore';
import { isDevelopment } from '@/utils/env';
import { formatDateTime } from '@/utils/time';

type ChatPanelProps = {
  readonly targetId: string;
  readonly type: 'PO' | 'DR';
};

export function ChatPanel({ targetId, type }: ChatPanelProps) {
  const { t } = useTranslation();
  const currentUser = useMe();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Load chat history
  const loadChatHistory = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const messages = await chatService.getChatHistory({ type, targetId });
      setMessages(messages);
    } catch (error) {
      if (isDevelopment) {
        console.error('Failed to load chat history:', error);
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [type, targetId]);

  // Load chat on mount and setup auto-refresh
  useEffect(() => {
    void loadChatHistory();

    // Auto-refresh every 5 seconds (silent refresh without loading state)
    const intervalId = setInterval(() => {
      void loadChatHistory(false);
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [loadChatHistory]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const message = await chatService.sendMessage({
        type,
        targetId,
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      if (isDevelopment) {
        console.error('Failed to send message:', error);
      }
    } finally {
      setIsSending(false);
    }
  }, [newMessage, type, targetId, isSending]);

  // Handle Enter key
  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        void handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: Record<string, Message[]> = {};
    for (const message of messages) {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    }
    return groups;
  }, [messages]);

  if (isLoading) {
    return (
      <Paper p="md" withBorder>
        <Text c="dimmed" ta="center">
          {t('common.loadingMore')}
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="md" h="70vh">
      {/* Messages area */}
      <ScrollArea
        flex={1}
        viewportRef={viewportRef}
        ref={scrollAreaRef}
        offsetScrollbars
        scrollbarSize={8}
      >
        <Stack gap="md" p="md">
          {Object.entries(groupedMessages).length === 0 ? (
            <Text c="dimmed" ta="center">
              {t('chat.noMessages')}
            </Text>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <Stack key={date} gap="xs">
                <Text size="xs" c="dimmed" ta="center">
                  {date}
                </Text>
                {dateMessages.map((message) => {
                  const isOwnMessage = message.userId === currentUser?.id;
                  const senderName = message.sendBy || 'Unknown';
                  return (
                    <Group
                      key={message.id}
                      align="flex-start"
                      gap="xs"
                      justify={isOwnMessage ? 'flex-end' : 'flex-start'}
                    >
                      <Stack gap={4} style={{ maxWidth: '65%' }}>
                        <Text size="xs" fw={600} c={isOwnMessage ? 'blue' : 'dark'} ta={isOwnMessage ? 'right' : 'left'}>
                          {senderName}
                        </Text>
                        <Paper
                          p="sm"
                          radius="md"
                          withBorder
                          bg={isOwnMessage ? 'blue.0' : 'gray.0'}
                        >
                          <Text size="sm">{message.content}</Text>
                        </Paper>
                        <Text size="xs" c="dimmed" ta={isOwnMessage ? 'right' : 'left'}>
                          {formatDateTime(message.createdAt)}
                        </Text>
                      </Stack>
                    </Group>
                  );
                })}
              </Stack>
            ))
          )}
        </Stack>
      </ScrollArea>

      {/* Message input */}
      <Box>
        <Group gap="xs" align="flex-end">
          <Textarea
            flex={1}
            placeholder={t('chat.typeMessage')}
            value={newMessage}
            onChange={(e) => setNewMessage(e.currentTarget.value)}
            onKeyDown={handleKeyPress}
            minRows={4}
            maxRows={6}
            autosize
            disabled={isSending}
          />
          <ActionIcon
            size="lg"
            variant="filled"
            color="blue"
            onClick={() => void handleSendMessage()}
            disabled={!newMessage.trim() || isSending}
            loading={isSending}
          >
            <IconSend size={18} />
          </ActionIcon>
        </Group>
      </Box>
    </Stack>
  );
}
