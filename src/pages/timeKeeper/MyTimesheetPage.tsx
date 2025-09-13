import { useEffect, useMemo, useState } from 'react';

import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

import { AppMobileLayout, AppPageTitle } from '@/components/common';
import { MyTimesheetMobile, TimekeeperErrorBoundary } from '@/components/timeKeeper';
import { ROUTERS } from '@/config/routeConfig';
import { useTranslation } from '@/hooks/useTranslation';
import {
  useTimekeeperActions,
  useTimekeeperError,
  useTimekeeperStore,
} from '@/stores/useTimekeeperStore';
import { getDaysOfWeek, getWeekRange } from '@/utils/timekeeper.utils';

export function MyTimesheetPage() {
  const { t } = useTranslation();

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

  // Error Alert component
  const errorAlert = error && (
    <Alert
      icon={<IconAlertCircle size={16} />}
      title={t('common.errors.notificationTitle')}
      color="red"
      withCloseButton
      onClose={clearError}
      mb="lg"
    >
      {error}
    </Alert>
  );

  // Mobile-only layout
  return (
    <TimekeeperErrorBoundary componentName="MyTimesheet">
      <AppMobileLayout
        goBackRoute={ROUTERS.TIME_KEEPER_DASHBOARD}
        header={<AppPageTitle fz="h4" title={t('timekeeper.myTimesheet.title')} />}
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
    </TimekeeperErrorBoundary>
  );
}
