import { createRoot } from 'react-dom/client';

import { ErrorBoundary } from '@/components/error-boundary';
import { RouteContent } from './RouteContent';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';
import siteSeo from './site-seo.json';
import { canonicalPublicGamePath } from './game/rules-presentation';

import './index.css';

const path = window.location.pathname.replace(/\/$/, '') || '/';
const { brandName, siteUrl, socialImagePath, webApplication, webSite, routes, aliases } = siteSeo;
const routeMetadata = new Map(routes.map((route) => [route.path, route]));

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) element.setAttribute(attribute, value);
}

function canonicalPathFor(currentPath: string) {
  if (canonicalPublicGamePath(currentPath)) return '/game';
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

const rootElement = document.getElementById('root')!;
if (rootElement.hasChildNodes()) rootElement.replaceChildren();

const renderApplication = () => createRoot(rootElement, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <RouteContent path={path} />
  </ErrorBoundary>,
);

void initialiseCurrentRulesRuntimes().then(renderApplication, (error) => {
  console.error('Unable to initialise current rules runtimes.', error);
  rootElement.textContent = 'Unable to initialise game rules. Please reload and try again.';
});
