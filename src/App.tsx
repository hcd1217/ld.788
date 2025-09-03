import { RouterProvider } from 'react-router';
import { router } from '@/routers';
import { usePWA } from '@/hooks/usePWA';
import { useClientBranding } from '@/hooks/useClientBranding';
import { DatesProvider } from '@mantine/dates';
import { ErrorBoundary, OrientationNotice } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';

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
