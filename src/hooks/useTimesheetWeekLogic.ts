import { useMemo } from 'react';
import { getWeekRange } from '@/utils/timekeeper.utils';

interface UseTimesheetWeekLogicProps {
  readonly currentWeek: Date;
  readonly weekDays: readonly Date[];
}

interface UseTimesheetWeekLogicReturn {
  readonly weekRange: {
    readonly start: Date;
    readonly end: Date;
  };
  readonly isCurrentWeek: boolean;
}

/**
 * Custom hook to encapsulate shared timesheet week logic
 * Calculates week range and determines if it's the current week
 */
export function useTimesheetWeekLogic({
  currentWeek,
  weekDays,
}: UseTimesheetWeekLogicProps): UseTimesheetWeekLogicReturn {
  // Calculate week range
  const weekRange = useMemo(() => getWeekRange(currentWeek), [currentWeek]);

  // Check if current week
  const isCurrentWeek = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();
    return weekDays.some((day) => day.toDateString() === todayStr);
  }, [weekDays]);

  return {
    weekRange,
    isCurrentWeek,
  };
}
