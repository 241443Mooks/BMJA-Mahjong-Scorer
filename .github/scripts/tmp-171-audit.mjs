import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const appDir = path.join(root, 'artifacts', 'mahjong-scorer');
const dist = path.join(appDir, 'dist', 'public');
const seo = JSON.parse(await readFile(path.join(appDir, 'src', 'site-seo.json'), 'utf8'));
const report = { built: {}, rendered: {}, sitemap: null, robots: null, redirects: null };
const tagCount = (html, pattern) => (html.match(pattern) ?? []).length;
const attr = (html, pattern) => html.match(pattern)?.[1] ?? null;
const textOnly = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const hrefs = (html) => [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((m) => m[1]);

for (const route of seo.routes) {
  const file = route.path === '/' ? path.join(dist, 'index.html') : path.join(dist, `${route.path}.html`);
  const html = await readFile(file, 'utf8');
  const rootHtml = html.match(/<div id=["']root["']>([\s\S]*?)<\/div>/i)?.[1] ?? '';
  report.built[route.path] = {
    titleCount: tagCount(html, /<title>/gi),
    descriptionCount: tagCount(html, /<meta\s+name=["']description["']/gi),
    canonicalCount: tagCount(html, /<link\s+rel=["']canonical["']/gi),
    robotsCount: tagCount(html, /<meta\s+name=["']robots["']/gi),
    canonical: attr(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i),
    robots: attr(html, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i),
    rootTextLength: textOnly(rootHtml).length,
    rootAnchorCount: hrefs(rootHtml).length,
  };
}
report.sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
report.robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
report.redirects = await readFile(path.join(dist, '_redirects'), 'utf8');

const playwrightDir = process.env.PLAYWRIGHT_TOOL_DIR;
if (!playwrightDir) throw new Error('PLAYWRIGHT_TOOL_DIR required');
const requireFromTools = createRequire(path.join(playwrightDir, 'package.json'));
const { chromium } = requireFromTools('playwright');
const vite = spawn('pnpm', ['exec', 'vite', '--config', 'vite.config.ts', '--host', '127.0.0.1', '--port', '4173'], {
  cwd: appDir, env: { ...process.env, PORT: '4173', BASE_PATH: '/' }, stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
vite.stdout.on('data', (c) => output += c.toString());
vite.stderr.on('data', (c) => output += c.toString());
for (let i = 0; i < 80; i += 1) {
  try { const r = await fetch('http://127.0.0.1:4173/'); if (r.ok) break; } catch {}
  if (i === 79) throw new Error(`Vite unavailable\n${output}`);
  await new Promise((r) => setTimeout(r, 250));
}
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const route of seo.routes) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:4173${route.path}`, { waitUntil: 'networkidle' });
    report.rendered[route.path] = await page.evaluate(() => ({
      h1: document.querySelector('h1')?.textContent?.trim() ?? null,
      internalHrefs: [...new Set(Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href')).filter((href) => href?.startsWith('/')))],
      images: Array.from(document.querySelectorAll('main img')).map((img) => ({
        src: img.getAttribute('src'), alt: img.getAttribute('alt'), widthAttr: img.getAttribute('width'), heightAttr: img.getAttribute('height'), naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
      })),
    }));
    await context.close();
  }
} finally {
  await browser?.close();
  vite.kill('SIGTERM');
}
console.log('SEO171_AUDIT=' + JSON.stringify(report));
