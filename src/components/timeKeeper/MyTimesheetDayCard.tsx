import { Card, Group, Text, Badge, Box, Stack, ThemeIcon, ActionIcon } from '@mantine/core';
import { IconClock, IconChevronRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { TimesheetEntry } from '@/types/timekeeper';
import classes from './MyTimesheetDayCard.module.css';

interface MyTimesheetDayCardProps {
  readonly date: Date;
  readonly entry?: TimesheetEntry;
}

// Helper function to format time
const formatTime = (date: Date | undefined): string => {
  if (!date) return '--:--';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Helper function to format duration
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export function MyTimesheetDayCard({ date, entry }: MyTimesheetDayCardProps) {
  const { t } = useTranslation();
  const isToday = new Date().toDateString() === date.toDateString();
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const monthName = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const dayNumber = date.getDate();

  const hasData = entry && entry.clockEntries.length > 0;
  const primaryClock = entry?.clockEntries[0];

  return (
    <Card
      shadow="xs"
      padding="xs"
      radius="md"
      className={classes.dayCard}
      style={{
        borderLeft: isToday ? '3px solid var(--mantine-color-brand-6)' : undefined,
        background: isToday ? 'var(--mantine-color-brand-0)' : undefined,
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group align="center" gap="md">
          <Box className={classes.dateBox}>
            <Box className={classes.dateHeader}>
              <Text size="xs" fw={600} ta="center" c="white">
                {monthName}
              </Text>
            </Box>
            <Stack className={classes.dateBody} gap={0} align="center" justify="center">
              <Text size="base" fw={700} ta="center" lh={1}>
                {dayNumber}
              </Text>
              <Text size="xs" ta="center">
                {dayName}
              </Text>
            </Stack>
          </Box>

          <Box style={{ flex: 1 }}>
            {hasData ? (
              <Box>
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="brand">
                    <IconClock size={14} />
                  </ThemeIcon>
                  <Text size="sm" fw={600}>
                    {formatTime(primaryClock?.clockInTime)} -{' '}
                    {formatTime(primaryClock?.clockOutTime)}
                  </Text>
                </Group>

                <Group gap="lg" mt="xs">
                  <Text size="xs" c="dimmed">
                    {t('timekeeper.worked')}:{' '}
                    <Text component="span" fw={600}>
                      {formatDuration(entry.totalWorkedMinutes)}
                    </Text>
                  </Text>
                  {entry.totalBreakMinutes > 0 && (
                    <Text size="xs" c="dimmed">
                      {t('timekeeper.break')}:{' '}
                      <Text component="span" fw={600}>
                        {formatDuration(entry.totalBreakMinutes)}
                      </Text>
                    </Text>
                  )}
                  {entry.overtimeMinutes > 0 && (
                    <Badge size="sm" variant="light" color="brand">
                      +{formatDuration(entry.overtimeMinutes)} {t('timekeeper.overtime')}
                    </Badge>
                  )}
                </Group>
              </Box>
            ) : (
              <Text c="dimmed" size="sm">
                {t('timekeeper.noEntry')}
              </Text>
            )}
          </Box>
        </Group>

        {hasData && (
          <ActionIcon variant="subtle" color="gray" size="sm">
            <IconChevronRight size={16} />
          </ActionIcon>
        )}
      </Group>
    </Card>
  );
}
