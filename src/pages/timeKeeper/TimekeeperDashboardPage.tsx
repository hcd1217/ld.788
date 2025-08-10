import { useMemo } from 'react';
import { Box, Container } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useOnce } from '@/hooks/useOnce';
import { AppMobileLayout, AppDesktopLayout } from '@/components/common';
import { formatHours } from '@/utils/timekeeper.utils';
import {
  TimekeeperMobileFooter,
  DashboardHeader,
  DashboardTimesheet,
  DashboardQuickActions,
  DashboardResources,
  DashboardSkeleton,
} from '@/components/timeKeeper';
import { TimekeeperDashboardDesktop } from '@/components/timeKeeper/TimekeeperDashboardDesktop';
import {
  useTimekeeperDashboard,
  useTimekeeperError,
  useTimekeeperActions,
  useTimekeeperStore,
} from '@/stores/useTimekeeperStore';
import classes from './TimekeeperDashboardPage.module.css';

export function TimekeeperDashboardPage() {
  const dashboard = useTimekeeperDashboard();
  const { isLoading } = useTimekeeperStore();
  const error = useTimekeeperError();
  const { fetchDashboard, clearError } = useTimekeeperActions();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Get the counts from dashboard data
  const upcomingShifts = dashboard?.upcomingShifts || 0;
  const pendingRequests = dashboard?.pendingLeaveRequests || 0;

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
    if (isMobile) {
      return (
        <AppMobileLayout scrollable noHeader footer={<TimekeeperMobileFooter />}>
          <DashboardSkeleton />
        </AppMobileLayout>
      );
    }
    return (
      <AppDesktopLayout isLoading={isLoading}>
        <Box />
      </AppDesktopLayout>
    );
  }

  // Show error state if needed
  if (!dashboard && error) {
    if (isMobile) {
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
    return (
      <AppDesktopLayout error={error} clearError={clearError}>
        <Box />
      </AppDesktopLayout>
    );
  }

  // Show empty state if no data
  if (!dashboard || !headerData) {
    if (isMobile) {
      return (
        <AppMobileLayout scrollable noHeader footer={<TimekeeperMobileFooter />}>
          <Box className={classes.container} />
        </AppMobileLayout>
      );
    }
    return (
      <AppDesktopLayout>
        <Box />
      </AppDesktopLayout>
    );
  }

  // Mobile Layout
  if (isMobile) {
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
            <Box h="1rem" />
          </Container>
        </Box>
      </AppMobileLayout>
    );
  }

  // Desktop Layout
  return (
    <AppDesktopLayout isLoading={isLoading} error={error} clearError={clearError}>
      <TimekeeperDashboardDesktop
        headerData={headerData}
        upcomingShifts={upcomingShifts}
        pendingRequests={pendingRequests}
      />
    </AppDesktopLayout>
  );
}
