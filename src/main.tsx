import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';
import i18n from './lib/i18n';
import App from './App.tsx';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import registerGlobalErrorCatcher from '@/utils/errorCatcher';
import { ErrorModal, AppLoader } from '@/components/common';
import { registerLogger } from '@/utils/logger';
import { initializeOrientationLock } from '@/utils/screenOrientation';

// Initialize i18n
void i18n;

// Register global error catcher
const unregisterErrorCatcher = registerGlobalErrorCatcher();

// Cleanup on unload (optional)
window.addEventListener('unload', () => {
  unregisterErrorCatcher();
});

registerLogger();

// Initialize screen orientation lock for PWA
initializeOrientationLock();

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Suspense fallback={<AppLoader />}>
        <Notifications />
        <ModalsProvider>
          <ErrorModal />
          <App />
        </ModalsProvider>
      </Suspense>
    </ThemeProvider>
  </StrictMode>,
);
