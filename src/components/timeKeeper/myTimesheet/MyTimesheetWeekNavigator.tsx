import { useMemo } from 'react';
import { Group, Button, ActionIcon } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getWeekRange, getDaysOfWeek, formatDateRange } from '@/utils/timekeeper.utils';

interface MyTimesheetWeekNavigatorProps {
  readonly currentWeek: Date;
  readonly onPreviousWeek: () => void;
  readonly onNextWeek: () => void;
  readonly onCurrentWeek: () => void;
}

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
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={onPreviousWeek}
          aria-label={t('common.previousWeek')}
        >
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

        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={onNextWeek}
          aria-label={t('common.nextWeek')}
        >
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
