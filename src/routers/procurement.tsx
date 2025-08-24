import { ROUTERS } from '@/config/routeConfig';
import { BlankPage } from './components';

export const procurementRouteObjects = [
  { path: ROUTERS.PROCUREMENT_MANAGEMENT, Component: BlankPage },
  { path: ROUTERS.PROCUREMENT_REQUESTS, Component: BlankPage },
  { path: ROUTERS.PROCUREMENT_ADD, Component: BlankPage },
  { path: ROUTERS.PROCUREMENT_DETAIL, Component: BlankPage },
  { path: ROUTERS.PROCUREMENT_EDIT, Component: BlankPage },
];
