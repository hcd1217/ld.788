import { Box } from '@mantine/core';
import type { TimesheetEntry } from '@/types/timekeeper';
import { MyTimesheetWeekSummary } from './MyTimesheetWeekSummary';
import { useTimesheetWeekLogic } from '@/hooks/useTimesheetWeekLogic';
import { TimesheetWeekNavigation } from './TimesheetWeekNavigation';
import { TimesheetDayCardsList } from './TimesheetDayCardsList';

interface MyTimesheetMobileProps {
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

export function MyTimesheetMobile({
  currentWeek,
  weekDays,
  entriesByDate,
  weekTotals,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
}: MyTimesheetMobileProps) {
  // Use shared hook for week logic
  const { weekRange, isCurrentWeek } = useTimesheetWeekLogic({
    currentWeek,
    weekDays,
  });

  return (
    <Box
      style={{
        padding: 0,
        height: '100%', // Use 100% since parent now has proper flexbox layout
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Fixed header section */}
      <Box px={0} pt="lg" pb="md">
        {/* Header with navigation */}
        <TimesheetWeekNavigation
          weekRange={weekRange}
          isCurrentWeek={isCurrentWeek}
          onPreviousWeek={onPreviousWeek}
          onNextWeek={onNextWeek}
          onCurrentWeek={onCurrentWeek}
          variant="mobile"
        />
        {/* Week Summary */}
        <Box mt="lg">
          <MyTimesheetWeekSummary
            regularHours={weekTotals.totalWorked}
            overtimeHours={weekTotals.totalOvertime}
          />
        </Box>
      </Box>

      {/* Scrollable daily entries */}
      <Box
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingLeft: 'var(--mantine-spacing-md)',
          paddingRight: 'var(--mantine-spacing-md)',
          paddingBottom: 'var(--mantine-spacing-lg)',
        }}
      >
        <TimesheetDayCardsList weekDays={weekDays} entriesByDate={entriesByDate} variant="mobile" />
      </Box>
    </Box>
  );
}
