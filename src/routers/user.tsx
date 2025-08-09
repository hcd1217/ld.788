import { ROUTERS } from '@/config/routeConfig';
import {
  UserManagementPage,
  AddUserPage,
  ImportUsersPage,
  UserDetailPage,
  BlankPage,
  PCOnlyLayout,
} from './components';

export const userRouteObjects = [
  { path: ROUTERS.USER_MANAGEMENT, Component: UserManagementPage },
  { path: ROUTERS.USER_DETAIL, Component: UserDetailPage },
  { path: ROUTERS.ADD_USER, Component: AddUserPage },
  {
    path: '',
    Component: PCOnlyLayout,
    children: [
      { path: ROUTERS.IMPORT_USERS, Component: ImportUsersPage },
      { path: ROUTERS.ROLE_MANAGEMENT, Component: BlankPage },
      { path: ROUTERS.PERMISSION_MANAGEMENT, Component: BlankPage },
    ],
  },
];
