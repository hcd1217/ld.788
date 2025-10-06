import { lazy } from 'react';

import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';

import { AppLayout } from '@/components/layouts/AppLayout';
import { ProtectedRoute } from '@/components/layouts/ProtectedRoute';
import { ResponsiveAuthLayout } from '@/components/layouts/ResponsiveAuthLayout';
import { ROUTERS } from '@/config/routeConfig';

import { appRouteObjects } from './app';
import { authRouteObjects } from './auth';
import {
  ClockManagementPage,
  HomePage,
  MobileOnlyLayout,
  MyTimesheetPage,
  NotFound,
  TimekeeperDashboardPage,
} from './components';
import { configRouteObjects } from './config';
import { deliveryRouteObjects } from './delivery';
import { managementRouteObjects } from './management';
import { salesRouteObjects } from './sales';

// Type for route with theme metadata
export type ThemeRouteObject = RouteObject & {
  theme?: string;
  children?: ThemeRouteObject[];
};

export const routeObjects: ThemeRouteObject[] = [
  // Root route
  {
    path: ROUTERS.ROOT,
    Component: () => <Navigate to={ROUTERS.LOGIN} />,
  },
  // Timekeeper routes with timeKeeper theme
  {
    path: '',
    theme: 'timeKeeper', // Green theme for time-keeper routes
    element: <MobileOnlyLayout />,
    children: [
      {
        path: ROUTERS.TIME_KEEPER_DASHBOARD,
        Component: TimekeeperDashboardPage,
      },
      {
        path: ROUTERS.TIME_KEEPER_MY_TIMESHEET,
        Component: MyTimesheetPage,
      },
      {
        path: ROUTERS.TIME_KEEPER_CLOCK,
        Component: ClockManagementPage,
      },
    ],
  },
  // AUTH routes (default elegant theme)
  ...authRouteObjects,
  // APP routes (with AppLayout) - elegant theme
  {
    path: '',
    theme: 'elegant', // Explicitly set elegant theme
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: ROUTERS.HOME, Component: HomePage },
      ...configRouteObjects,
      ...managementRouteObjects,
      ...salesRouteObjects,
      ...deliveryRouteObjects,
    ],
  },
  // Old APP routes (with ResponsiveAuthLayout) - elegant theme
  {
    path: '',
    theme: 'elegant', // Explicitly set elegant theme
    element: (
      <ProtectedRoute>
        <ResponsiveAuthLayout />
      </ProtectedRoute>
    ),
    children: [...appRouteObjects],
  },
];

const ServiceLayout = lazy(async () => {
  const module = await import('@/components/layouts/ServiceLayout');
  return { default: module.ServiceLayout };
});

export const router = createBrowserRouter([
  {
    path: '/',
    Component: ServiceLayout,
    children: routeObjects,
  },
  {
    path: '*',
    Component: NotFound,
  },
]);
