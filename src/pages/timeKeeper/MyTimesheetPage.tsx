import { useState, useMemo, useEffect } from 'react';
import { Alert } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AppMobileLayout, AppDesktopLayout, AppPageTitle } from '@/components/common';
import { MyTimesheetDesktop, MyTimesheetMobile } from '@/components/timeKeeper';
import {
  useTimekeeperStore,
  useTimekeeperError,
  useTimekeeperActions,
} from '@/stores/useTimekeeperStore';

// Helper function to get week range
const getWeekRange = (date: Date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // End of week (Saturday)
  return { start, end };
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

export function MyTimesheetPage() {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Store hooks
  const timesheetEntries = useTimekeeperStore((state) => state.timesheetEntries);
  const error = useTimekeeperError();
  const { clearError } = useTimekeeperActions();
  const { isLoading, fetchTimesheet } = useTimekeeperStore();

  // Local state for current week
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());

  // Calculate week range
  const weekRange = useMemo(() => getWeekRange(currentWeek), [currentWeek]);
  const weekDays = useMemo(() => getDaysOfWeek(weekRange.start), [weekRange.start]);

  // Fetch data when week changes
  useEffect(() => {
    void fetchTimesheet(weekRange.start, weekRange.end);
  }, [weekRange, fetchTimesheet]);

  // Map entries to dates
  const entriesByDate = useMemo(() => {
    const map = new Map<string, (typeof timesheetEntries)[0]>();
    timesheetEntries.forEach((entry) => {
      const dateStr = new Date(entry.date).toDateString();
      map.set(dateStr, entry);
    });
    return map;
  }, [timesheetEntries]);

  // Calculate week totals
  const weekTotals = useMemo(() => {
    const totalWorked = timesheetEntries.reduce((sum, entry) => sum + entry.totalWorkedMinutes, 0);
    const totalBreak = timesheetEntries.reduce((sum, entry) => sum + entry.totalBreakMinutes, 0);
    const totalOvertime = timesheetEntries.reduce((sum, entry) => sum + entry.overtimeMinutes, 0);
    const daysWorked = timesheetEntries.filter((entry) => entry.totalWorkedMinutes > 0).length;

    return {
      totalWorked,
      totalBreak,
      totalOvertime,
      daysWorked,
    };
  }, [timesheetEntries]);

  // Navigation functions
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  // Error Alert component (shared between mobile and desktop)
  const errorAlert = error && (
    <Alert
      icon={<IconAlertCircle size={16} />}
      title={t('common.error')}
      color="red"
      withCloseButton
      onClose={clearError}
      mb="lg"
    >
      {error}
    </Alert>
  );

  // Mobile layout
  if (isMobile) {
    return (
      <AppMobileLayout
        scrollable={false}
        header={<AppPageTitle fz="h4" title={t('timekeeper.myTimesheet.title' as any)} />}
        noFooter
        withGoBack
        isLoading={isLoading}
        error={error}
        clearError={clearError}
      >
        {errorAlert}
        <MyTimesheetMobile
          currentWeek={currentWeek}
          weekDays={weekDays}
          entriesByDate={entriesByDate}
          weekTotals={weekTotals}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
          onCurrentWeek={goToCurrentWeek}
        />
      </AppMobileLayout>
    );
  }

  // Desktop layout
  return (
    <AppDesktopLayout isLoading={isLoading} error={error} clearError={clearError}>
      {errorAlert}
      <MyTimesheetDesktop
        currentWeek={currentWeek}
        weekDays={weekDays}
        entriesByDate={entriesByDate}
        weekTotals={weekTotals}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onCurrentWeek={goToCurrentWeek}
      />
    </AppDesktopLayout>
  );
}
