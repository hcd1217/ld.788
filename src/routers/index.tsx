import {lazy} from 'react';
import {createBrowserRouter, Navigate, type RouteObject} from 'react-router';
import {ResponsiveAuthLayout} from '@/components/layouts/ResponsiveAuthLayout';
import {AppLayout} from '@/components/layouts/AppLayout';
import {ProtectedRoute} from '@/components/layouts/ProtectedRoute';
import {AdminProtectedRoute} from '@/components/layouts/AdminProtectedRoute';

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

const NotFound = lazy(async () => {
  const module = await import('@/pages/errors/NotFound');
  return {default: module.NotFound};
});

const ProfilePage = lazy(async () => {
  const module = await import('@/pages/app/ProfilePage');
  return {default: module.ProfilePage};
});

const BlankPage = lazy(async () => {
  const module = await import('@/pages/app/BlankPage');
  return {default: module.BlankPage};
});

const EmployeeListPage = lazy(async () => {
  const module = await import('@/pages/app/EmployeeListPage');
  return {default: module.EmployeeListPage};
});

const EmployeeCreatePage = lazy(async () => {
  const module = await import('@/pages/app/EmployeeCreatePage');
  return {default: module.EmployeeCreatePage};
});

const EditEmployeePage = lazy(async () => {
  const module = await import('@/pages/app/EditEmployeePage.tsx');
  return {default: module.EditEmployeePage};
});
const EmployeeDetailPage = lazy(async () => {
  const module = await import('@/pages/app/EmployeeDetailPage');
  return {default: module.EmployeeDetailPage};
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

const StoreEditPage = lazy(async () => {
  const module = await import('@/pages/app/StoreEditPage');
  return {default: module.StoreEditPage};
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

const AdminLoginPage = lazy(async () => {
  const module = await import('@/pages/admin/AdminLoginPage');
  return {default: module.AdminLoginPage};
});

const AdminDashboardPage = lazy(async () => {
  const module = await import('@/pages/admin/AdminDashboardPage');
  return {default: module.AdminDashboardPage};
});

const ClientListPage = lazy(async () => {
  const module = await import('@/pages/admin/ClientListPage');
  return {default: module.ClientListPage};
});

const ClientCreatePage = lazy(async () => {
  const module = await import('@/pages/admin/ClientCreatePage');
  return {default: module.ClientCreatePage};
});

const ClientDetailPage = lazy(async () => {
  const module = await import('@/pages/admin/ClientDetailPage');
  return {default: module.ClientDetailPage};
});

const AdminPermissionManagementPage = lazy(async () => {
  const module = await import('@/pages/admin/PermissionManagementPage');
  return {default: module.PermissionManagementPage};
});

const routeObjects: RouteObject[] = [
  // Root route
  {
    path: '/',
    Component: () => <Navigate to="/login" />,
  },
  // AUTH routes
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
  // APP routes
  {
    path: '',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {path: 'employee-management', Component: EmployeeListPage},
      {path: 'employees/:employeeId', Component: EmployeeDetailPage},
      {path: 'employees/add', Component: EmployeeCreatePage},
    ],
  },
  // Old APP routes
  {
    path: '',
    element: (
      <ProtectedRoute>
        <ResponsiveAuthLayout />
      </ProtectedRoute>
    ),
    children: [
      {path: 'home', Component: HomePage},
      {path: 'profile', Component: ProfilePage},
      {path: 'add-user', Component: AddUserPage},
      {path: 'explore', Component: ExplorePage},
      {path: 'notifications', Component: NotificationsPage},
      {path: 'more', Component: MorePage},
      {
        path: '',
        Component: RootUserLayout,
        children: [
          // {path: 'employee-management', Component: EmployeeListPage},
          // {path: 'employees/:employeeId', Component: EmployeeDetailPage},
          {path: 'store-management', Component: BlankPage},
          {path: 'salary-management', Component: BlankPage},
          {path: 'stores', Component: StoreListPage},
          {path: 'staff', Component: StaffListPage},
          {path: 'user-management', Component: UserManagementPage},
          {path: 'user/:userId', Component: UserDetailPage},
          {
            path: '',
            Component: PCOnlyLayout,
            children: [
              // {path: 'employees/add', Component: EmployeeCreatePage},
              {path: 'employees/edit/:employeeId', Component: EditEmployeePage},
              {path: 'import-users', Component: ImportUsersPage},
              {path: 'role-management', Component: RoleManagementPage},
              {path: 'store-config', Component: StoreConfigPage},
              {path: 'stores/edit/:storeId', Component: StoreEditPage},
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
  // ADMIN routes
  {
    path: 'admin',
    Component: PCOnlyLayout,
    children: [
      {
        path: 'login',
        Component: AdminLoginPage,
      },
      {
        path: '',
        Component: AdminProtectedRoute,
        children: [
          {path: 'dashboard', Component: AdminDashboardPage},
          {path: 'clients', Component: ClientListPage},
          {path: 'clients/new', Component: ClientCreatePage},
          {path: 'clients/:clientCode', Component: ClientDetailPage},
          {path: 'permissions', Component: AdminPermissionManagementPage},
        ],
      },
    ],
  },
  {
    path: '/sample',
    Component: PCOnlyLayout,
    children: [
      {
        path: 'blank-page',
        Component: BlankPage,
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
