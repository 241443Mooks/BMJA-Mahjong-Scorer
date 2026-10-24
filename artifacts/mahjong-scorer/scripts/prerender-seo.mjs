import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist/public');
const marker = /<!-- seo:metadata:start -->[\s\S]*?<!-- seo:metadata:end -->/;
const rootMarker = '<div id="root"></div>';
let seo;
let socialImage;

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

function assertRenderedBody(route, body, profiles) {
  const h1Count = (body.match(/<h1\b/g) ?? []).length;
  const anchorCount = (body.match(/<a\b/g) ?? []).length;
  if (body.length < 100 || h1Count !== 1 || anchorCount < 1) {
    throw new Error(`${route}: prerendered body is incomplete (${body.length} bytes, ${h1Count} h1, ${anchorCount} anchors).`);
  }
  if (/<img\b[^>]*src="(?:file:|\/src\/)/.test(body)) throw new Error(`${route}: prerender contains a development-only image URL.`);
  if (route === '/guide' || route === '/gameplay-basics') {
    const main = body.slice(body.indexOf('<main'), body.indexOf('</main>'));
    if (main.includes('Loading your rules') || !main.includes('Choose the rules your table uses')) throw new Error(`${route}: expected a meaningful neutral guide index.`);
    for (const { slug } of profiles) {
      if (!main.includes(`href="${route}?rules=${slug}"`) || !main.includes(`href="/rules/${slug}"`)) throw new Error(`${route}: missing initial HTML links for ${slug}.`);
    }
  }
}

const shell = await readFile(path.join(output, 'index.html'), 'utf8');
if (!marker.test(shell)) throw new Error('SEO metadata markers were not found in the Vite output.');
if (!shell.includes(rootMarker)) throw new Error('Empty root marker was not found in the Vite output.');

// Prerender the production module graph so asset imports use the same public
// URLs as the client build. Development SSR URLs cannot be shipped as HTML.
await build({
  configFile: path.join(root, 'vite.config.ts'),
  build: {
    ssr: path.join(root, 'src/prerender.tsx'),
    outDir: path.join(root, 'dist/server'),
    copyPublicDir: false,
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: 'prerender.mjs' } },
  },
});
const serverEntry = pathToFileURL(path.join(root, 'dist/server/prerender.mjs')).href;
const { renderRoute, initialiseCurrentRulesRuntimes, siteSeo, PUBLIC_RULES_DESCRIPTORS } = await import(serverEntry);
seo = siteSeo;
socialImage = `${seo.siteUrl}${seo.socialImagePath}`;
await initialiseCurrentRulesRuntimes();
const renderedRoutes = new Map();
for (const route of seo.routes) {
  const body = renderRoute(route.path);
  assertRenderedBody(route.path, body, PUBLIC_RULES_DESCRIPTORS);
  renderedRoutes.set(route.path, body);
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
