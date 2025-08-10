import { Stack, Grid } from '@mantine/core';
import type { TimesheetEntry } from '@/types/timekeeper';
import { MyTimesheetDayCard } from './MyTimesheetDayCard';

interface TimesheetDayCardsListProps {
  readonly weekDays: readonly Date[];
  readonly entriesByDate: Map<string, TimesheetEntry>;
  readonly variant?: 'desktop' | 'mobile';
}

export function TimesheetDayCardsList({
  weekDays,
  entriesByDate,
  variant = 'desktop',
}: TimesheetDayCardsListProps) {
  // Map through weekDays and render day cards
  const dayCards = weekDays.map((day) => {
    const entry = entriesByDate.get(day.toDateString());
    return <MyTimesheetDayCard key={day.toISOString()} date={day} entry={entry} />;
  });

  // Desktop: Use Grid layout
  if (variant === 'desktop') {
    return (
      <Grid gutter="md">
        {weekDays.map((day) => {
          const entry = entriesByDate.get(day.toDateString());
          return (
            <Grid.Col key={day.toISOString()} span={6}>
              <MyTimesheetDayCard date={day} entry={entry} />
            </Grid.Col>
          );
        })}
      </Grid>
    );
  }

  // Mobile: Use Stack layout
  return <Stack gap="lg">{dayCards}</Stack>;
}
