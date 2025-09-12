import { lazy } from 'react';

import { ROUTERS } from '@/config/routeConfig';

const MorePage = lazy(async () => {
  const module = await import('@/pages/app/MorePage');
  return { default: module.MorePage };
});

const ProfilePage = lazy(async () => {
  const module = await import('@/pages/app/ProfilePage');
  return { default: module.ProfilePage };
});

const NotificationsPage = lazy(async () => {
  const module = await import('@/pages/app/NotificationPage');
  return { default: module.NotificationsPage };
});

export const appRouteObjects = [
  { path: ROUTERS.MORE, Component: MorePage },
  { path: ROUTERS.PROFILE, Component: ProfilePage },
  { path: ROUTERS.NOTIFICATIONS, Component: NotificationsPage },
];
