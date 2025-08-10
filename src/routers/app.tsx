import { ROUTERS } from '@/config/routeConfig';
import { ExplorePage, NotificationsPage, MorePage, ProfilePage } from './components';

export const appRouteObjects = [
  { path: ROUTERS.EXPLORE, Component: ExplorePage },
  { path: ROUTERS.NOTIFICATIONS, Component: NotificationsPage },
  { path: ROUTERS.MORE, Component: MorePage },
  { path: ROUTERS.PROFILE, Component: ProfilePage },
];
