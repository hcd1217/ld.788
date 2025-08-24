import { ROUTERS } from '@/config/routeConfig';
import { BlankPage } from './components';

export const deliveryRouteObjects = [
  { path: ROUTERS.DELIVERY_MANAGEMENT, Component: BlankPage },
  { path: ROUTERS.DELIVERY_SCHEDULE, Component: BlankPage },
  { path: ROUTERS.DELIVERY_TRACKING, Component: BlankPage },
  { path: ROUTERS.DELIVERY_DETAIL, Component: BlankPage },
];
