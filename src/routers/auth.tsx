import { ROUTERS } from '@/config/routeConfig';
import { lazy } from 'react';

const LoginPage = lazy(async () => {
  const module = await import('@/pages/auth/LoginPage');
  return { default: module.LoginPage };
});

const LogoutPage = lazy(async () => {
  const module = await import('@/pages/auth/LogoutPage');
  return { default: module.LogoutPage };
});

const MagicLinkLoginPage = lazy(async () => {
  const module = await import('@/pages/auth/MagicLinkLoginPage');
  return { default: module.MagicLinkLoginPage };
});

export const authRouteObjects = [
  {
    path: '',
    children: [
      {
        path: ROUTERS.LOGIN,
        Component: LoginPage,
      },
      {
        path: ROUTERS.MAGIC_LINK,
        Component: MagicLinkLoginPage,
      },
      {
        path: ROUTERS.CLIENT_LOGIN,
        Component: LoginPage,
      },
      {
        path: ROUTERS.LOGOUT,
        Component: LogoutPage,
      },
    ],
  },
];
