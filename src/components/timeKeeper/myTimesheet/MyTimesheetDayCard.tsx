import { memo } from 'react';

import { ActionIcon, Box, Card, Group, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';

import { useTranslation } from '@/hooks/useTranslation';
import type { TimesheetEntry } from '@/types/timekeeper';
import { formatTime } from '@/utils/timekeeper.utils';

import { DateBox, DurationDisplay } from '../common';

import classes from './MyTimesheetDayCard.module.css';

interface MyTimesheetDayCardProps {
  readonly date: Date;
  readonly entry?: TimesheetEntry;
}

export const MyTimesheetDayCard = memo(function MyTimesheetDayCard({
  date,
  entry,
}: MyTimesheetDayCardProps) {
  const { t } = useTranslation();
  const isToday = new Date().toDateString() === date.toDateString();

  const hasData = entry && entry.clockEntries.length > 0;
  const primaryClock = entry?.clockEntries[0];

  return (
    <Card
      shadow="xs"
      padding="xs"
      radius="md"
      className={classes.dayCard}
      style={{
        borderLeft: isToday ? '1px solid var(--mantine-color-brand-6)' : undefined,
        background: isToday ? 'var(--mantine-color-brand-0)' : undefined,
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group align="center" gap="md">
          <DateBox date={date} isHighlighted={isToday} />

          <Box style={{ flex: 1 }}>
            {hasData ? (
              <Box>
                <Group gap="xs">
                  <Text size="sm" fw={600}>
                    {formatTime(primaryClock?.clockInTime)} -{' '}
                    {formatTime(primaryClock?.clockOutTime)}
                  </Text>
                </Group>

                <Group gap="lg" mt="xs">
                  <DurationDisplay
                    minutes={entry.totalWorkedMinutes}
                    label={t('timekeeper.worked')}
                    variant="regular"
                    inline
                  />
                  {entry.totalBreakMinutes > 0 && (
                    <DurationDisplay
                      minutes={entry.totalBreakMinutes}
                      label={t('timekeeper.break')}
                      variant="break"
                      inline
                    />
                  )}
                  {entry.overtimeMinutes > 0 && (
                    <DurationDisplay minutes={entry.overtimeMinutes} variant="overtime" showBadge />
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
});
