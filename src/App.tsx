import {RouterProvider} from 'react-router';
import {router} from '@/routers';
import {usePWA} from '@/hooks/usePWA';
import {ErrorBoundary} from '@/components/common/ErrorBoundary';
import {OrientationNotice} from '@/components/common/OrientationNotice';

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
