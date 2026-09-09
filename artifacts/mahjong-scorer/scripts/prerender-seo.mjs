import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist/public');
const marker = /<!-- seo:metadata:start -->[\s\S]*?<!-- seo:metadata:end -->/;
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

const shell = await readFile(path.join(output, 'index.html'), 'utf8');
if (!marker.test(shell)) throw new Error('SEO metadata markers were not found in the Vite output.');

for (const route of seo.routes) {
  const html = shell.replace(marker, metadata(route));
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
