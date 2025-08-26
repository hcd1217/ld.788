import { lazy } from 'react';
import { ROUTERS } from '@/config/routeConfig';
import { BlankPage } from './components';

// Lazy load delivery components
const DeliveryListPage = lazy(() =>
  import('@/pages/app/delivery').then((module) => ({ default: module.DeliveryListPage })),
);

const DeliveryDetailPage = lazy(() =>
  import('@/pages/app/delivery').then((module) => ({ default: module.DeliveryDetailPage })),
);

export const deliveryRouteObjects = [
  { path: ROUTERS.DELIVERY_MANAGEMENT, Component: DeliveryListPage },
  { path: ROUTERS.DELIVERY_SCHEDULE, Component: BlankPage },
  { path: ROUTERS.DELIVERY_TRACKING, Component: BlankPage },
  { path: ROUTERS.DELIVERY_DETAIL, Component: DeliveryDetailPage },
];
