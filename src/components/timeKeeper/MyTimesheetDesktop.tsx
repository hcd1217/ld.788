import { Container, Stack, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { TimesheetEntry } from '@/types/timekeeper';
import { MyTimesheetWeekNavigator } from './MyTimesheetWeekNavigator';
import { MyTimesheetWeekSummary } from './MyTimesheetWeekSummary';
import { MyTimesheetDayCard } from './MyTimesheetDayCard';

interface MyTimesheetDesktopProps {
  readonly currentWeek: Date;
  readonly weekDays: Date[];
  readonly entriesByDate: Map<string, TimesheetEntry>;
  readonly weekTotals: {
    totalWorked: number;
    totalBreak: number;
    totalOvertime: number;
    daysWorked: number;
  };
  readonly onPreviousWeek: () => void;
  readonly onNextWeek: () => void;
  readonly onCurrentWeek: () => void;
}

export function MyTimesheetDesktop({
  currentWeek,
  weekDays,
  entriesByDate,
  weekTotals,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
}: MyTimesheetDesktopProps) {
  const { t } = useTranslation();

  return (
    <Container fluid px="xl" py="lg">
      <Stack gap="lg">
        {/* Header */}
        <Title order={2}>{t('timekeeper.myTimesheet.title' as any)}</Title>

        {/* Week Navigation */}
        <MyTimesheetWeekNavigator
          currentWeek={currentWeek}
          onPreviousWeek={onPreviousWeek}
          onNextWeek={onNextWeek}
          onCurrentWeek={onCurrentWeek}
        />

        {/* Week Summary */}
        <MyTimesheetWeekSummary
          totalWorked={weekTotals.totalWorked}
          totalBreak={weekTotals.totalBreak}
          totalOvertime={weekTotals.totalOvertime}
          daysWorked={weekTotals.daysWorked}
        />

        {/* Daily entries */}
        <Stack gap="sm">
          {weekDays.map((day) => {
            const entry = entriesByDate.get(day.toDateString());
            return <MyTimesheetDayCard key={day.toISOString()} date={day} entry={entry} />;
          })}
        </Stack>
      </Stack>
    </Container>
  );
}