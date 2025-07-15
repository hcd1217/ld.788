import {lazy} from 'react';
import {createBrowserRouter, type RouteObject} from 'react-router';
import {AppLayout} from '@/components/layouts/AppLayout';
import {ResponsiveAuthLayout} from '@/components/layouts/ResponsiveAuthLayout';
import {ProtectedRoute} from '@/components/layouts/ProtectedRoute';

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

const StoreListPage = lazy(async () => {
  const module = await import('@/pages/app/StoreListPage');
  return {default: module.StoreListPage};
});

const StoreConfigPage = lazy(async () => {
  const module = await import('@/pages/app/StoreConfigPage');
  return {default: module.StoreConfigPage};
});

const StaffListPage = lazy(async () => {
  const module = await import('@/pages/app/StaffListPage');
  return {default: module.StaffListPage};
});

const AddStaffPage = lazy(async () => {
  const module = await import('@/pages/app/AddStaffPage');
  return {default: module.AddStaffPage};
});

const EditStaffPage = lazy(async () => {
  const module = await import('@/pages/app/EditStaffPage');
  return {default: module.EditStaffPage};
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
              {path: 'stores', Component: StoreListPage},
              {path: 'store-config', Component: StoreConfigPage},
              {path: 'staff', Component: StaffListPage},
              {path: 'staff/add', Component: AddStaffPage},
              {path: 'staff/edit/:staffId', Component: EditStaffPage},
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
