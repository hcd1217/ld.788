import {lazy} from 'react';
import {type RouteObject} from 'react-router';
import {LoginPage} from '@/pages/auth/LoginPage';

// Auth page lazy loading with prefetch hints (except LoginPage for better UX)

const ForgotPasswordPage = lazy(async () => {
  const module = await import('@/pages/auth/ForgotPasswordPage');
  return {default: module.ForgotPasswordPage};
});

const ResetPasswordPage = lazy(async () => {
  const module = await import('@/pages/auth/ResetPasswordPage');
  return {default: module.ResetPasswordPage};
});

const RegisterPage = lazy(async () => {
  const module = await import('@/pages/auth/RegisterPage');
  return {default: module.RegisterPage};
});

// Prefetch hints for auth routes
const prefetchAuthRoutes = () => {
  // Prefetch likely next pages based on current route
  const currentPath = globalThis.location.pathname;

  if (currentPath.includes('login')) {
    // From login, users might go to register or forgot password
    import('@/pages/auth/RegisterPage');
    import('@/pages/auth/ForgotPasswordPage');
  } else if (currentPath.includes('register')) {
    // From register, users might go to login
    import('@/pages/auth/LoginPage');
  } else if (currentPath.includes('forgot-password')) {
    // From forgot password, users might go to login
    import('@/pages/auth/LoginPage');
  } else if (currentPath.includes('reset-password')) {
    // From reset password, users might go to login
    import('@/pages/auth/LoginPage');
  }
};

// Initialize prefetch hints on idle
if ('requestIdleCallback' in globalThis) {
  requestIdleCallback(prefetchAuthRoutes);
} else {
  setTimeout(prefetchAuthRoutes, 1000);
}

export const authRoutes: RouteObject[] = [
  {
    path: 'login',
    Component: LoginPage,
  },
  {
    path: '/:clientCode/login',
    Component: LoginPage,
  },
  {
    path: 'forgot-password',
    Component: ForgotPasswordPage,
  },
  {
    path: 'reset-password',
    Component: ResetPasswordPage,
  },
  {
    path: 'register',
    Component: RegisterPage,
  },
];

export {LoginPage, ForgotPasswordPage, ResetPasswordPage, RegisterPage};
