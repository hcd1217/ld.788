import {RouterProvider} from 'react-router';
import {router} from '@/routers';
import {usePWA} from '@/hooks/usePWA';
import {ErrorBoundary} from '@/components/common/ErrorBoundary';

function App() {
  usePWA();

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
