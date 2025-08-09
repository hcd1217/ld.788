import { ROUTERS } from '@/config/routeConfig';
import {
  StoreListPage,
  StoreConfigPage,
  StoreEditPage,
  StaffListPage,
  AddStaffPage,
  EditStaffPage,
  BlankPage,
  PCOnlyLayout,
} from './components';

export const storeRouteObjects = [
  { path: ROUTERS.STORE_MANAGEMENT, Component: BlankPage },
  { path: ROUTERS.SALARY_MANAGEMENT, Component: BlankPage },
  { path: ROUTERS.STORES, Component: StoreListPage },
  { path: ROUTERS.STAFF, Component: StaffListPage },
  {
    path: '',
    Component: PCOnlyLayout,
    children: [
      { path: ROUTERS.STORE_CONFIG, Component: StoreConfigPage },
      { path: ROUTERS.STORE_EDIT, Component: StoreEditPage },
      { path: ROUTERS.STAFF_ADD, Component: AddStaffPage },
      { path: ROUTERS.STAFF_EDIT, Component: EditStaffPage },
    ],
  },
];
