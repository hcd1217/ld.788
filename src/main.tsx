import {StrictMode, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import {MantineProvider} from '@mantine/core';
import {Notifications} from '@mantine/notifications';
import {ModalsProvider} from '@mantine/modals';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';
import i18n from './lib/i18n';
import App from './App.tsx';
import {theme} from '@/theme';
import registerGlobalErrorCatcher from '@/utils/errorCatcher';
import {ErrorModal} from '@/components/common/ErrorModal.tsx';
import {registerLogger} from '@/utils/logger';
import {AppLoader} from '@/components/common/AppLoader.tsx';

// Initialize i18n
void i18n;

// Register global error catcher
const unregisterErrorCatcher = registerGlobalErrorCatcher();

// Cleanup on unload (optional)
window.addEventListener('unload', () => {
  unregisterErrorCatcher();
});

registerLogger();

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Suspense fallback={<AppLoader />}>
        <Notifications />
        <ModalsProvider>
          <ErrorModal />
          <App />
        </ModalsProvider>
      </Suspense>
    </MantineProvider>
  </StrictMode>,
);
