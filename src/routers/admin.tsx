import { ROUTERS } from '@/config/routeConfig';
import { AdminProtectedRoute } from '@/components/layouts/AdminProtectedRoute';
import {
  AdminLoginPage,
  AdminDashboardPage,
  ClientListPage,
  ClientCreatePage,
  ClientDetailPage,
  AdminPermissionManagementPage,
  PCOnlyLayout,
} from './components';

export const adminRouteObjects = [
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
];
