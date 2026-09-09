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
import { MahjongRulesComparedPage } from './home/MahjongRulesComparedPage';
import NotFound from './pages/not-found';
import { canonicalPathFor, canonicalUrlFor, publicRoutesByPath, siteSeo } from './seo.mjs';

import './index.css';

const path = window.location.pathname.replace(/\/$/, '') || '/';
function setMeta(selector: string, attribute: string, value: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) element.setAttribute(attribute, value);
}

function applyRouteMetadata() {
  const canonicalPath = canonicalPathFor(path);
  const metadata = publicRoutesByPath[canonicalPath];
  const canonicalUrl = canonicalUrlFor(canonicalPath);

  if (!metadata) {
    document.title = `Page not found | ${siteSeo.name}`;
    setMeta('meta[name="description"]', 'content', `The requested ${siteSeo.name} page could not be found.`);
    setMeta('meta[name="robots"]', 'content', 'noindex, follow');
    setMeta('meta[property="og:title"]', 'content', `Page not found | ${siteSeo.name}`);
    setMeta('meta[property="og:description"]', 'content', `The requested ${siteSeo.name} page could not be found.`);
    setMeta('meta[property="og:url"]', 'content', `${siteSeo.siteUrl}${path}`);
    setMeta('meta[name="twitter:title"]', 'content', `Page not found | ${siteSeo.name}`);
    setMeta('meta[name="twitter:description"]', 'content', `The requested ${siteSeo.name} page could not be found.`);
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `${siteSeo.siteUrl}${path}`;
    return;
  }

  document.title = metadata.title;
  setMeta('meta[name="description"]', 'content', metadata.description);
  setMeta('meta[name="robots"]', 'content', 'index, follow');
  setMeta('meta[property="og:title"]', 'content', metadata.title);
  setMeta('meta[property="og:description"]', 'content', metadata.description);
  setMeta('meta[property="og:url"]', 'content', canonicalUrl);
  setMeta('meta[name="twitter:title"]', 'content', metadata.title);
  setMeta('meta[name="twitter:description"]', 'content', metadata.description);

  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = canonicalUrl;
}

applyRouteMetadata();

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
  if (path === '/mahjong-rules-compared') return <MahjongRulesComparedPage />;
  if (path === '/about') return <AboutPage />;

  return <NotFound />;
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
