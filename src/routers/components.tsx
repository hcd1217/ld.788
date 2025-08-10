import { lazy } from 'react';

export const ServiceLayout = lazy(async () => {
  const module = await import('@/components/layouts/ServiceLayout');
  return { default: module.ServiceLayout };
});

export const RootUserLayout = lazy(async () => {
  const module = await import('@/components/layouts/RootUserLayout');
  return { default: module.RootUserLayout };
});

export const MobileOnlyLayout = lazy(async () => {
  const module = await import('@/components/layouts/MobileOnlyLayout');
  return { default: module.MobileOnlyLayout };
});

export const PCOnlyLayout = lazy(async () => {
  const module = await import('@/components/layouts/PCOnlyLayout');
  return { default: module.PCOnlyLayout };
});

export const NotFound = lazy(async () => {
  const module = await import('@/pages/errors/NotFound');
  return { default: module.NotFound };
});

export const ProfilePage = lazy(async () => {
  const module = await import('@/pages/app/ProfilePage');
  return { default: module.ProfilePage };
});

export const BlankPage = lazy(async () => {
  const module = await import('@/pages/app/BlankPage');
  return { default: module.BlankPage };
});

export const CustomerConfigPage = lazy(async () => {
  const module = await import('@/pages/app/config/CustomerConfigPage');
  return { default: module.CustomerConfigPage };
});

export const ProductConfigPage = lazy(async () => {
  const module = await import('@/pages/app/config/ProductConfigPage');
  return { default: module.ProductConfigPage };
});

export const EmployeeListPage = lazy(async () => {
  const module = await import('@/pages/app/employee/EmployeeListPage');
  return { default: module.EmployeeListPage };
});

export const EmployeeCreatePage = lazy(async () => {
  const module = await import('@/pages/app/employee/EmployeeCreatePage');
  return { default: module.EmployeeCreatePage };
});

export const EmployeeDetailPage = lazy(async () => {
  const module = await import('@/pages/app/employee/EmployeeDetailPage');
  return { default: module.EmployeeDetailPage };
});
export const EditEmployeePage = lazy(async () => {
  const module = await import('@/pages/app/employee/EditEmployeePage');
  return { default: module.EditEmployeePage };
});

export const HomePage = lazy(async () => {
  const module = await import('@/pages/app/HomePage');
  return { default: module.HomePage };
});

export const ExplorePage = lazy(async () => {
  const module = await import('@/pages/app/ExplorePage');
  return { default: module.ExplorePage };
});

export const NotificationsPage = lazy(async () => {
  const module = await import('@/pages/app/NotificationPage');
  return { default: module.NotificationsPage };
});

export const MorePage = lazy(async () => {
  const module = await import('@/pages/app/MorePage');
  return { default: module.MorePage };
});

export const UserManagementPage = lazy(async () => {
  const module = await import('@/pages/app/UserManagementPage');
  return { default: module.UserManagementPage };
});

export const AddUserPage = lazy(async () => {
  const module = await import('@/pages/app/AddUserPage');
  return { default: module.AddUserPage };
});

export const ImportUsersPage = lazy(async () => {
  const module = await import('@/pages/app/ImportUsersPage');
  return { default: module.ImportUsersPage };
});

export const UserDetailPage = lazy(async () => {
  const module = await import('@/pages/app/UserDetailPage');
  return { default: module.UserDetailPage };
});

export const RoleManagementPage = lazy(async () => {
  const module = await import('@/pages/app/RoleManagementPage');
  return { default: module.RoleManagementPage };
});

export const PermissionManagementPage = lazy(async () => {
  const module = await import('@/pages/app/PermissionManagementPage');
  return { default: module.PermissionManagementPage };
});

export const StoreListPage = lazy(async () => {
  const module = await import('@/pages/app/StoreListPage');
  return { default: module.StoreListPage };
});

export const StoreConfigPage = lazy(async () => {
  const module = await import('@/pages/app/StoreConfigPage');
  return { default: module.StoreConfigPage };
});

export const StoreEditPage = lazy(async () => {
  const module = await import('@/pages/app/StoreEditPage');
  return { default: module.StoreEditPage };
});

export const StaffListPage = lazy(async () => {
  const module = await import('@/pages/app/StaffListPage');
  return { default: module.StaffListPage };
});

export const AddStaffPage = lazy(async () => {
  const module = await import('@/pages/app/AddStaffPage');
  return { default: module.AddStaffPage };
});

export const EditStaffPage = lazy(async () => {
  const module = await import('@/pages/app/EditStaffPage');
  return { default: module.EditStaffPage };
});

export const POListPage = lazy(async () => {
  const module = await import('@/pages/app/po/POListPage');
  return { default: module.POListPage };
});

export const POCreatePage = lazy(async () => {
  const module = await import('@/pages/app/po/POCreatePage');
  return { default: module.POCreatePage };
});

export const PODetailPage = lazy(async () => {
  const module = await import('@/pages/app/po/PODetailPage');
  return { default: module.PODetailPage };
});

export const EditPOPage = lazy(async () => {
  const module = await import('@/pages/app/po/EditPOPage');
  return { default: module.EditPOPage };
});

export const LoginPage = lazy(async () => {
  const module = await import('@/pages/auth/LoginPage');
  return { default: module.LoginPage };
});

export const ForgotPasswordPage = lazy(async () => {
  const module = await import('@/pages/auth/ForgotPasswordPage');
  return { default: module.ForgotPasswordPage };
});

export const ResetPasswordPage = lazy(async () => {
  const module = await import('@/pages/auth/ResetPasswordPage');
  return { default: module.ResetPasswordPage };
});

export const RegisterPage = lazy(async () => {
  const module = await import('@/pages/auth/RegisterPage');
  return { default: module.RegisterPage };
});

export const MagicLinkLoginPage = lazy(async () => {
  const module = await import('@/pages/auth/MagicLinkLoginPage');
  return { default: module.MagicLinkLoginPage };
});

export const AdminLoginPage = lazy(async () => {
  const module = await import('@/pages/admin/AdminLoginPage');
  return { default: module.AdminLoginPage };
});

export const AdminDashboardPage = lazy(async () => {
  const module = await import('@/pages/admin/AdminDashboardPage');
  return { default: module.AdminDashboardPage };
});

export const TimekeeperDashboardPage = lazy(async () => {
  const module = await import('@/pages/timeKeeper/TimekeeperDashboardPage');
  return { default: module.TimekeeperDashboardPage };
});

export const ClientListPage = lazy(async () => {
  const module = await import('@/pages/admin/ClientListPage');
  return { default: module.ClientListPage };
});

export const ClientCreatePage = lazy(async () => {
  const module = await import('@/pages/admin/ClientCreatePage');
  return { default: module.ClientCreatePage };
});

export const ClientDetailPage = lazy(async () => {
  const module = await import('@/pages/admin/ClientDetailPage');
  return { default: module.ClientDetailPage };
});

export const AdminPermissionManagementPage = lazy(async () => {
  const module = await import('@/pages/admin/PermissionManagementPage');
  return { default: module.PermissionManagementPage };
});
