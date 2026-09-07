import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import { BeginnerGuide } from './guide/BeginnerGuide';
import { SpecialHandsCatalogue } from './guide/SpecialHandsCatalogue';
import { AboutPage } from './home/AboutPage';
import { HomePage } from './home/HomePage';
import { ComingSoonPage } from './home/ComingSoonPage';

import './index.css';

const path = window.location.pathname.replace(/\/$/, '') || '/';

function StandaloneHandRoute() {
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const button = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
        (candidate) => candidate.textContent?.trim() === 'Detailed hand scorer',
      );
      button?.click();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return <App />;
}

function RouteContent() {
  if (path === '/') return <HomePage />;
  if (path === '/game') return <App />;
  if (path === '/hand') return <StandaloneHandRoute />;

  if (path === '/guide' || path === '/beginner-guide') {
    return <BeginnerGuide onClose={() => window.location.assign('/')} />;
  }

  if (path === '/special-hands' || path === '/special-hand-catalogue') {
    return <SpecialHandsCatalogue />;
  }

  if (path === '/gameplay-basics') {
    return (
      <ComingSoonPage
        kind="guide"
        title="Gameplay basics"
        description="A practical guide to the tiles, dealing, drawing and discarding, claiming, Kongs, Winds and how a British Mahjong game progresses."
      />
    );
  }

  if (path === '/about') return <AboutPage />;

  return <HomePage />;
}

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <RouteContent />
  </ErrorBoundary>,
);
