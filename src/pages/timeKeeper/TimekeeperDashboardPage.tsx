import { useMemo } from 'react';

import { Box, Container } from '@mantine/core';

import { AppMobileLayout } from '@/components/common';
import {
  DashboardHeader,
  DashboardQuickActions,
  DashboardResources,
  DashboardSkeleton,
  DashboardTimesheet,
  TimekeeperErrorBoundary,
  TimekeeperMobileFooter,
} from '@/components/timeKeeper';
import { useOnce } from '@/hooks/useOnce';
import {
  useTimekeeperActions,
  useTimekeeperDashboard,
  useTimekeeperError,
  useTimekeeperStore,
} from '@/stores/useTimekeeperStore';
import { formatHours } from '@/utils/timekeeper.utils';

import classes from './TimekeeperDashboardPage.module.css';

function TimekeeperDashboardPageContent() {
  const dashboard = useTimekeeperDashboard();
  const { isLoading } = useTimekeeperStore();
  const error = useTimekeeperError();
  const { fetchDashboard, clearError } = useTimekeeperActions();

  // Fetch dashboard data on mount
  useOnce(() => {
    void fetchDashboard();
  });

  // Transform dashboard data for header component
  const headerData = useMemo(() => {
    if (!dashboard) {
      return null;
    }

    const clockInTime = dashboard.currentClock
      ? new Date(dashboard.currentClock.clockInTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      : undefined;

    const minutesAgo = dashboard.currentClock
      ? Math.floor(
          (Date.now() - new Date(dashboard.currentClock.clockInTime).getTime()) / (1000 * 60),
        )
      : 0;

    return {
      userName: dashboard.employee.fullName,
      clockInTime: clockInTime || '',
      hoursAgo: Math.floor(minutesAgo / 60) || 0,
      minutesAgo: minutesAgo % 60 || 0,
      workedHours: formatHours(dashboard.todayStats.totalWorkedMinutes),
      weeklyHours: (dashboard.weekStats.totalWorkedMinutes / 60).toFixed(1),
      remainingHours: (dashboard.weekStats.remainingMinutes / 60).toFixed(1),
    };
  }, [dashboard]);

  // Show skeleton while loading
  if (isLoading && !dashboard) {
    return (
      <AppMobileLayout scrollable noHeader footer={<TimekeeperMobileFooter />}>
        <DashboardSkeleton />
      </AppMobileLayout>
    );
  }

  // Show error state if needed
  if (!dashboard && error) {
    return (
      <AppMobileLayout
        scrollable
        noHeader
        footer={<TimekeeperMobileFooter />}
        error={error}
        clearError={clearError}
      >
        <Box className={classes.container} />
      </AppMobileLayout>
    );
  }

  // Show empty state if no data
  if (!dashboard || !headerData) {
    return (
      <AppMobileLayout scrollable noHeader footer={<TimekeeperMobileFooter />}>
        <Box className={classes.container} />
      </AppMobileLayout>
    );
  }

  // Main mobile layout
  return (
    <AppMobileLayout
      scrollable
      noHeader
      footer={<TimekeeperMobileFooter />}
      isLoading={isLoading}
      error={error}
      clearError={clearError}
    >
      <Box className={classes.container}>
        <DashboardHeader {...headerData} />
        <Container className={classes.dashboardContent}>
          <Box className={classes.overlappingTimesheet}>
            <DashboardTimesheet />
          </Box>
          <DashboardQuickActions
            upcomingShifts={dashboard.upcomingShifts}
            pendingRequests={dashboard.pendingLeaveRequests}
          />
          <DashboardResources />
        </Container>
      </Box>
    </AppMobileLayout>
  );
}

export function TimekeeperDashboardPage() {
  return (
    <TimekeeperErrorBoundary componentName="TimekeeperDashboard">
      <TimekeeperDashboardPageContent />
    </TimekeeperErrorBoundary>
  );
}
