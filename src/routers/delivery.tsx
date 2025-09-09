import { lazy } from 'react';
import { ROUTERS } from '@/config/routeConfig';
import { PCOnlyLayout } from './components';

// Lazy load delivery components
const DeliveryListPage = lazy(() =>
  import('@/pages/app/delivery').then((module) => ({ default: module.DeliveryListPage })),
);

const DeliveryDetailPage = lazy(() =>
  import('@/pages/app/delivery').then((module) => ({ default: module.DeliveryDetailPage })),
);

const UpdateDeliveryOrderPage = lazy(() =>
  import('@/pages/app/delivery').then((module) => ({ default: module.UpdateDeliveryOrderPage })),
);

export const deliveryRouteObjects = [
  { path: ROUTERS.DELIVERY_MANAGEMENT, Component: DeliveryListPage },
  { path: ROUTERS.DELIVERY_DETAIL, Component: DeliveryDetailPage },
  {
    Component: PCOnlyLayout,
    children: [{ path: ROUTERS.DELIVERY_UPDATE_ORDER, Component: UpdateDeliveryOrderPage }],
  },
];
