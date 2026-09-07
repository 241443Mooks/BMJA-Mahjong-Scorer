import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import { BeginnerGuide } from './guide/BeginnerGuide';
import { GameplayBasics } from './guide/GameplayBasics';
import { SpecialHandsCatalogue } from './guide/SpecialHandsCatalogue';
import { AboutPage } from './home/AboutPage';
import { FeaturesPage } from './home/FeaturesPage';
import { HelpPage } from './home/HelpPage';
import { HomePage } from './home/HomePage';
import { HowItWorksPage } from './home/HowItWorksPage';

import './index.css';

const path = window.location.pathname.replace(/\/$/, '') || '/';

function RouteContent() {
  if (path === '/') return <HomePage />;
  if (path === '/game') return <App />;
  if (path === '/hand') return <App initialView="hand" standaloneHand />;

  if (path === '/guide' || path === '/beginner-guide') {
    return <BeginnerGuide onClose={() => window.location.assign('/')} />;
  }

  if (path === '/special-hands' || path === '/special-hand-catalogue') {
    return <SpecialHandsCatalogue />;
  }

  if (path === '/gameplay-basics') return <GameplayBasics />;
  if (path === '/features') return <FeaturesPage />;
  if (path === '/help') return <HelpPage />;
  if (path === '/how-it-works') return <HowItWorksPage />;
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
