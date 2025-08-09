import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { ResponsiveAuthLayout } from '@/components/layouts/ResponsiveAuthLayout';
import { AppLayout } from '@/components/layouts/AppLayout';
import { ProtectedRoute } from '@/components/layouts/ProtectedRoute';
import { ROUTERS } from '@/config/routeConfig';
import { TimekeeperDashboardPage, ServiceLayout, RootUserLayout, NotFound } from './components';
import { authRouteObjects } from './auth';
import { adminRouteObjects } from './admin';
import { configRouteObjects } from './config';
import { salesRouteObjects } from './sales';
import { appRouteObjects } from './app';
import { userRouteObjects } from './user';
import { storeRouteObjects } from './store';

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
    children: [
      {
        path: ROUTERS.TIME_KEEPER_DASHBOARD,
        Component: TimekeeperDashboardPage,
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
    children: [...configRouteObjects, ...salesRouteObjects],
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
    children: [
      ...appRouteObjects,
      {
        path: '',
        Component: RootUserLayout,
        children: [...storeRouteObjects, ...userRouteObjects],
      },
    ],
  },
  // ADMIN routes (default elegant theme)
  ...adminRouteObjects,
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
