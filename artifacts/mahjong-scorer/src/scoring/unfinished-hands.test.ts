import { describe, expect, it } from 'vitest';
import {
  bonus,
  detectSpecialFishing,
  dragon,
  scoreHand,
  set,
  suited,
  wind,
} from '.';
import type { MahjongHand, PlayingTile } from '.';

const ordinaryLoser = (
  remainingTiles: PlayingTile[],
  overrides: Partial<MahjongHand> = {},
): MahjongHand => ({
  sets: [
    set('bamboo-pung', 'pung', suited('bamboo', 2)),
    set('dragon-pung', 'pung', dragon('red'), 'exposed'),
    set('east-pair', 'pair', wind('east')),
  ],
  remainingTiles,
  bonusTiles: [],
  isWinner: false,
  ...overrides,
});

describe('unfinished ordinary losing hands', () => {
  it('accepts thirteen structural tiles with multiple unrelated leftovers', () => {
    const hand = ordinaryLoser([
      suited('characters', 2),
      suited('characters', 3),
      suited('circles', 4),
      suited('circles', 6),
      wind('north'),
    ]);

    const score = scoreHand(hand);

    expect(score.valid).toBe(true);
    expect(score.scoringMode).toBe('standard');
    expect(score.specialFishing).toBeUndefined();
    expect(score.pointRules.map((rule) => rule.id)).toEqual(
      expect.arrayContaining(['pung-bamboo-pung', 'pung-dragon-pung']),
    );
  });

  it('accepts multiple partial shapes and chow fragments without requiring fishing', () => {
    const hand: MahjongHand = {
      sets: [
        set('circle-pung', 'pung', suited('circles', 9)),
        set('green-pair', 'pair', dragon('green')),
      ],
      remainingTiles: [
        suited('bamboo', 2),
        suited('bamboo', 3),
        suited('characters', 4),
        suited('characters', 6),
        suited('circles', 1),
        suited('circles', 2),
        wind('south'),
        dragon('white'),
      ],
      bonusTiles: [],
      isWinner: false,
    };

    const score = scoreHand(hand);

    expect(score.valid).toBe(true);
    expect(score.specialFishingMatches).toEqual([]);
  });

  it('counts a represented kong as three structural slots and four physical tiles', () => {
    const hand: MahjongHand = {
      sets: [
        set('red-kong', 'kong', dragon('red')),
        set('bamboo-pung', 'pung', suited('bamboo', 3)),
        set('east-pair', 'pair', wind('east')),
      ],
      remainingTiles: [
        suited('characters', 2),
        suited('characters', 3),
        suited('circles', 5),
        wind('north'),
        dragon('green'),
      ],
      bonusTiles: [],
      isWinner: false,
    };

    expect(scoreHand(hand).valid).toBe(true);
    expect(
      scoreHand({ ...hand, remainingTiles: hand.remainingTiles?.slice(1) })
        .validationErrors,
    ).toContain(
      'A non-winning hand must contain 13 structural playing tiles; each represented kong adds one extra physical tile.',
    );
  });

  it('excludes Flowers and Seasons from the thirteen-tile structural base', () => {
    const hand = ordinaryLoser(
      [
        suited('characters', 2),
        suited('characters', 3),
        suited('circles', 4),
        suited('circles', 6),
        wind('north'),
      ],
      {
        bonusTiles: [
          bonus('flower', 1),
          bonus('flower', 2),
          bonus('season', 3),
        ],
      },
    );

    const score = scoreHand(hand);

    expect(score.valid).toBe(true);
    expect(score.pointRules.filter((rule) => rule.id.startsWith('bonus-')))
      .toHaveLength(3);
  });

  it('rejects more than four physical copies across groups and remaining tiles', () => {
    const hand = ordinaryLoser([
      suited('bamboo', 2),
      suited('bamboo', 2),
      suited('characters', 3),
      suited('circles', 4),
      wind('north'),
    ]);

    expect(scoreHand(hand).validationErrors).toContain(
      'A playing tile cannot appear more than four times.',
    );
  });

  it('uses remaining tiles to prevent false Purity fishing', () => {
    const hand: MahjongHand = {
      sets: [
        set('two', 'pung', suited('bamboo', 2)),
        set('three', 'pung', suited('bamboo', 3)),
        set('four', 'pung', suited('bamboo', 4)),
        set('pair', 'pair', suited('bamboo', 8)),
      ],
      remainingTiles: [
        suited('characters', 5),
        suited('characters', 6),
      ],
      bonusTiles: [],
      isWinner: false,
    };

    const score = scoreHand(hand);

    expect(score.valid).toBe(true);
    expect(
      detectSpecialFishing(hand).some(({ id }) => id === 'purity'),
    ).toBe(false);
  });

  it('detects special fishing automatically from actual remaining tiles', () => {
    const hand: MahjongHand = {
      sets: [
        set('two', 'pung', suited('bamboo', 2)),
        set('three', 'pung', suited('bamboo', 3)),
        set('four', 'pung', suited('bamboo', 4)),
        set('pair', 'pair', suited('bamboo', 8)),
      ],
      remainingTiles: [
        suited('bamboo', 6),
        suited('bamboo', 6),
      ],
      bonusTiles: [],
      isWinner: false,
    };

    const fishing = detectSpecialFishing(hand).find(({ id }) => id === 'purity');

    expect(fishing?.completingTiles).toContainEqual(suited('bamboo', 6));
    const score = scoreHand(hand);
    expect(score).toMatchObject({
      valid: true,
      scoringMode: 'special',
    });
    expect(score.specialFishingMatches?.map(({ id }) => id)).toContain('purity');
  });

  it('can infer irregular special fishing from thirteen actual remaining tiles', () => {
    const hand: MahjongHand = {
      sets: [],
      remainingTiles: [
        suited('bamboo', 1),
        suited('bamboo', 9),
        suited('characters', 1),
        suited('characters', 9),
        suited('circles', 1),
        suited('circles', 9),
        wind('east'),
        wind('south'),
        wind('west'),
        wind('north'),
        dragon('red'),
        dragon('green'),
        dragon('white'),
      ],
      bonusTiles: [],
      isWinner: false,
    };

    expect(
      detectSpecialFishing(hand).find(
        ({ id }) => id === 'thirteen-unique-wonders',
      )?.completingTiles,
    ).toHaveLength(13);
    expect(scoreHand(hand).valid).toBe(true);
  });

  it('accepts a winning fourteen-slot hand with a represented kong', () => {
    const hand: MahjongHand = {
      sets: [
        set('red-kong', 'kong', dragon('red')),
        set('two', 'pung', suited('bamboo', 2)),
        set('three', 'pung', suited('bamboo', 3)),
        set('four', 'pung', suited('bamboo', 4)),
        set('pair', 'pair', suited('bamboo', 8)),
      ],
      bonusTiles: [],
      isWinner: true,
      winningMethod: 'wall',
    };

    expect(scoreHand(hand).valid).toBe(true);
  });

  it('rejects remaining tiles on a winner even when the total is fourteen', () => {
    const hand: MahjongHand = {
      sets: [
        set('two', 'pung', suited('bamboo', 2)),
        set('three', 'pung', suited('bamboo', 3)),
        set('four', 'pung', suited('bamboo', 4)),
        set('pair', 'pair', suited('bamboo', 8)),
      ],
      remainingTiles: [
        suited('bamboo', 6),
        suited('bamboo', 6),
        suited('bamboo', 6),
      ],
      bonusTiles: [],
      isWinner: true,
    };

    expect(scoreHand(hand).validationErrors).toContain(
      'Remaining tiles are only valid in a non-winning hand.',
    );
  });
});