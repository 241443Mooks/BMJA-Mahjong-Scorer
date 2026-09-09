export const siteSeo = {
  name: 'British Mahjong Scorer',
  siteUrl: 'https://mahjong.smooks.co.uk',
  socialImagePath: '/british-mahjong-scorer-social-preview.jpg',
  socialImageAlt: 'British Mahjong Scorer',
};

export const publicRoutes = [
  { path: '/', title: 'British Mahjong Scoring Calculator | British Mahjong Scorer', description: 'Free British Mahjong scoring calculator. Enter tiles to score a hand, calculate points and doubles, check supported special hands, or score a full four-player game.', indexable: true },
  { path: '/game', title: 'Score a British Mahjong Game | British Mahjong Scorer', description: 'Track four players hand by hand, calculate settlement, keep running balances and save the finished British Mahjong game record.', indexable: true },
  { path: '/hand', title: 'British Mahjong Hand Calculator | British Mahjong Scorer', description: 'Enter a British Mahjong hand visually and calculate supported points, doubles, special hands and fishing, with a clear score breakdown.', indexable: true },
  { path: '/gameplay-basics', title: 'British Mahjong Gameplay Basics | British Mahjong Scorer', description: 'Learn the basic flow of British Mahjong, including tiles, turns, calls, winning and the table structure.', indexable: true },
  { path: '/guide', title: 'British Mahjong Scoring Guide | British Mahjong Scorer', description: 'Learn British Mahjong scoring in plain English, with points, doubles, winning hands and practical examples.', indexable: true, aliases: ['/beginner-guide'] },
  { path: '/special-hands', title: 'British Mahjong Special Hands | British Mahjong Scorer', description: 'Browse supported British Mahjong special hands with visual examples and plain-English explanations.', indexable: true, aliases: ['/special-hand-catalogue'] },
  { path: '/features', title: 'British Mahjong Scorer Features', description: 'See how British Mahjong Scorer handles full games, detailed and partial hands, explanations, recovery and printable game records.', indexable: true },
  { path: '/how-it-works', title: 'How British Mahjong Scorer Works', description: 'See how the scorer moves from game context and tile evidence to scoring, explanations, settlement and the final game record.', indexable: true },
  { path: '/help', title: 'British Mahjong Scorer Help', description: 'Get practical help with scoring games and hands, partial evidence, special situations, recovery, settlement and saving a game record.', indexable: true },
  { path: '/mahjong-rules-compared', title: 'British vs Riichi vs Hong Kong vs American Mahjong Rules', description: 'Compare British, Hong Kong, Japanese Riichi, Chinese Official/MCR and American Mahjong. See how winning hands, scoring, Chows, Flowers, Jokers and special rules differ.', indexable: true },
  { path: '/about', title: 'About British Mahjong Scorer', description: 'Learn why British Mahjong Scorer exists, which rules it uses, how uncertainty is handled and how browser-side game data works.', indexable: true },
];

export const publicRoutesByPath = Object.fromEntries(publicRoutes.map((route) => [route.path, route]));
export const canonicalPathFor = (path) => publicRoutes.find((route) => route.aliases?.includes(path))?.path ?? path;
export const canonicalUrlFor = (path) => `${siteSeo.siteUrl}${path === '/' ? '/' : path}`;
export const socialImageUrl = `${siteSeo.siteUrl}${siteSeo.socialImagePath}`;

export const homepageStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: siteSeo.name,
  alternateName: ['British Mahjong Calculator', 'British Mahjong Scoring Calculator'],
  url: canonicalUrlFor('/'),
  description: publicRoutesByPath['/'].description,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  inLanguage: 'en-GB',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
  featureList: [
    'Visual tile entry for British Mahjong hands',
    'Points, doubles, supported special hands and fishing calculations',
    'Four-player game scoring with settlements and running balances',
    'Browser-local game recovery and printable completed-game records',
  ],
  creator: { '@type': 'Person', name: 'SMooks' },
};
