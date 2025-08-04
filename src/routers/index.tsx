import { lazy } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { ResponsiveAuthLayout } from '@/components/layouts/ResponsiveAuthLayout';
import { AppLayout } from '@/components/layouts/AppLayout';
import { ProtectedRoute } from '@/components/layouts/ProtectedRoute';
import { AdminProtectedRoute } from '@/components/layouts/AdminProtectedRoute';
import { ROUTERS } from '@/config/routeConfig';

const ServiceLayout = lazy(async () => {
  const module = await import('@/components/layouts/ServiceLayout');
  return { default: module.ServiceLayout };
});

const RootUserLayout = lazy(async () => {
  const module = await import('@/components/layouts/RootUserLayout');
  return { default: module.RootUserLayout };
});

const PCOnlyLayout = lazy(async () => {
  const module = await import('@/components/layouts/PCOnlyLayout');
  return { default: module.PCOnlyLayout };
});

const NotFound = lazy(async () => {
  const module = await import('@/pages/errors/NotFound');
  return { default: module.NotFound };
});

const ProfilePage = lazy(async () => {
  const module = await import('@/pages/app/ProfilePage');
  return { default: module.ProfilePage };
});

const BlankPage = lazy(async () => {
  const module = await import('@/pages/app/BlankPage');
  return { default: module.BlankPage };
});

const EmployeeListPage = lazy(async () => {
  const module = await import('@/pages/app/employee/EmployeeListPage');
  return { default: module.EmployeeListPage };
});

const EmployeeCreatePage = lazy(async () => {
  const module = await import('@/pages/app/employee/EmployeeCreatePage');
  return { default: module.EmployeeCreatePage };
});

const EmployeeDetailPage = lazy(async () => {
  const module = await import('@/pages/app/employee/EmployeeDetailPage');
  return { default: module.EmployeeDetailPage };
});
const EditEmployeePage = lazy(async () => {
  const module = await import('@/pages/app/employee/EditEmployeePage');
  return { default: module.EditEmployeePage };
});

const HomePage = lazy(async () => {
  const module = await import('@/pages/app/HomePage');
  return { default: module.HomePage };
});

const ExplorePage = lazy(async () => {
  const module = await import('@/pages/app/ExplorePage');
  return { default: module.ExplorePage };
});

const NotificationsPage = lazy(async () => {
  const module = await import('@/pages/app/NotificationPage');
  return { default: module.NotificationsPage };
});

const MorePage = lazy(async () => {
  const module = await import('@/pages/app/MorePage');
  return { default: module.MorePage };
});

const UserManagementPage = lazy(async () => {
  const module = await import('@/pages/app/UserManagementPage');
  return { default: module.UserManagementPage };
});

const AddUserPage = lazy(async () => {
  const module = await import('@/pages/app/AddUserPage');
  return { default: module.AddUserPage };
});

const ImportUsersPage = lazy(async () => {
  const module = await import('@/pages/app/ImportUsersPage');
  return { default: module.ImportUsersPage };
});

const UserDetailPage = lazy(async () => {
  const module = await import('@/pages/app/UserDetailPage');
  return { default: module.UserDetailPage };
});

const RoleManagementPage = lazy(async () => {
  const module = await import('@/pages/app/RoleManagementPage');
  return { default: module.RoleManagementPage };
});

const PermissionManagementPage = lazy(async () => {
  const module = await import('@/pages/app/PermissionManagementPage');
  return { default: module.PermissionManagementPage };
});

const StoreListPage = lazy(async () => {
  const module = await import('@/pages/app/StoreListPage');
  return { default: module.StoreListPage };
});

const StoreConfigPage = lazy(async () => {
  const module = await import('@/pages/app/StoreConfigPage');
  return { default: module.StoreConfigPage };
});

const StoreEditPage = lazy(async () => {
  const module = await import('@/pages/app/StoreEditPage');
  return { default: module.StoreEditPage };
});

const StaffListPage = lazy(async () => {
  const module = await import('@/pages/app/StaffListPage');
  return { default: module.StaffListPage };
});

const AddStaffPage = lazy(async () => {
  const module = await import('@/pages/app/AddStaffPage');
  return { default: module.AddStaffPage };
});

const EditStaffPage = lazy(async () => {
  const module = await import('@/pages/app/EditStaffPage');
  return { default: module.EditStaffPage };
});

const POListPage = lazy(async () => {
  const module = await import('@/pages/app/po/POListPage');
  return { default: module.POListPage };
});

const POCreatePage = lazy(async () => {
  const module = await import('@/pages/app/po/POCreatePage');
  return { default: module.POCreatePage };
});

const PODetailPage = lazy(async () => {
  const module = await import('@/pages/app/po/PODetailPage');
  return { default: module.PODetailPage };
});

const EditPOPage = lazy(async () => {
  const module = await import('@/pages/app/po/EditPOPage');
  return { default: module.EditPOPage };
});

const LoginPage = lazy(async () => {
  const module = await import('@/pages/auth/LoginPage');
  return { default: module.LoginPage };
});

const ForgotPasswordPage = lazy(async () => {
  const module = await import('@/pages/auth/ForgotPasswordPage');
  return { default: module.ForgotPasswordPage };
});

const ResetPasswordPage = lazy(async () => {
  const module = await import('@/pages/auth/ResetPasswordPage');
  return { default: module.ResetPasswordPage };
});

const RegisterPage = lazy(async () => {
  const module = await import('@/pages/auth/RegisterPage');
  return { default: module.RegisterPage };
});

const MagicLinkLoginPage = lazy(async () => {
  const module = await import('@/pages/auth/MagicLinkLoginPage');
  return { default: module.MagicLinkLoginPage };
});

const AdminLoginPage = lazy(async () => {
  const module = await import('@/pages/admin/AdminLoginPage');
  return { default: module.AdminLoginPage };
});

const AdminDashboardPage = lazy(async () => {
  const module = await import('@/pages/admin/AdminDashboardPage');
  return { default: module.AdminDashboardPage };
});

const ClientListPage = lazy(async () => {
  const module = await import('@/pages/admin/ClientListPage');
  return { default: module.ClientListPage };
});

const ClientCreatePage = lazy(async () => {
  const module = await import('@/pages/admin/ClientCreatePage');
  return { default: module.ClientCreatePage };
});

const ClientDetailPage = lazy(async () => {
  const module = await import('@/pages/admin/ClientDetailPage');
  return { default: module.ClientDetailPage };
});

const AdminPermissionManagementPage = lazy(async () => {
  const module = await import('@/pages/admin/PermissionManagementPage');
  return { default: module.PermissionManagementPage };
});

const routeObjects: RouteObject[] = [
  // Root route
  {
    path: ROUTERS.ROOT,
    Component: () => <Navigate to={ROUTERS.LOGIN} />,
  },
  // AUTH routes
  {
    path: '',
    children: [
      {
        path: ROUTERS.LOGIN,
        Component: LoginPage,
      },
      {
        path: ROUTERS.MAGIC_LINK,
        Component: MagicLinkLoginPage,
      },
      {
        path: ROUTERS.CLIENT_LOGIN,
        Component: LoginPage,
      },
      {
        path: ROUTERS.FORGOT_PASSWORD,
        Component: ForgotPasswordPage,
      },
      {
        path: ROUTERS.RESET_PASSWORD,
        Component: ResetPasswordPage,
      },
      {
        path: ROUTERS.REGISTER,
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
      { path: ROUTERS.HOME, Component: HomePage },
      { path: ROUTERS.EMPLOYEE_MANAGEMENT, Component: EmployeeListPage },
      { path: ROUTERS.EMPLOYEE_DETAIL, Component: EmployeeDetailPage },
      { path: ROUTERS.EMPLOYEE_EDIT, Component: EditEmployeePage },
      { path: ROUTERS.EMPLOYEES_ADD, Component: EmployeeCreatePage },
      { path: ROUTERS.CUSTOMER_MANAGEMENT, Component: BlankPage },
      { path: ROUTERS.CUSTOMER_DETAIL, Component: BlankPage },
      { path: ROUTERS.CUSTOMER_ADD, Component: BlankPage },
      { path: ROUTERS.CUSTOMER_EDIT, Component: BlankPage },
      { path: ROUTERS.PO_MANAGEMENT, Component: POListPage },
      { path: ROUTERS.PO_DETAIL, Component: PODetailPage },
      { path: ROUTERS.PO_ADD, Component: POCreatePage },
      { path: ROUTERS.PO_EDIT, Component: EditPOPage },
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
      { path: ROUTERS.PROFILE, Component: ProfilePage },
      { path: ROUTERS.ADD_USER, Component: AddUserPage },
      { path: ROUTERS.EXPLORE, Component: ExplorePage },
      { path: ROUTERS.NOTIFICATIONS, Component: NotificationsPage },
      { path: ROUTERS.MORE, Component: MorePage },
      {
        path: '',
        Component: RootUserLayout,
        children: [
          // {path: 'employee-management', Component: EmployeeListPage},
          // {path: 'employees/:employeeId', Component: EmployeeDetailPage},
          { path: ROUTERS.STORE_MANAGEMENT, Component: BlankPage },
          { path: ROUTERS.SALARY_MANAGEMENT, Component: BlankPage },
          { path: ROUTERS.STORES, Component: StoreListPage },
          { path: ROUTERS.STAFF, Component: StaffListPage },
          { path: ROUTERS.USER_MANAGEMENT, Component: UserManagementPage },
          { path: ROUTERS.USER_DETAIL, Component: UserDetailPage },
          {
            path: '',
            Component: PCOnlyLayout,
            children: [
              { path: ROUTERS.IMPORT_USERS, Component: ImportUsersPage },
              { path: ROUTERS.ROLE_MANAGEMENT, Component: RoleManagementPage },
              { path: ROUTERS.STORE_CONFIG, Component: StoreConfigPage },
              { path: ROUTERS.STORE_EDIT, Component: StoreEditPage },
              { path: ROUTERS.STAFF_ADD, Component: AddStaffPage },
              { path: ROUTERS.STAFF_EDIT, Component: EditStaffPage },
              {
                path: ROUTERS.PERMISSION_MANAGEMENT,
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
    path: '',
    Component: PCOnlyLayout,
    children: [
      {
        path: ROUTERS.ADMIN_LOGIN,
        Component: AdminLoginPage,
      },
      {
        path: '',
        Component: AdminProtectedRoute,
        children: [
          {
            path: ROUTERS.ADMIN_DASHBOARD,
            Component: AdminDashboardPage,
          },
          { path: ROUTERS.ADMIN_CLIENTS, Component: ClientListPage },
          {
            path: ROUTERS.ADMIN_CLIENTS_NEW,
            Component: ClientCreatePage,
          },
          {
            path: ROUTERS.ADMIN_CLIENT_DETAIL,
            Component: ClientDetailPage,
          },
          {
            path: ROUTERS.ADMIN_PERMISSIONS,
            Component: AdminPermissionManagementPage,
          },
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
