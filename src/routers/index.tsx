import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { ResponsiveAuthLayout } from '@/components/layouts/ResponsiveAuthLayout';
import { AppLayout } from '@/components/layouts/AppLayout';
import { ProtectedRoute } from '@/components/layouts/ProtectedRoute';
import { AdminProtectedRoute } from '@/components/layouts/AdminProtectedRoute';
import { ROUTERS } from '@/config/routeConfig';
import {
  ServiceLayout,
  RootUserLayout,
  PCOnlyLayout,
  NotFound,
  ProfilePage,
  BlankPage,
  CustomerConfigPage,
  ProductConfigPage,
  EmployeeListPage,
  EmployeeCreatePage,
  EmployeeDetailPage,
  EditEmployeePage,
  HomePage,
  ExplorePage,
  NotificationsPage,
  MorePage,
  UserManagementPage,
  AddUserPage,
  ImportUsersPage,
  UserDetailPage,
  // RoleManagementPage,
  // PermissionManagementPage,
  StoreListPage,
  StoreConfigPage,
  StoreEditPage,
  StaffListPage,
  AddStaffPage,
  EditStaffPage,
  POListPage,
  POCreatePage,
  PODetailPage,
  EditPOPage,
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  RegisterPage,
  MagicLinkLoginPage,
  AdminLoginPage,
  AdminDashboardPage,
  ClientListPage,
  ClientCreatePage,
  ClientDetailPage,
  AdminPermissionManagementPage,
} from './components';

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
      // CONFIG routes
      { path: ROUTERS.CUSTOMER_CONFIG, Component: CustomerConfigPage },
      { path: ROUTERS.PRODUCT_CONFIG, Component: ProductConfigPage },
      { path: ROUTERS.EMPLOYEE_MANAGEMENT, Component: EmployeeListPage },
      { path: ROUTERS.EMPLOYEE_DETAIL, Component: EmployeeDetailPage },
      { path: ROUTERS.EMPLOYEE_EDIT, Component: EditEmployeePage },
      { path: ROUTERS.EMPLOYEES_ADD, Component: EmployeeCreatePage },
      { path: ROUTERS.CUSTOMER_MANAGEMENT, Component: BlankPage },
      { path: ROUTERS.CUSTOMER_DETAIL, Component: BlankPage },
      { path: ROUTERS.CUSTOMER_ADD, Component: BlankPage },
      { path: ROUTERS.CUSTOMER_EDIT, Component: BlankPage },
      { path: ROUTERS.PRODUCT_MANAGEMENT, Component: BlankPage },
      { path: ROUTERS.PRODUCT_DETAIL, Component: BlankPage },
      { path: ROUTERS.PRODUCT_ADD, Component: BlankPage },
      { path: ROUTERS.PRODUCT_EDIT, Component: BlankPage },
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
              // { path: ROUTERS.ROLE_MANAGEMENT, Component: RoleManagementPage },
              { path: ROUTERS.ROLE_MANAGEMENT, Component: BlankPage },
              { path: ROUTERS.STORE_CONFIG, Component: StoreConfigPage },
              { path: ROUTERS.STORE_EDIT, Component: StoreEditPage },
              { path: ROUTERS.STAFF_ADD, Component: AddStaffPage },
              { path: ROUTERS.STAFF_EDIT, Component: EditStaffPage },
              {
                path: ROUTERS.PERMISSION_MANAGEMENT,
                // Component: PermissionManagementPage,
                Component: BlankPage,
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
