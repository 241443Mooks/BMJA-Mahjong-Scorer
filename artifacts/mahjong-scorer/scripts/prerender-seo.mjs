import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteUrl = 'https://mahjong.smooks.co.uk';
const socialImage = `${siteUrl}/british-mahjong-scorer-social-preview.jpg`;
const routes = [
  ['/', 'British Mahjong Scorer | Score Games & Hands', 'Score British Mahjong games and individual hands, track settlements, and learn British rules as you play.'],
  ['/game', 'Score a British Mahjong Game | British Mahjong Scorer', 'Track four players hand by hand, calculate settlement, keep running balances and save the finished British Mahjong game record.'],
  ['/hand', 'Score a British Mahjong Hand | British Mahjong Scorer', 'Build a British Mahjong hand visually and calculate supported points, doubles, patterns, special hands and fishing.'],
  ['/gameplay-basics', 'British Mahjong Gameplay Basics | British Mahjong Scorer', 'Learn the basic flow of British Mahjong, including tiles, turns, calls, winning and the table structure.'],
  ['/guide', 'British Mahjong Scoring Guide | British Mahjong Scorer', 'Learn British Mahjong scoring in plain English, with points, doubles, winning hands and practical examples.'],
  ['/special-hands', 'British Mahjong Special Hands | British Mahjong Scorer', 'Browse supported British Mahjong special hands with visual examples and plain-English explanations.'],
  ['/features', 'British Mahjong Scorer Features', 'See how British Mahjong Scorer handles full games, detailed and partial hands, explanations, recovery and printable game records.'],
  ['/how-it-works', 'How British Mahjong Scorer Works', 'See how the scorer moves from game context and tile evidence to scoring, explanations, settlement and the final game record.'],
  ['/help', 'British Mahjong Scorer Help', 'Get practical help with scoring games and hands, partial evidence, special situations, recovery, settlement and saving a game record.'],
  ['/mahjong-rules-compared', 'British vs Riichi vs Hong Kong vs American Mahjong Rules', 'Compare British, Hong Kong, Japanese Riichi, Chinese Official/MCR and American Mahjong. See how winning hands, scoring, Chows, Flowers, Jokers and special rules differ.'],
  ['/about', 'About British Mahjong Scorer', 'Learn why British Mahjong Scorer exists, which rules it uses, how uncertainty is handled and how browser-side game data works.'],
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
    <meta property="og:image:alt" content="British Mahjong Scorer" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDescription}" />
    <meta name="twitter:image" content="${socialImage}" />
    <meta name="twitter:image:alt" content="British Mahjong Scorer" />${structuredData}
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
