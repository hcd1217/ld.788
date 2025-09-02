import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { ResponsiveAuthLayout } from '@/components/layouts/ResponsiveAuthLayout';
import { AppLayout } from '@/components/layouts/AppLayout';
import { ProtectedRoute } from '@/components/layouts/ProtectedRoute';
import { ROUTERS } from '@/config/routeConfig';
import {
  TimekeeperDashboardPage,
  ServiceLayout,
  NotFound,
  HomePage,
  MobileOnlyLayout,
  ClockManagementPage,
  MyTimesheetPage,
} from './components';
import { authRouteObjects } from './auth';
import { configRouteObjects } from './config';
import { salesRouteObjects } from './sales';
import { deliveryRouteObjects } from './delivery';
import { appRouteObjects } from './app';
import { managementRouteObjects } from './management';

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
