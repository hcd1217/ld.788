import { lazy } from 'react';

export const ServiceLayout = lazy(async () => {
  const module = await import('@/components/layouts/ServiceLayout');
  return { default: module.ServiceLayout };
});

export const MobileOnlyLayout = lazy(async () => {
  const module = await import('@/components/layouts/MobileOnlyLayout');
  return { default: module.MobileOnlyLayout };
});

export const PCOnlyLayout = lazy(async () => {
  const module = await import('@/components/layouts/PCOnlyLayout');
  return { default: module.PCOnlyLayout };
});

export const NotFound = lazy(async () => {
  const module = await import('@/pages/errors/NotFound');
  return { default: module.NotFound };
});

export const BlankPage = lazy(async () => {
  const module = await import('@/pages/app/BlankPage');
  return { default: module.BlankPage };
});

export const CustomerConfigPage = lazy(async () => {
  const module = await import('@/pages/app/config/CustomerConfigPage');
  return { default: module.CustomerConfigPage };
});

export const ProductConfigPage = lazy(async () => {
  const module = await import('@/pages/app/config/ProductConfigPage');
  return { default: module.ProductConfigPage };
});

export const HomePage = lazy(async () => {
  const module = await import('@/pages/app/HomePage');
  return { default: module.HomePage };
});

export const POListPage = lazy(async () => {
  const module = await import('@/pages/app/po/POListPage');
  return { default: module.POListPage };
});

export const POCreatePage = lazy(async () => {
  const module = await import('@/pages/app/po/POFormPage');
  return { default: () => module.POFormPage({ mode: 'create' }) };
});

export const PODetailPage = lazy(async () => {
  const module = await import('@/pages/app/po/PODetailPage');
  return { default: module.PODetailPage };
});

export const EditPOPage = lazy(async () => {
  const module = await import('@/pages/app/po/POFormPage');
  return { default: () => module.POFormPage({ mode: 'edit' }) };
});

export const MyTimesheetPage = lazy(async () => {
  const module = await import('@/pages/timeKeeper/MyTimesheetPage');
  return { default: module.MyTimesheetPage };
});

export const ClockManagementPage = lazy(async () => {
  const module = await import('@/pages/timeKeeper/ClockManagementPage');
  return { default: module.ClockManagementPage };
});

export const TimekeeperDashboardPage = lazy(async () => {
  const module = await import('@/pages/timeKeeper/TimekeeperDashboardPage');
  return { default: module.TimekeeperDashboardPage };
});
