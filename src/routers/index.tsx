import {lazy} from 'react';
import {createBrowserRouter, type RouteObject} from 'react-router';
import {AppLayout} from '@/components/layouts/AppLayout';
import {ProtectedRoute} from '@/components/layouts/ProtectedRoute';
import {ResponsiveAuthLayout} from '@/components/layouts/ResponsiveAuthLayout';

const ServiceLayout = lazy(async () => {
  const module = await import('@/components/layouts/ServiceLayout');
  return {default: module.ServiceLayout};
});

const PCOnlyLayout = lazy(async () => {
  const module = await import('@/components/layouts/PCOnlyLayout');
  return {default: module.PCOnlyLayout};
});

const ErrorsPage = lazy(async () => {
  const module = await import('@/pages/sample/Errors');
  return {default: module.ErrorsPage};
});

const NotFound = lazy(async () => {
  const module = await import('@/pages/errors/NotFound');
  return {default: module.NotFound};
});

const TopPage = lazy(async () => {
  const module = await import('@/pages/TopPage');
  return {default: module.TopPage};
});

const ProfilePage = lazy(async () => {
  const module = await import('@/pages/app/ProfilePage');
  return {default: module.ProfilePage};
});

const HomePage = lazy(async () => {
  const module = await import('@/pages/app/HomePage');
  return {default: module.HomePage};
});

const ExplorePage = lazy(async () => {
  const module = await import('@/pages/app/ExplorePage');
  return {default: module.ExplorePage};
});

const NotificationsPage = lazy(async () => {
  const module = await import('@/pages/app/NotificationPage');
  return {default: module.NotificationsPage};
});

const MorePage = lazy(async () => {
  const module = await import('@/pages/app/MorePage');
  return {default: module.MorePage};
});

const AddUserPage = lazy(async () => {
  const module = await import('@/pages/app/AddUserPage');
  return {default: module.AddUserPage};
});

const ImportUsersPage = lazy(async () => {
  const module = await import('@/pages/app/ImportUsersPage');
  return {default: module.ImportUsersPage};
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
      {index: true, Component: TopPage},
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
      {path: 'home', Component: HomePage},
      {path: 'add-user', Component: AddUserPage},
      {path: 'explore', Component: ExplorePage},
      {path: 'notifications', Component: NotificationsPage},
      {path: 'more', Component: MorePage},
      {
        path: '',
        Component: PCOnlyLayout,
        children: [{path: 'import-users', Component: ImportUsersPage}],
      },
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
