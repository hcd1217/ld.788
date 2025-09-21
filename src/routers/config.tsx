import { lazy } from 'react';

import { ROUTERS } from '@/config/routeConfig';

const CustomerConfigPage = lazy(async () => {
  const module = await import('@/pages/app/config/CustomerConfigPage');
  return { default: module.CustomerConfigPage };
});

const ProductConfigPage = lazy(async () => {
  const module = await import('@/pages/app/config/ProductConfigPage');
  return { default: module.ProductConfigPage };
});

export const configRouteObjects = [
  { path: ROUTERS.PRODUCT_CONFIG, Component: ProductConfigPage },
  { path: ROUTERS.CUSTOMER_CONFIG, Component: CustomerConfigPage },
];
