import { describe, expect, it } from 'vitest';
import { navigationGroups, secondaryDestinations } from './SiteHeader';

describe('site navigation', () => {
  it('organises current user jobs as Play, Rules and Learn', () => {
    expect(navigationGroups.map((group) => group.label)).toEqual(['Play', 'Rules', 'Learn']);
    expect(navigationGroups).toEqual([
      { label: 'Play', destinations: [['Track a game', '/game'], ['Score a hand', '/hand'], ['Understand settlement', '/mahjong-settlement']] },
      {
        label: 'Rules',
        destinations: [
          ['Rules hub', '/rules'],
          ['British / BMJA-style', '/rules/british'],
          ['Western — Thompson & Maloney', '/rules/western'],
          ['Compare Mahjong rules', '/mahjong-rules-compared'],
        ],
      },
      {
        label: 'Learn',
        destinations: [
          ['British gameplay basics', '/gameplay-basics'],
          ['British scoring guide', '/guide#ordinary-scoring'],
          ['British special hands', '/special-hands'],
          ['British scoring examples', '/scoring-examples'],
        ],
      },
    ]);
  });

  it('keeps Features in the secondary More menu', () => {
    expect(secondaryDestinations).toEqual([
      ['Features', '/features'],
      ['Help', '/help'],
      ['How it works', '/how-it-works'],
      ['About', '/about'],
    ]);
  });
});
