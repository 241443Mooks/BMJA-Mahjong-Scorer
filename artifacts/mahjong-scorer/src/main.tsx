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
import NotFound from './pages/not-found';

import './index.css';

const path = window.location.pathname.replace(/\/$/, '') || '/';
const siteUrl = 'https://mahjong.smooks.co.uk';

const routeMetadata: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'British Mahjong Scorer | Score Games & Hands',
    description: 'Score British Mahjong games and individual hands, track settlements, and learn British rules as you play.',
  },
  '/game': {
    title: 'Score a British Mahjong Game | British Mahjong Scorer',
    description: 'Track four players hand by hand, calculate settlement, keep running balances and save the finished British Mahjong game record.',
  },
  '/hand': {
    title: 'Score a British Mahjong Hand | British Mahjong Scorer',
    description: 'Build a British Mahjong hand visually and calculate supported points, doubles, patterns, special hands and fishing.',
  },
  '/gameplay-basics': {
    title: 'British Mahjong Gameplay Basics | British Mahjong Scorer',
    description: 'Learn the basic flow of British Mahjong, including tiles, turns, calls, winning and the table structure.',
  },
  '/guide': {
    title: 'British Mahjong Scoring Guide | British Mahjong Scorer',
    description: 'Learn British Mahjong scoring in plain English, with points, doubles, winning hands and practical examples.',
  },
  '/special-hands': {
    title: 'British Mahjong Special Hands | British Mahjong Scorer',
    description: 'Browse supported British Mahjong special hands with visual examples and plain-English explanations.',
  },
  '/features': {
    title: 'British Mahjong Scorer Features',
    description: 'See how British Mahjong Scorer handles full games, detailed and partial hands, explanations, recovery and printable game records.',
  },
  '/how-it-works': {
    title: 'How British Mahjong Scorer Works',
    description: 'See how the scorer moves from game context and tile evidence to scoring, explanations, settlement and the final game record.',
  },
  '/help': {
    title: 'British Mahjong Scorer Help',
    description: 'Get practical help with scoring games and hands, partial evidence, special situations, recovery, settlement and saving a game record.',
  },
  '/about': {
    title: 'About British Mahjong Scorer',
    description: 'Learn why British Mahjong Scorer exists, which rules it uses, how uncertainty is handled and how browser-side game data works.',
  },
};

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) element.setAttribute(attribute, value);
}

function canonicalPathFor(currentPath: string) {
  if (currentPath === '/beginner-guide') return '/guide';
  if (currentPath === '/special-hand-catalogue') return '/special-hands';
  return currentPath;
}

function applyRouteMetadata() {
  const canonicalPath = canonicalPathFor(path);
  const metadata = routeMetadata[canonicalPath];
  const canonicalUrl = `${siteUrl}${canonicalPath === '/' ? '/' : canonicalPath}`;

  if (!metadata) {
    document.title = 'Page not found | British Mahjong Scorer';
    setMeta('meta[name="description"]', 'content', 'The requested British Mahjong Scorer page could not be found.');
    setMeta('meta[name="robots"]', 'content', 'noindex, follow');
    setMeta('meta[property="og:title"]', 'content', 'Page not found | British Mahjong Scorer');
    setMeta('meta[property="og:description"]', 'content', 'The requested British Mahjong Scorer page could not be found.');
    setMeta('meta[property="og:url"]', 'content', `${siteUrl}${path}`);
    setMeta('meta[name="twitter:title"]', 'content', 'Page not found | British Mahjong Scorer');
    setMeta('meta[name="twitter:description"]', 'content', 'The requested British Mahjong Scorer page could not be found.');
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `${siteUrl}${path}`;
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
