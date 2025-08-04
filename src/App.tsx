import { RouterProvider } from 'react-router';
import { router } from '@/routers';
import { usePWA } from '@/hooks/usePWA';
import { useClientBranding } from '@/hooks/useClientBranding';
import { ErrorBoundary, OrientationNotice } from '@/components/common';

function App() {
  usePWA();
  useClientBranding();

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <OrientationNotice />
    </ErrorBoundary>
  );
}

export default App;
