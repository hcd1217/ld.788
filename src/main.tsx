import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import App from './app.tsx';
import registerGlobalErrorCatcher from '@/services/global-error-catcher.ts';
import { registerLogger } from '@/services/logger.ts';

const root = document.querySelector('#root');
if (!root) {
  throw new Error('Root element not found');
}

registerLogger();
registerGlobalErrorCatcher();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
