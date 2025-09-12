import { ROUTERS } from '@/config/routeConfig';

import { EditPOPage, POCreatePage, PODetailPage, POListPage } from './components';

export const salesRouteObjects = [
  { path: ROUTERS.PO_MANAGEMENT, Component: POListPage },
  { path: ROUTERS.PO_DETAIL, Component: PODetailPage },
  { path: ROUTERS.PO_ADD, Component: POCreatePage },
  { path: ROUTERS.PO_EDIT, Component: EditPOPage },
];
