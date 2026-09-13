import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import { BeginnerGuide } from './guide/BeginnerGuide';
import { GameplayBasics } from './guide/GameplayBasics';
import { SpecialHandsCatalogue } from './guide/SpecialHandsCatalogue';
import { ScoringExamplesPage } from './guide/ScoringExamplesPage';
import { AboutPage } from './home/AboutPage';
import { FeaturesPage } from './home/FeaturesPage';
import { HelpPage } from './home/HelpPage';
import { HomePage } from './home/HomePage';
import { HowItWorksPage } from './home/HowItWorksPage';
import { MahjongRulesComparedPage } from './home/MahjongRulesComparedPage';
import { MahjongSettlementPage } from './home/MahjongSettlementPage';
import { RulesHubPage, RulesProfilePage } from './rules/RulesReference';
import NotFound from './pages/not-found';
import siteSeo from './site-seo.json';
import { descriptorForSlug, publicRulesSlugFromGamePath } from './game/rules-presentation';

import './index.css';

const path = window.location.pathname.replace(/\/$/, '') || '/';
const { brandName, siteUrl, socialImagePath, webApplication, webSite, routes, aliases } = siteSeo;
const routeMetadata = new Map(routes.map((route) => [route.path, route]));

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) element.setAttribute(attribute, value);
}

function canonicalPathFor(currentPath: string) {
  if (currentPath === '/game/british' || currentPath === '/game/western' || currentPath === '/game/club') return '/game';
  return aliases.find((alias) => alias.path === currentPath)?.target ?? currentPath;
}

function applyStructuredData(canonicalPath: string, description: string) {
  const existing = document.getElementById('site-structured-data');
  if (canonicalPath !== '/') {
    existing?.remove();
    return;
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      webSite,
      { description, url: `${siteUrl}/`, ...webApplication },
    ],
  };
  const script = existing instanceof HTMLScriptElement ? existing : document.createElement('script');
  script.id = 'site-structured-data';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  if (!existing) document.head.append(script);
}

function applyRouteMetadata() {
  const canonicalPath = canonicalPathFor(path);
  const metadata = routeMetadata.get(canonicalPath);
  const canonicalUrl = `${siteUrl}${canonicalPath === '/' ? '/' : canonicalPath}`;

  if (!metadata) {
    document.title = `Page not found | ${brandName}`;
    setMeta('meta[name="description"]', 'content', 'The requested Mahjong Reference page could not be found.');
    setMeta('meta[name="robots"]', 'content', 'noindex, follow');
    setMeta('meta[property="og:title"]', 'content', `Page not found | ${brandName}`);
    setMeta('meta[property="og:description"]', 'content', 'The requested Mahjong Reference page could not be found.');
    setMeta('meta[property="og:url"]', 'content', `${siteUrl}${path}`);
    setMeta('meta[name="twitter:title"]', 'content', `Page not found | ${brandName}`);
    setMeta('meta[name="twitter:description"]', 'content', 'The requested Mahjong Reference page could not be found.');
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `${siteUrl}${path}`;
    applyStructuredData(canonicalPath, '');
    return;
  }

  document.title = metadata.title;
  setMeta('meta[name="description"]', 'content', metadata.description);
  setMeta('meta[name="robots"]', 'content', metadata.indexable ? 'index, follow' : 'noindex, follow');
  setMeta('meta[property="og:title"]', 'content', metadata.title);
  setMeta('meta[property="og:description"]', 'content', metadata.description);
  setMeta('meta[property="og:url"]', 'content', canonicalUrl);
  setMeta('meta[property="og:image"]', 'content', `${siteUrl}${socialImagePath}`);
  setMeta('meta[name="twitter:title"]', 'content', metadata.title);
  setMeta('meta[name="twitter:description"]', 'content', metadata.description);
  setMeta('meta[name="twitter:image"]', 'content', `${siteUrl}${socialImagePath}`);

  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = canonicalUrl;
  applyStructuredData(canonicalPath, metadata.description);
}

function updatePrintGeneratedDate() {
  const heading = document.querySelector<HTMLElement>('.game-print-heading');
  if (!heading) return;

  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  let generatedLine = heading.querySelector<HTMLParagraphElement>('[data-print-generated-date]');
  if (!generatedLine) {
    generatedLine = document.createElement('p');
    generatedLine.dataset.printGeneratedDate = 'true';
    const rulesLine = Array.from(heading.querySelectorAll('p')).find((paragraph) =>
      paragraph.textContent?.startsWith('Rules:'),
    );
    if (rulesLine) heading.insertBefore(generatedLine, rulesLine);
    else heading.append(generatedLine);
  }
  generatedLine.textContent = `Generated ${formattedDate}`;
}

applyRouteMetadata();
window.addEventListener('beforeprint', updatePrintGeneratedDate);

function RouteContent() {
  if (path === '/') return <HomePage />;
  if (path === '/game' || path === '/game/british' || path === '/game/western' || path === '/game/club') return <App initialRulesProfile={descriptorForSlug(publicRulesSlugFromGamePath(path)).profile} />;
  if (path === '/hand') return <App initialView="hand" standaloneHand />;
  if (path === '/scoring-examples') return <ScoringExamplesPage />;

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
  if (path === '/mahjong-settlement') return <MahjongSettlementPage />;
  if (path === '/rules') return <RulesHubPage />;
  if (path === '/rules/british') return <RulesProfilePage slug="british" />;
  if (path === '/rules/western') return <RulesProfilePage slug="western" />;
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
