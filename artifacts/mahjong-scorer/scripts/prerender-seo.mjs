import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { homepageStructuredData, publicRoutes, siteSeo, socialImageUrl } from '../src/seo.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist/public');
const marker = /<!-- seo:metadata:start -->[\s\S]*?<!-- seo:metadata:end -->/;

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function metadata(route) {
  const url = `${siteSeo.siteUrl}${route.path === '/' ? '/' : route.path}`;
  const escapedTitle = escapeHtml(route.title);
  const escapedDescription = escapeHtml(route.description);
  const structuredData = route.path === '/'
    ? `\n    <script type="application/ld+json">${JSON.stringify(homepageStructuredData)}</script>`
    : '';

  return `<!-- seo:metadata:start -->
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}" />
    <meta name="robots" content="${route.indexable ? 'index, follow' : 'noindex, follow'}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDescription}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${socialImageUrl}" />
    <meta property="og:image:alt" content="${siteSeo.socialImageAlt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDescription}" />
    <meta name="twitter:image" content="${socialImageUrl}" />
    <meta name="twitter:image:alt" content="${siteSeo.socialImageAlt}" />${structuredData}
    <!-- seo:metadata:end -->`;
}

export function sitemapXml() {
  const urls = publicRoutes.filter((route) => route.indexable)
    .map((route) => `  <url><loc>${siteSeo.siteUrl}${route.path === '/' ? '/' : route.path}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function redirects() {
  return `${publicRoutes.flatMap((route) => (route.aliases ?? []).map((alias) => `${alias} ${route.path} 301`)).join('\n')}\n`;
}

export function robotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteSeo.siteUrl}/sitemap.xml\n`;
}

export async function prerenderSeo() {
  const shell = await readFile(path.join(output, 'index.html'), 'utf8');
  if (!marker.test(shell)) throw new Error('SEO metadata markers were not found in the Vite output.');

  for (const route of publicRoutes) {
    const html = shell.replace(marker, metadata(route));
    const destination = route.path === '/' ? path.join(output, 'index.html') : path.join(output, `${route.path}.html`);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, html);
  }

  await writeFile(path.join(output, 'sitemap.xml'), sitemapXml());
  await writeFile(path.join(output, '_redirects'), redirects());
  await writeFile(path.join(output, 'robots.txt'), robotsTxt());
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await prerenderSeo();
}
