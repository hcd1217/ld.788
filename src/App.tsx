import { RouterProvider } from 'react-router';

import { DatesProvider } from '@mantine/dates';

import { ErrorBoundary, OrientationNotice } from '@/components/common';
import { useClientBranding } from '@/hooks/useClientBranding';
import { usePWA } from '@/hooks/usePWA';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from '@/routers';

function App() {
  usePWA();
  useClientBranding();
  const { currentLanguage } = useTranslation();
  return (
    <ErrorBoundary>
      <DatesProvider
        settings={{
          locale: currentLanguage,
          firstDayOfWeek: 1,
          weekendDays: [0, 6],
        }}
      >
        <RouterProvider router={router} />
      </DatesProvider>
      <OrientationNotice />
    </ErrorBoundary>
  );
}

export default App;
