import { createBrowserRouter } from 'react-router';
import { lazy } from 'react';
import AppWrapper from '@/components/layouts/app-wrapper.tsx';

/* eslint-disable @typescript-eslint/naming-convention */

// Ref: https://reactrouter.com/start/data/installation
export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppWrapper,
    children: [
      {
        path: '/',
        Component: lazy(async () => import('@/pages/top.tsx')),
      },
      {
        path: '/c-time-keepers',
        Component: lazy(async () => import('@/pages/c-time-keepers.tsx')),
      },
      {
        path: '/sample',
        Component: lazy(async () => import('@/pages/sample.tsx')),
      },
    ],
  },
  {
    path: '/*',
    Component: lazy(async () => import('@/pages/not-found.tsx')),
  },
]);

/* eslint-enable @typescript-eslint/naming-convention */
