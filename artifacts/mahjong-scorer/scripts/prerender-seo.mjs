import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteUrl = 'https://mahjong.smooks.co.uk';
const socialImage = `${siteUrl}/british-mahjong-scorer-social-preview.jpg`;
const routes = [
  ['/', 'British Mahjong Scorer | Score Games & Hands', 'Score British Mahjong games and individual hands, track settlements, and learn British rules as you play.'],
  ['/game', 'British Mahjong Game Scorer | Track a Full Game', 'Score a British Mahjong game for four players, calculate settlements, follow winds and keep a running ledger.'],
  ['/hand', 'British Mahjong Hand Scorer | Calculate Your Score', 'Build a British Mahjong hand, calculate points and doubles, and see clear explanations of detected scoring patterns.'],
  ['/gameplay-basics', 'How to Play British Mahjong | Beginner Guide', 'Learn the basics of British Mahjong: winds, dealing, turns, Chows, Pungs, Kongs, Flowers, Seasons and how a hand ends.'],
  ['/guide', 'British Mahjong Scoring Guide | Points, Doubles & Fishing', 'A beginner-friendly guide to British Mahjong scoring, including points, doubles, Flowers and Seasons, fishing and settlements.'],
  ['/special-hands', 'British Mahjong Special Hands | Patterns & Scores', 'Browse British Mahjong special hands with simple descriptions, scores and visual tile examples.'],
  ['/about', 'About the British Mahjong Scorer', 'Why the British Mahjong Scorer was built, how it approaches beginner-friendly scoring, privacy, rules sources and project development.'],
];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist/public');
const marker = /<!-- seo:metadata:start -->[\s\S]*?<!-- seo:metadata:end -->/;

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function metadata(route, title, description) {
  const url = `${siteUrl}${route === '/' ? '/' : route}`;
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const structuredData = route === '/'
    ? `\n    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'British Mahjong Scorer',
      url,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      isAccessibleForFree: true,
      creator: { '@type': 'Person', name: 'SMooks' },
    })}</script>`
    : '';

  return `<!-- seo:metadata:start -->
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDescription}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${socialImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDescription}" />
    <meta name="twitter:image" content="${socialImage}" />${structuredData}
    <!-- seo:metadata:end -->`;
}

const shell = await readFile(path.join(output, 'index.html'), 'utf8');
if (!marker.test(shell)) throw new Error('SEO metadata markers were not found in the Vite output.');

for (const [route, title, description] of routes) {
  const html = shell.replace(marker, metadata(route, title, description));
  const destination = route === '/' ? path.join(output, 'index.html') : path.join(output, `${route}.html`);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, html);
}
