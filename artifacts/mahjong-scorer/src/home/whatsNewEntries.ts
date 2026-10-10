export const publicUpdateCategories = ['New', 'Rules', 'Improved', 'Fixed', 'Confidence'] as const;

export type PublicUpdateCategory = (typeof publicUpdateCategories)[number];

export type PublicUpdate = {
  date: `${number}-${number}`;
  category: PublicUpdateCategory;
  title: string;
  summary: string;
};

// Add an entry when a release materially changes what players can do, understand, trust or experience.
// Group implementation work by player outcome and use plain language; this is a curated history, not a release log.
export const publicUpdates = [
  {
    date: '2026-10',
    category: 'Fixed',
    title: 'Tracked games keep the winner’s scoring context',
    summary: 'Game scoring now carries the evidence needed to score a winning hand, so the recorded result reflects how that hand was won.',
  },
  {
    date: '2026-10',
    category: 'Confidence',
    title: 'See why a score follows the selected rules',
    summary: 'Scoring results now connect to the rules and evidence behind them, making it easier to understand how a result was reached.',
  },
  {
    date: '2026-09',
    category: 'New',
    title: 'Mahjong Reference grows into a table companion',
    summary: 'Alongside scoring a hand, you can track a whole game, follow settlement and progression, and use additional rules profiles including MCR.',
  },
  {
    date: '2026-09',
    category: 'Rules',
    title: 'Explore special hands across Classical rules',
    summary: 'The Special Hands Guide helps you find and understand special hands across supported Classical profiles, with profile-specific details and examples.',
  },
  {
    date: '2026-09',
    category: 'Improved',
    title: 'Enter a hand the way you see it',
    summary: 'Add recognised groups, enter the rest as loose tiles, or build an ordinary hand tile by tile. When a detail matters, the scorer asks instead of guessing.',
  },
  {
    date: '2026-09',
    category: 'Improved',
    title: 'Get into hand scoring sooner on mobile',
    summary: 'The hand scorer now brings tile entry forward and shows relevant context as you go, with less framing and scrolling on smaller screens.',
  },
  {
    date: '2026-09',
    category: 'New',
    title: 'Share Mahjong Reference',
    summary: 'A Share action gives you the product link without including a hand, game or rules selection from your current session.',
  },
] as const satisfies readonly PublicUpdate[];
