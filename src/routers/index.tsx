import {lazy} from 'react';
import {createBrowserRouter, type RouteObject} from 'react-router';
import {authRoutes} from './authRoutes';
import {AppLayout} from '@/components/layouts/AppLayout';
import {ResponsiveAuthLayout} from '@/components/layouts/ResponsiveAuthLayout';
import {ProtectedRoute} from '@/components/layouts/ProtectedRoute';

// Import auth routes from separate module

const ServiceLayout = lazy(async () => {
  const module = await import('@/components/layouts/ServiceLayout');
  return {default: module.ServiceLayout};
});

const RootUserLayout = lazy(async () => {
  const module = await import('@/components/layouts/RootUserLayout');
  return {default: module.RootUserLayout};
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

const UserManagementPage = lazy(async () => {
  const module = await import('@/pages/app/UserManagementPage');
  return {default: module.UserManagementPage};
});

const AddUserPage = lazy(async () => {
  const module = await import('@/pages/app/AddUserPage');
  return {default: module.AddUserPage};
});

const ImportUsersPage = lazy(async () => {
  const module = await import('@/pages/app/ImportUsersPage');
  return {default: module.ImportUsersPage};
});

const UserDetailPage = lazy(async () => {
  const module = await import('@/pages/app/UserDetailPage');
  return {default: module.UserDetailPage};
});

const RoleManagementPage = lazy(async () => {
  const module = await import('@/pages/app/RoleManagementPage');
  return {default: module.RoleManagementPage};
});

const PermissionManagementPage = lazy(async () => {
  const module = await import('@/pages/app/PermissionManagementPage');
  return {default: module.PermissionManagementPage};
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
    children: authRoutes,
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
        Component: RootUserLayout,
        children: [
          {path: 'user-management', Component: UserManagementPage},
          {path: 'user/:userId', Component: UserDetailPage},
          {
            path: '',
            Component: PCOnlyLayout,
            children: [
              {path: 'import-users', Component: ImportUsersPage},
              {path: 'role-management', Component: RoleManagementPage},
              {
                path: 'permission-management',
                Component: PermissionManagementPage,
              },
            ],
          },
        ],
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
