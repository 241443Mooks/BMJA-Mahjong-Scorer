import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import { BeginnerGuide } from './guide/BeginnerGuide';
import { SpecialHandsCatalogue } from './guide/SpecialHandsCatalogue';

import './index.css';

const path = window.location.pathname.replace(/\/$/, '') || '/';
const isBeginnerGuide = path === '/guide' || path === '/beginner-guide';
const isSpecialHandsCatalogue = path === '/special-hands' || path === '/special-hand-catalogue';

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    {isBeginnerGuide ? (
      <BeginnerGuide onClose={() => window.location.assign('/')} />
    ) : isSpecialHandsCatalogue ? (
      <SpecialHandsCatalogue />
    ) : (
      <App />
    )}
  </ErrorBoundary>,
);