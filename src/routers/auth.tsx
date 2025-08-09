import { ROUTERS } from '@/config/routeConfig';
import {
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  RegisterPage,
  MagicLinkLoginPage,
} from './components';

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
        path: ROUTERS.FORGOT_PASSWORD,
        Component: ForgotPasswordPage,
      },
      {
        path: ROUTERS.RESET_PASSWORD,
        Component: ResetPasswordPage,
      },
      {
        path: ROUTERS.REGISTER,
        Component: RegisterPage,
      },
    ],
  },
];
