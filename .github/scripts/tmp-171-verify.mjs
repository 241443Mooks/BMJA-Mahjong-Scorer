import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const appDir = path.join(root, 'artifacts', 'mahjong-scorer');
const output = path.join(appDir, 'dist', 'public');
const seo = JSON.parse(await readFile(path.join(appDir, 'src', 'site-seo.json'), 'utf8'));

function count(html, pattern) {
  return (html.match(pattern) ?? []).length;
}
function expect(condition, message) {
  if (!condition) throw new Error(message);
}
function routeFile(route) {
  return route === '/' ? path.join(output, 'index.html') : path.join(output, `${route}.html`);
}
const built = new Map();
for (const route of seo.routes) {
  const file = routeFile(route.path);
  const html = await readFile(file, 'utf8');
  built.set(route.path, html);
  const canonical = `${seo.siteUrl}${route.path}`;
  expect(count(html, /<title>/gi) === 1, `${route.path}: title count`);
  expect(count(html, /<meta\s+name="description"/gi) === 1, `${route.path}: description count`);
  expect(count(html, /<link\s+rel="canonical"/gi) === 1, `${route.path}: canonical count`);
  expect(count(html, /<meta\s+name="robots"/gi) === 1, `${route.path}: robots count`);
  expect(count(html, /<h1\b/gi) === 1, `${route.path}: expected exactly one prerendered h1`);
  expect(count(html, /<a\b/gi) >= 1, `${route.path}: expected prerendered internal navigation`);
  expect(html.includes(`href="${canonical}"`), `${route.path}: canonical URL mismatch`);
  expect(html.includes('content="index, follow"'), `${route.path}: expected index, follow`);
  expect(!html.includes('<div id="root"></div>'), `${route.path}: empty Vite root survived`);
  const info = await stat(file);
  expect(info.size < 300_000, `${route.path}: prerendered HTML unexpectedly large (${info.size})`);
}

const hrefChecks = [
  ['/game', ['/rules']],
  ['/hand', ['/rules', '/game', '/mahjong-settlement']],
  ['/mahjong-settlement', ['/game']],
  ['/rules', ['/rules/british', '/rules/western', '/mahjong-rules-compared']],
  ['/guide', ['/game', '/mahjong-settlement', '/scoring-examples', '/hand']],
  ['/mahjong-rules-compared', ['/rules/british', '/rules/western', '/game/british']],
];
for (const [route, hrefs] of hrefChecks) {
  const html = built.get(route);
  for (const href of hrefs) expect(html.includes(`href="${href}"`), `${route}: missing task-led link ${href}`);
}

const features = seo.routes.find((route) => route.path === '/features');
const about = seo.routes.find((route) => route.path === '/about');
const western = seo.routes.find((route) => route.path === '/rules/western');
expect(features?.title === 'Mahjong Table Companion Features | Mahjong Reference', 'Features metadata is stale');
expect(about?.title === 'About Mahjong Reference | Mahjong Table Companion', 'About metadata is stale');
expect(western?.description.includes('provisional ordinary-rule boundary'), 'Western provisional boundary was lost');

const how = built.get('/how-it-works');
for (const family of [
  'game-setup',
  'hand-builder-ordinary',
  'hand-score-result',
  'hand-score-breakdown',
  'game-settlement-preview',
  'game-table-score-entry',
  'game-ledger-settlement',
  'print-save',
]) {
  for (const view of ['mobile', 'tablet', 'desktop']) {
    expect(how.includes(`/help/screenshots/${family}-${view}.png`), `/how-it-works: missing ${family}-${view}`);
  }
}
expect(!/<img\b[^>]*\balt=""[^>]*help\/screenshots/i.test(how), '/how-it-works: empty screenshot alt text');

const sitemap = await readFile(path.join(output, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedUrls = seo.routes.filter((route) => route.indexable).map((route) => `${seo.siteUrl}${route.path}`);
expect(JSON.stringify(sitemapUrls) === JSON.stringify(expectedUrls), 'Sitemap does not exactly match the canonical route registry');

const robots = await readFile(path.join(output, 'robots.txt'), 'utf8');
expect(robots === `User-agent: *\nAllow: /\n\nSitemap: ${seo.siteUrl}/sitemap.xml\n`, 'robots.txt drifted');
const redirects = await readFile(path.join(output, '_redirects'), 'utf8');
const expectedRedirects = `${seo.aliases.map((alias) => `${alias.path} ${alias.target} 301`).join('\n')}\n`;
expect(redirects === expectedRedirects, '_redirects drifted from aliases');

console.log(`Verified ${seo.routes.length} prerendered canonical routes, sitemap, robots, redirects, screenshots and task-led link targets.`);
