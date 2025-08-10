import { Timeline, Text, Stack, Paper, Group, Badge, Avatar } from '@mantine/core';
import { IconClock, IconClockOff, IconCoffee, IconCamera } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { ClockEntry } from '@/types/timekeeper';
import { formatDuration, formatTime } from '@/utils/timekeeper.utils';

interface ClockTimelineProps {
  readonly entries: ClockEntry[];
  readonly photos?: Record<string, string>; // clockId -> base64 image
}

export function ClockTimeline({ entries, photos = {} }: ClockTimelineProps) {
  const { t } = useTranslation();

  const getTimelineIcon = (status: string, hasPhoto: boolean) => {
    const iconProps = { size: 16 };

    if (status === 'CLOCKED_IN') {
      return hasPhoto ? (
        <Group gap={4}>
          <IconClock {...iconProps} />
          <IconCamera {...iconProps} />
        </Group>
      ) : (
        <IconClock {...iconProps} />
      );
    }

    if (status === 'CLOCKED_OUT') {
      return hasPhoto ? (
        <Group gap={4}>
          <IconClockOff {...iconProps} />
          <IconCamera {...iconProps} />
        </Group>
      ) : (
        <IconClockOff {...iconProps} />
      );
    }

    return <IconCoffee {...iconProps} />;
  };

  if (entries.length === 0) {
    return (
      <Paper p="lg" radius="md" withBorder>
        <Text ta="center" c="dimmed">
          {t('timekeeper.clock.noEntriesYet')}
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="lg" radius="md" withBorder>
      <Stack gap="md">
        <Text size="lg" fw={600}>
          {t('timekeeper.clock.todayTimeline')}
        </Text>

        <Timeline active={entries.length - 1} bulletSize={32} lineWidth={2}>
          {entries.map((entry, index) => {
            const hasPhoto = Boolean(photos[entry.id]);
            const isLast = index === entries.length - 1;

            return (
              <Timeline.Item
                key={entry.id}
                bullet={getTimelineIcon(entry.status, hasPhoto)}
                color={getStatusColor(entry.status)}
              >
                <Group justify="space-between" mb="xs">
                  <Group gap="sm">
                    <Text size="sm" fw={600}>
                      {formatTime(entry.clockInTime)}
                    </Text>
                    <Badge color={getStatusColor(entry.status)} variant="light">
                      {t(`timekeeper.clock.status.${entry.status.toLowerCase()}` as any)}
                    </Badge>
                  </Group>

                  {hasPhoto && (
                    <Avatar
                      src={photos[entry.id]}
                      size="sm"
                      radius="md"
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </Group>

                {entry.location && (
                  <Text size="xs" c="dimmed" mb="xs">
                    📍{' '}
                    {entry.location.address ||
                      `${entry.location.latitude.toFixed(4)}, ${entry.location.longitude.toFixed(4)}`}
                  </Text>
                )}

                {entry.clockOutTime && (
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">
                      {t('timekeeper.clock.clockedOutAt')}: {formatTime(entry.clockOutTime)}
                    </Text>
                    {!isLast && (
                      <Text size="xs" c="dimmed">
                        • {t('timekeeper.clock.duration')}:{' '}
                        {formatDuration(
                          Math.floor(
                            (new Date(entry.clockOutTime).getTime() -
                              new Date(entry.clockInTime).getTime()) /
                              60000,
                          ),
                        )}
                      </Text>
                    )}
                  </Group>
                )}

                {entry.breakStartTime && (
                  <Text size="xs" c="dimmed">
                    {t('timekeeper.clock.breakAt')}: {formatTime(entry.breakStartTime)}
                    {entry.breakEndTime && ` - ${formatTime(entry.breakEndTime)}`}
                  </Text>
                )}
              </Timeline.Item>
            );
          })}
        </Timeline>
      </Stack>
    </Paper>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'CLOCKED_IN':
      return 'brand';
    case 'CLOCKED_OUT':
      return 'red';
    case 'ON_BREAK':
      return 'orange';
    default:
      return 'gray';
  }
};
