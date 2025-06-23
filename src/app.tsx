import { RouterProvider } from 'react-router';
import { MantineProvider } from '@mantine/core';
import { router } from './router/index.ts';
import { theme } from './theme/index.ts';
import { Notifications } from '@mantine/notifications';

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <RouterProvider router={router} />
    </MantineProvider>
  );
}
