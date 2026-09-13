import { describe, expect, it } from 'vitest';
import { navigationGroups } from './SiteHeader';

describe('site navigation', () => {
  it('organises current user jobs as Play, Rules and Learn', () => {
    expect(navigationGroups.map((group) => group.label)).toEqual(['Play', 'Rules', 'Learn']);
    expect(navigationGroups).toEqual([
      { label: 'Play', destinations: [['Track a game', '/game'], ['Score a hand', '/hand']] },
      { label: 'Rules', destinations: [['Compare Mahjong rules', '/mahjong-rules-compared']] },
      {
        label: 'Learn',
        destinations: [
          ['Gameplay basics', '/gameplay-basics'],
          ['British scoring guide', '/guide#ordinary-scoring'],
          ['Special hands', '/special-hands'],
          ['Scoring examples', '/scoring-examples'],
        ],
      },
    ]);
  });
});
