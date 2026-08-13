import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app.tsx';
import '@fontsource-variable/plus-jakarta-sans/index.css';
import { registerServiceWorker } from '~/pwa/push';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

await registerServiceWorker();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
