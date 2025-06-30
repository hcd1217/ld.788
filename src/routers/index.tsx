import {lazy} from 'react';
import {createBrowserRouter, type RouteObject} from 'react-router';
import {AppLayout} from '@/components/layouts/AppLayout';
import {ProtectedRoute} from '@/components/layouts/ProtectedRoute';
import {ResponsiveAuthLayout} from '@/components/layouts/ResponsiveAuthLayout';

const ServiceLayout = lazy(async () => {
  const module = await import('@/components/layouts/ServiceLayout');
  return {default: module.ServiceLayout};
});

const ErrorsPage = lazy(async () => {
  const module = await import('@/pages/sample/Errors');
  return {default: module.ErrorsPage};
});

const NotFound = lazy(async () => {
  const module = await import('@/pages/errors/NotFound');
  return {default: module.NotFound};
});

const HomePage = lazy(async () => {
  const module = await import('@/pages/sample/HomePage');
  return {default: module.HomePage};
});

const ProfilePage = lazy(async () => {
  const module = await import('@/pages/app/ProfilePage');
  return {default: module.ProfilePage};
});

const DashboardPage = lazy(async () => {
  const module = await import('@/pages/app/DashboardPage');
  return {default: module.DashboardPage};
});

const ExplorePage = lazy(async () => {
  const module = await import('@/pages/app/ExplorePage');
  return {default: module.ExplorePage};
});

const NotificationsPage = lazy(async () => {
  const module = await import('@/pages/app/NotificationPage');
  return {default: module.NotificationsPage};
});

const LoginPage = lazy(async () => {
  const module = await import('@/pages/auth/LoginPage');
  return {default: module.LoginPage};
});

const ForgotPasswordPage = lazy(async () => {
  const module = await import('@/pages/auth/ForgotPasswordPage');
  return {default: module.ForgotPasswordPage};
});

const ResetPasswordPage = lazy(async () => {
  const module = await import('@/pages/auth/ResetPasswordPage');
  return {default: module.ResetPasswordPage};
});

const RegisterPage = lazy(async () => {
  const module = await import('@/pages/auth/RegisterPage');
  return {default: module.RegisterPage};
});

const routeObjects: RouteObject[] = [
  {
    path: '',
    Component: AppLayout,
    children: [
      {index: true, Component: HomePage},
      {
        path: 'sample',
        children: [{path: 'errors', Component: ErrorsPage}],
      },
    ],
  },
  {
    path: '',
    children: [
      {
        path: 'login',
        Component: LoginPage,
      },
      {
        path: '/:clientCode/login',
        Component: LoginPage,
      },
      {
        path: 'forgot-password',
        Component: ForgotPasswordPage,
      },
      {
        path: 'reset-password',
        Component: ResetPasswordPage,
      },
      {
        path: 'register',
        Component: RegisterPage,
      },
    ],
  },
  {
    path: '',
    element: (
      <ProtectedRoute>
        <ResponsiveAuthLayout />
      </ProtectedRoute>
    ),
    children: [
      {path: 'profile', Component: ProfilePage},
      {path: 'dashboard', Component: DashboardPage},
      {path: 'explore', Component: ExplorePage},
      {path: 'notifications', Component: NotificationsPage},
    ],
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
