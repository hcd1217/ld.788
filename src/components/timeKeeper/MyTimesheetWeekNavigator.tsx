import { useMemo } from 'react';
import { Group, Button, ActionIcon } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconCalendar } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface MyTimesheetWeekNavigatorProps {
  readonly currentWeek: Date;
  readonly onPreviousWeek: () => void;
  readonly onNextWeek: () => void;
  readonly onCurrentWeek: () => void;
}

// Helper function to get week range
const getWeekRange = (date: Date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // End of week (Saturday)
  return { start, end };
};

// Helper function to format date range
const formatDateRange = (start: Date, end: Date): string => {
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startDay} - ${endDay} ${startMonth}, ${year}`;
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}, ${year}`;
};

// Helper function to get days of week
const getDaysOfWeek = (weekStart: Date): Date[] => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
};

export function MyTimesheetWeekNavigator({
  currentWeek,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
}: MyTimesheetWeekNavigatorProps) {
  const { t } = useTranslation();

  // Calculate week range
  const weekRange = useMemo(() => getWeekRange(currentWeek), [currentWeek]);
  const weekDays = useMemo(() => getDaysOfWeek(weekRange.start), [weekRange.start]);

  // Check if current week
  const isCurrentWeek = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();
    return weekDays.some((day) => day.toDateString() === todayStr);
  }, [weekDays]);

  return (
    <Group justify="space-between" align="center">
      <Group gap="md">
        <ActionIcon variant="subtle" size="lg" onClick={onPreviousWeek} aria-label="Previous week">
          <IconChevronLeft size={20} />
        </ActionIcon>

        <Button
          variant={isCurrentWeek ? 'filled' : 'light'}
          size="md"
          radius="xl"
          style={{ minWidth: 200 }}
        >
          {formatDateRange(weekRange.start, weekRange.end)}
        </Button>

        <ActionIcon variant="subtle" size="lg" onClick={onNextWeek} aria-label="Next week">
          <IconChevronRight size={20} />
        </ActionIcon>
      </Group>

      {!isCurrentWeek && (
        <Button
          variant="light"
          size="compact-sm"
          onClick={onCurrentWeek}
          leftSection={<IconCalendar size={16} />}
        >
          {t('timekeeper.thisWeek')}
        </Button>
      )}
    </Group>
  );
}
