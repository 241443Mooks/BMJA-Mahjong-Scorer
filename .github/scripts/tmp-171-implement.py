from pathlib import Path
import json

ROOT = Path.cwd()
APP = ROOT / 'artifacts' / 'mahjong-scorer'


def replace_once(path: Path, old: str, new: str):
    text = path.read_text()
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{path}: expected one guarded match, found {count}')
    path.write_text(text.replace(old, new))

route_content = r'''import App from './App';
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
import NotFound from './pages/not-found';
import { RulesHubPage, RulesProfilePage } from './rules/RulesReference';
import { descriptorForSlug, publicRulesSlugFromGamePath } from './game/rules-presentation';

function returnHome() {
  if (typeof window !== 'undefined') window.location.assign('/');
}

export function RouteContent({ path, prerender = false }: { path: string; prerender?: boolean }) {
  if (path === '/') return <HomePage />;
  if (path === '/game' || path === '/game/british' || path === '/game/western' || path === '/game/club') {
    return <App initialRulesProfile={descriptorForSlug(publicRulesSlugFromGamePath(path)).profile} prerenderOnly={prerender} />;
  }
  if (path === '/hand') return <App initialView="hand" standaloneHand prerenderOnly={prerender} />;
  if (path === '/scoring-examples') return <ScoringExamplesPage />;
  if (path === '/guide' || path === '/beginner-guide') return <BeginnerGuide onClose={returnHome} />;
  if (path === '/special-hands' || path === '/special-hand-catalogue') return <SpecialHandsCatalogue />;
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
'''
(APP / 'src' / 'RouteContent.tsx').write_text(route_content)

prerender_entry = r'''import { renderToString } from 'react-dom/server';
import { RouteContent } from './RouteContent';

export function renderRoute(path: string) {
  return renderToString(<RouteContent path={path} prerender />);
}
'''
(APP / 'src' / 'prerender.tsx').write_text(prerender_entry)

main_tsx = r'''import { createRoot } from 'react-dom/client';

import { ErrorBoundary } from '@/components/error-boundary';
import { RouteContent } from './RouteContent';
import siteSeo from './site-seo.json';

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

const rootElement = document.getElementById('root')!;
if (rootElement.hasChildNodes()) rootElement.replaceChildren();

createRoot(rootElement, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <RouteContent path={path} />
  </ErrorBoundary>,
);
'''
(APP / 'src' / 'main.tsx').write_text(main_tsx)

prerender_script = r'''import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist/public');
const marker = /<!-- seo:metadata:start -->[\s\S]*?<!-- seo:metadata:end -->/;
const rootMarker = '<div id="root"></div>';
const seo = JSON.parse(await readFile(path.join(root, 'src/site-seo.json'), 'utf8'));
const socialImage = `${seo.siteUrl}${seo.socialImagePath}`;

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function metadata({ path: route, title, description, indexable }) {
  const url = `${seo.siteUrl}${route}`;
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const structuredData = route === '/'
    ? `\n    <script id="site-structured-data" type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        seo.webSite,
        { description, url, ...seo.webApplication },
      ],
    })}</script>`
    : '';

  return `<!-- seo:metadata:start -->
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}" />
    <meta name="robots" content="${indexable ? 'index, follow' : 'noindex, follow'}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDescription}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(seo.brandName)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${socialImage}" />
    <meta property="og:image:alt" content="Mahjong Reference" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDescription}" />
    <meta name="twitter:image" content="${socialImage}" />
    <meta name="twitter:image:alt" content="Mahjong Reference" />${structuredData}
    <!-- seo:metadata:end -->`;
}

function assertRenderedBody(route, body) {
  const h1Count = (body.match(/<h1\b/g) ?? []).length;
  const anchorCount = (body.match(/<a\b/g) ?? []).length;
  if (body.length < 100 || h1Count !== 1 || anchorCount < 1) {
    throw new Error(`${route}: prerendered body is incomplete (${body.length} bytes, ${h1Count} h1, ${anchorCount} anchors).`);
  }
}

const shell = await readFile(path.join(output, 'index.html'), 'utf8');
if (!marker.test(shell)) throw new Error('SEO metadata markers were not found in the Vite output.');
if (!shell.includes(rootMarker)) throw new Error('Empty root marker was not found in the Vite output.');

const vite = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});
const renderedRoutes = new Map();
try {
  const { renderRoute } = await vite.ssrLoadModule('/src/prerender.tsx');
  for (const route of seo.routes) {
    const body = renderRoute(route.path);
    assertRenderedBody(route.path, body);
    renderedRoutes.set(route.path, body);
  }
} finally {
  await vite.close();
}

for (const route of seo.routes) {
  const html = shell
    .replace(marker, metadata(route))
    .replace(rootMarker, `<div id="root">${renderedRoutes.get(route.path)}</div>`);
  const destination = route.path === '/' ? path.join(output, 'index.html') : path.join(output, `${route.path}.html`);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, html);
}

const indexableRoutes = seo.routes.filter((route) => route.indexable);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexableRoutes.map((route) => `  <url><loc>${seo.siteUrl}${route.path}</loc></url>`).join('\n')}\n</urlset>\n`;
const redirects = seo.aliases.map((alias) => `${alias.path} ${alias.target} 301`).join('\n');
await writeFile(path.join(output, 'sitemap.xml'), sitemap);
await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${seo.siteUrl}/sitemap.xml\n`);
await writeFile(path.join(output, '_redirects'), `${redirects}\n`);
'''
(APP / 'scripts' / 'prerender-seo.mjs').write_text(prerender_script)

# Keep the normal browser app unchanged while rendering only the active surface during build-time prerendering.
app_path = APP / 'src' / 'App.tsx'
replace_once(
    app_path,
    "export default function App({ initialView = 'game', standaloneHand = false, initialRulesProfile = BMJA_PROFILE_REF }: { initialView?: 'game' | 'hand'; standaloneHand?: boolean; initialRulesProfile?: import('./game').RulesProfileRef }) {",
    "export default function App({ initialView = 'game', standaloneHand = false, initialRulesProfile = BMJA_PROFILE_REF, prerenderOnly = false }: { initialView?: 'game' | 'hand'; standaloneHand?: boolean; initialRulesProfile?: import('./game').RulesProfileRef; prerenderOnly?: boolean }) {",
)
old_views = '''          <div className={view === 'game' ? 'block' : 'hidden'}>\n            <GameScorer\n              onOpenHandScorer={handleOpenHandScorer}\n              returnedScore={returnedScore}\n              onClearReturnedScore={() => setReturnedScore(undefined)}\n              initialRulesProfile={initialRulesProfile}\n            />\n          </div>\n          <div className={view === 'hand' ? 'block' : 'hidden'}>\n            <HandScorer\n              key={scorerSession}\n              context={scorerContext}\n              onClose={handleCloseHandScorer}\n              standaloneHand={standaloneHand}\n              standaloneRulesProfile={standaloneRulesProfile}\n              onStandaloneRulesProfileChange={setStandaloneRulesProfile}\n              example={example}\n              practice={practice && !!example}\n            />\n          </div>'''
new_views = '''          {(!prerenderOnly || view === 'game') && (\n            <div className={view === 'game' ? 'block' : 'hidden'}>\n              <GameScorer\n                onOpenHandScorer={handleOpenHandScorer}\n                returnedScore={returnedScore}\n                onClearReturnedScore={() => setReturnedScore(undefined)}\n                initialRulesProfile={initialRulesProfile}\n              />\n            </div>\n          )}\n          {(!prerenderOnly || view === 'hand') && (\n            <div className={view === 'hand' ? 'block' : 'hidden'}>\n              <HandScorer\n                key={scorerSession}\n                context={scorerContext}\n                onClose={handleCloseHandScorer}\n                standaloneHand={standaloneHand}\n                standaloneRulesProfile={standaloneRulesProfile}\n                onStandaloneRulesProfileChange={setStandaloneRulesProfile}\n                example={example}\n                practice={practice && !!example}\n              />\n            </div>\n          )}'''
replace_once(app_path, old_views, new_views)

# Put the supported-rules reference beside the shared rules picker so both Game and Hand expose it at the relevant task moment.
rules_picker = APP / 'src' / 'game' / 'RulesProfilePicker.tsx'
replace_once(
    rules_picker,
    '''    <div data-testid="rules-at-a-glance" className="mt-4 rounded-lg border border-[#b8cdbf] bg-[#edf3ed] p-4">\n      <div className="font-mono text-[10px] uppercase tracking-[.16em] text-[#477562]">Rules at a glance</div>''',
    '''    <div data-testid="rules-at-a-glance" className="mt-4 rounded-lg border border-[#b8cdbf] bg-[#edf3ed] p-4">\n      <div className="flex flex-wrap items-center justify-between gap-2">\n        <div className="font-mono text-[10px] uppercase tracking-[.16em] text-[#477562]">Rules at a glance</div>\n        <a href="/rules" className="text-[11px] font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Rules reference</a>\n      </div>''',
)

# Strengthen the British learning cluster at the point where players need settlement and worked examples.
guide = APP / 'src' / 'guide' / 'BeginnerGuide.tsx'
replace_once(
    guide,
    '<Callout>You do not need to calculate the transfers yourself. Enter the four hand scores and the game scorer applies the settlement rules for you.</Callout>',
    '<Callout>You do not need to calculate the transfers yourself. Enter the four hand scores in the <a href="/game" className="font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4">game tracker</a> and it applies the settlement rules for you. The <a href="/mahjong-settlement" className="font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4">settlement explainer</a> shows how the hand scores become who-pays-whom transfers.</Callout>',
)
replace_once(
    guide,
    '<p className="mt-3 max-w-[650px] text-[12px] leading-6 text-[#c8d8d1]">Use the scorer as the working tool and this guide as the explanation layer. When a score result teaches you something useful, that is the right moment to learn it.</p>',
    '<p className="mt-3 max-w-[650px] text-[12px] leading-6 text-[#c8d8d1]">Use the <a href="/hand" className="font-semibold text-[#f8f4e9] underline decoration-[#d7a287] underline-offset-4">hand scorer</a> as the working tool and this guide as the explanation layer. When you want to practise the connection, the <a href="/scoring-examples" className="font-semibold text-[#f8f4e9] underline decoration-[#d7a287] underline-offset-4">worked scoring examples</a> use the real scorer.</p>',
)

# Give the comparison page direct, truthful paths into the two public rules references it names.
comparison = APP / 'src' / 'home' / 'MahjongRulesComparedPage.tsx'
replace_once(
    comparison,
    'Looking for the profiles Mahjong Reference can score? The <a className="font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4" href="/rules">supported rules hub</a> covers British / BMJA-style (stable), Western — Thompson &amp; Maloney (provisional), and configured local Club rules. This comparison does not promise scoring support for Hong Kong, Riichi, MCR or American Mahjong.',
    'Looking for the profiles Mahjong Reference can score? The <a className="font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4" href="/rules">supported rules hub</a> covers <a className="font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4" href="/rules/british">British / BMJA-style</a> (stable), <a className="font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4" href="/rules/western">Western — Thompson &amp; Maloney</a> (provisional), and configured local Club rules. This comparison does not promise scoring support for Hong Kong, Riichi, MCR or American Mahjong.',
)

# Align product-global metadata with the settled Table Companion positioning.
seo_path = APP / 'src' / 'site-seo.json'
seo = json.loads(seo_path.read_text())
by_path = {route['path']: route for route in seo['routes']}
by_path['/features']['title'] = 'Mahjong Table Companion Features | Mahjong Reference'
by_path['/features']['description'] = 'Explore whole-game tracking, hand scoring, who-pays-whom settlement, rules-aware play, recovery and printable records in the free browser-based Mahjong Reference Table Companion.'
by_path['/about']['title'] = 'About Mahjong Reference | Mahjong Table Companion'
by_path['/about']['description'] = 'Learn how Mahjong Reference grew from a hand scorer into a rules-aware Mahjong Table Companion, how supported rules are sourced, and how browser-side game data works.'
seo_path.write_text(json.dumps(seo, indent=2, ensure_ascii=False) + '\n')

seo_test = r'''import siteSeo from './site-seo.json';
import { describe, expect, it } from 'vitest';

describe('public SEO configuration', () => {
  it('defines unique canonical, indexable routes', () => {
    const paths = siteSeo.routes.map((route) => route.path);
    const titles = siteSeo.routes.map((route) => route.title);

    expect(siteSeo.routes).toHaveLength(16);
    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(titles).size).toBe(titles.length);
    expect(siteSeo.routes.every((route) => route.indexable)).toBe(true);
    expect(siteSeo.routes.find((route) => route.path === '/')?.title).toContain('Mahjong Table Companion');
    expect(siteSeo.routes.find((route) => route.path === '/hand')?.title).toContain('Mahjong Hand Calculator');
    expect(siteSeo.routes.find((route) => route.path === '/mahjong-settlement')?.title).toContain('Mahjong Settlement Explained');
    expect(siteSeo.routes.find((route) => route.path === '/mahjong-rules-compared')?.title).toContain('British vs Riichi vs Hong Kong vs American Mahjong Rules');
    expect(siteSeo.routes.every((route) => route.title.includes('Mahjong Reference'))).toBe(true);
    expect(siteSeo.webSite.name).toBe('Mahjong Reference');
    expect(siteSeo.webSite.url).toBe(siteSeo.siteUrl);
    expect(siteSeo.webApplication.name).toBe('Mahjong Reference Table Companion');
    expect(siteSeo.webApplication.featureList).toContain('Supported rules profiles for British, Western and club Mahjong contexts');
    expect(siteSeo.routes.find((route) => route.path === '/guide')?.title).toContain('British Mahjong Scoring Guide');
    expect(siteSeo.routes.find((route) => route.path === '/gameplay-basics')?.title).toContain('British Mahjong Gameplay Basics');
    expect(siteSeo.routes.find((route) => route.path === '/rules')?.title).toContain('Mahjong Rules We Support');
    expect(siteSeo.routes.find((route) => route.path === '/rules/british')?.title).toContain('British Mahjong Rules');
    expect(siteSeo.routes.find((route) => route.path === '/rules/western')?.description).toContain('provisional ordinary-rule boundary');
    expect(siteSeo.routes.find((route) => route.path === '/help')?.title).toContain('User Guide & Help');
    expect(siteSeo.routes.find((route) => route.path === '/help')?.description).toContain('Table Companion workflows');
    expect(siteSeo.routes.find((route) => route.path === '/how-it-works')?.title).toContain('Mahjong Table Companion');
    expect(siteSeo.routes.find((route) => route.path === '/features')?.title).toBe('Mahjong Table Companion Features | Mahjong Reference');
    expect(siteSeo.routes.find((route) => route.path === '/features')?.description).toContain('whole-game tracking');
    expect(siteSeo.routes.find((route) => route.path === '/about')?.title).toBe('About Mahjong Reference | Mahjong Table Companion');
    expect(siteSeo.routes.find((route) => route.path === '/about')?.description).toContain('rules-aware Mahjong Table Companion');
  });

  it('keeps product-wide metadata broader than British-only learning content', () => {
    const productWidePaths = ['/', '/features', '/how-it-works', '/help', '/about'];
    for (const path of productWidePaths) {
      const route = siteSeo.routes.find((candidate) => candidate.path === path);
      expect(`${route?.title} ${route?.description}`).not.toContain('British Mahjong Scoring Calculator');
    }
  });

  it('maps aliases to canonical public routes', () => {
    const paths = new Set(siteSeo.routes.map((route) => route.path));

    expect(siteSeo.aliases.every((alias) => paths.has(alias.target))).toBe(true);
  });
});
'''
(APP / 'src' / 'site-seo.test.ts').write_text(seo_test)

prerender_test = r'''import { describe, expect, it } from 'vitest';
import siteSeo from './site-seo.json';
import { renderRoute } from './prerender';

describe('canonical route prerendering', () => {
  for (const route of siteSeo.routes) {
    it(`renders one visible route surface for ${route.path}`, () => {
      const html = renderRoute(route.path);
      expect(html.length).toBeGreaterThan(100);
      expect(html.match(/<h1\b/g) ?? []).toHaveLength(1);
      expect((html.match(/<a\b/g) ?? []).length).toBeGreaterThan(0);
    });
  }
});
'''
(APP / 'src' / 'prerender.test.tsx').write_text(prerender_test)

changelog = ROOT / 'CHANGELOG.md'
replace_once(
    changelog,
    '### Changed\n\n',
    '### Changed\n\n- Aligned final public SEO and crawl output with the settled Table Companion route model, including real prerendered route content, rules-aware product metadata and task-led internal links. [#171](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/171)\n',
)

print('Applied bounded #171 implementation patch.')
