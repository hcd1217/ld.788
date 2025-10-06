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

const VendorConfigPage = lazy(async () => {
  const module = await import('@/pages/app/config/VendorConfigPage');
  return { default: module.VendorConfigPage };
});

export const configRouteObjects = [
  { path: ROUTERS.PRODUCT_CONFIG, Component: ProductConfigPage },
  { path: ROUTERS.CUSTOMER_CONFIG, Component: CustomerConfigPage },
  { path: ROUTERS.VENDOR_CONFIG, Component: VendorConfigPage },
];
