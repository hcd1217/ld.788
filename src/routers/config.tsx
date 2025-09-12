import { ROUTERS } from '@/config/routeConfig';

import { CustomerConfigPage, PCOnlyLayout, ProductConfigPage } from './components';

export const configRouteObjects = [
  {
    path: '',
    Component: PCOnlyLayout,
    children: [
      // Customer & Product Config
      { path: ROUTERS.CUSTOMER_CONFIG, Component: CustomerConfigPage },
      { path: ROUTERS.PRODUCT_CONFIG, Component: ProductConfigPage },
    ],
  },
];
