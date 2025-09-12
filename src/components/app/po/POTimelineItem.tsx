import React from 'react';

import { Badge, Group, Text, Timeline } from '@mantine/core';

import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime } from '@/utils/time';

export type TimelineItemData = {
  title: string;
  description: string;
  date?: Date;
  icon: React.ReactNode;
  color: string;
  active: boolean;
  current?: boolean;
};

type POTimelineItemProps = {
  readonly item: TimelineItemData;
  readonly index: number;
};

export function POTimelineItem({ item }: POTimelineItemProps) {
  const { t } = useTranslation();

  return (
    <Timeline.Item
      bullet={item.icon}
      title={
        <Group gap="sm">
          <Text fw={500} c={item.active ? undefined : 'gray.5'}>
            {item.title}
          </Text>
          {item.current && (
            <Badge size="sm" variant="filled" color={item.color}>
              {t('po.current')}
            </Badge>
          )}
          {!item.active && !item.current && (
            <Badge size="sm" variant="light" color="gray">
              {t('po.pending')}
            </Badge>
          )}
        </Group>
      }
      color={item.color}
    >
      <Text size="sm" c={item.active ? 'dimmed' : 'gray.5'} mb={4}>
        {item.description}
      </Text>
      {item.date && (
        <Text size="xs" c="dimmed">
          {formatDateTime(item.date)}
        </Text>
      )}
    </Timeline.Item>
  );
}
