import {RouterProvider} from 'react-router';
import {router} from '@/routers';
import {usePWA} from '@/hooks/usePWA';
import {ErrorBoundary, OrientationNotice} from '@/components/common';

function App() {
  usePWA();

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <OrientationNotice />
    </ErrorBoundary>
  );
}

export default App;
