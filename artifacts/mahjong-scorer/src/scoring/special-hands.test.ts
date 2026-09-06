import { describe, expect, it } from 'vitest';
import { detectSpecialHands, dragon, set, suited, wind } from '.';
import type { HandSet, MahjongHand } from '.';

const winning = (sets: HandSet[]): MahjongHand => ({
  sets,
  bonusTiles: [],
  isWinner: true,
});
const matched = (hand: MahjongHand, id: string) =>
  detectSpecialHands(hand).find((result) => result.id === id)?.matched;
const looseWinning = (looseTiles: MahjongHand['looseTiles']): MahjongHand => ({
  sets: [],
  looseTiles,
  bonusTiles: [],
  isWinner: true,
});

describe('independent special-hand detectors', () => {
  it('detects Knitting with repeated cross-suit pairs', () => {
    const hand = looseWinning([
      suited('characters', 1),
      suited('bamboo', 1),
      suited('characters', 1),
      suited('bamboo', 1),
      suited('characters', 3),
      suited('circles', 3),
      suited('bamboo', 4),
      suited('circles', 4),
      suited('characters', 6),
      suited('bamboo', 6),
      suited('characters', 8),
      suited('circles', 8),
      suited('bamboo', 9),
      suited('circles', 9),
    ]);
    expect(matched(hand, 'knitting')).toBe(true);
  });

  it('rejects Knitting with honours or an unpairable same-suit excess', () => {
    const valid = [
      suited('characters', 1),
      suited('bamboo', 1),
      suited('characters', 2),
      suited('bamboo', 2),
      suited('characters', 3),
      suited('bamboo', 3),
      suited('characters', 4),
      suited('bamboo', 4),
      suited('characters', 5),
      suited('bamboo', 5),
      suited('characters', 6),
      suited('bamboo', 6),
      suited('characters', 7),
      suited('bamboo', 7),
    ];
    expect(
      matched(looseWinning([...valid.slice(0, 13), wind('east')]), 'knitting'),
    ).toBe(false);
    expect(
      matched(
        looseWinning([
          ...Array.from({ length: 6 }, () => suited('characters', 1)),
          ...Array.from({ length: 4 }, () => suited('bamboo', 1)),
          ...Array.from({ length: 4 }, () => suited('circles', 1)),
        ]),
        'knitting',
      ),
    ).toBe(false);
    expect(
      matched(
        looseWinning([
          ...valid.slice(0, 12),
          suited('characters', 7),
          suited('characters', 7),
        ]),
        'knitting',
      ),
    ).toBe(false);
  });

  it('detects Triple Knitting with duplicate triplets', () => {
    const hand = looseWinning([
      suited('characters', 2),
      suited('bamboo', 2),
      suited('circles', 2),
      suited('characters', 2),
      suited('bamboo', 2),
      suited('circles', 2),
      suited('characters', 5),
      suited('bamboo', 5),
      suited('circles', 5),
      suited('characters', 8),
      suited('bamboo', 8),
      suited('circles', 8),
      suited('characters', 9),
      suited('bamboo', 9),
    ]);
    expect(matched(hand, 'triple-knitting')).toBe(true);
  });

  it('rejects Triple Knitting when a three-suit group or pair is incomplete', () => {
    const invalid = looseWinning([
      suited('characters', 2),
      suited('bamboo', 2),
      suited('circles', 2),
      suited('characters', 3),
      suited('bamboo', 3),
      suited('circles', 3),
      suited('characters', 5),
      suited('bamboo', 5),
      suited('circles', 5),
      suited('characters', 8),
      suited('bamboo', 8),
      suited('circles', 7),
      suited('characters', 9),
      suited('bamboo', 9),
    ]);
    expect(matched(invalid, 'triple-knitting')).toBe(false);
    expect(
      matched(
        looseWinning([
          ...Array.from({ length: 5 }, () => suited('characters', 2)),
          ...Array.from({ length: 5 }, () => suited('bamboo', 2)),
          ...Array.from({ length: 4 }, () => suited('circles', 2)),
        ]),
        'triple-knitting',
      ),
    ).toBe(false);
  });

  it('detects all pair honours with terminals and repeated pairs', () => {
    const majors = [
      wind('east'),
      wind('south'),
      dragon('red'),
      dragon('green'),
      suited('bamboo', 1),
      suited('characters', 9),
      suited('bamboo', 1),
    ].map((tile, index) => set(String(index), 'pair', tile));
    expect(matched(winning(majors), 'all-pair-honours')).toBe(true);
  });

  it('detects thirteen unique wonders from ungrouped tiles', () => {
    const hand: MahjongHand = {
      sets: [],
      looseTiles: [
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
        dragon('red'),
      ],
      bonusTiles: [],
      isWinner: true,
    };
    expect(matched(hand, 'thirteen-unique-wonders')).toBe(true);
  });

  it('detects Imperial Jade with pungs, a kong, and a green pair', () => {
    const hand = winning([
      set('1', 'pung', dragon('green')),
      set('2', 'pung', suited('bamboo', 2)),
      set('3', 'kong', suited('bamboo', 4)),
      set('4', 'pung', suited('bamboo', 8)),
      set('5', 'pair', suited('bamboo', 6)),
    ]);
    expect(matched(hand, 'imperial-jade')).toBe(true);
  });

  it('rejects Imperial Jade with a non-green tile or a chow', () => {
    const base = [
      set('1', 'pung', dragon('green')),
      set('2', 'pung', suited('bamboo', 2)),
      set('3', 'kong', suited('bamboo', 4)),
      set('4', 'pung', suited('bamboo', 8)),
      set('5', 'pair', suited('bamboo', 6)),
    ];
    expect(
      matched(
        winning(base.map((group, index) =>
          index === 4 ? set('5', 'pair', suited('bamboo', 5)) : group,
        )),
        'imperial-jade',
      ),
    ).toBe(false);
    expect(
      matched(
        winning(base.map((group, index) =>
          index === 2 ? set('3', 'chow', suited('bamboo', 2)) : group,
        )),
        'imperial-jade',
      ),
    ).toBe(false);
  });

  it('detects the concealed Gates of Heaven layout', () => {
    const hand = looseWinning([
      suited('circles', 1),
      suited('circles', 1),
      suited('circles', 1),
      suited('circles', 2),
      suited('circles', 3),
      suited('circles', 4),
      suited('circles', 5),
      suited('circles', 5),
      suited('circles', 6),
      suited('circles', 7),
      suited('circles', 8),
      suited('circles', 9),
      suited('circles', 9),
      suited('circles', 9),
    ]);
    expect(matched(hand, 'gates-of-heaven')).toBe(true);
  });

  it('rejects Gates of Heaven with mixed suits or the pair outside 2 to 8', () => {
    const mixed = looseWinning([
      suited('circles', 1),
      suited('circles', 1),
      suited('circles', 1),
      suited('circles', 2),
      suited('circles', 3),
      suited('bamboo', 4),
      suited('circles', 5),
      suited('circles', 5),
      suited('circles', 6),
      suited('circles', 7),
      suited('circles', 8),
      suited('circles', 9),
      suited('circles', 9),
      suited('circles', 9),
    ]);
    const terminalPair = looseWinning([
      suited('circles', 1),
      suited('circles', 1),
      suited('circles', 1),
      suited('circles', 1),
      suited('circles', 2),
      suited('circles', 3),
      suited('circles', 4),
      suited('circles', 5),
      suited('circles', 6),
      suited('circles', 7),
      suited('circles', 8),
      suited('circles', 9),
      suited('circles', 9),
      suited('circles', 9),
    ]);
    expect(matched(mixed, 'gates-of-heaven')).toBe(false);
    expect(matched(terminalPair, 'gates-of-heaven')).toBe(false);
  });

  it('detects the Wriggling Snake layout', () => {
    const hand = looseWinning([
      suited('bamboo', 1),
      suited('bamboo', 1),
      suited('bamboo', 2),
      suited('bamboo', 3),
      suited('bamboo', 4),
      suited('bamboo', 5),
      suited('bamboo', 6),
      suited('bamboo', 7),
      suited('bamboo', 8),
      suited('bamboo', 9),
      wind('east'),
      wind('south'),
      wind('west'),
      wind('north'),
    ]);
    expect(matched(hand, 'wriggling-snake')).toBe(true);
  });

  it('rejects Wriggling Snake with a missing wind or mixed suited run', () => {
    const missingWind = looseWinning([
      suited('bamboo', 1),
      suited('bamboo', 1),
      suited('bamboo', 2),
      suited('bamboo', 3),
      suited('bamboo', 4),
      suited('bamboo', 5),
      suited('bamboo', 6),
      suited('bamboo', 7),
      suited('bamboo', 8),
      suited('bamboo', 9),
      wind('east'),
      wind('south'),
      wind('west'),
      wind('west'),
    ]);
    const mixedRun = {
      ...missingWind,
      looseTiles: missingWind.looseTiles?.map((tile, index) =>
        index === 5 ? suited('circles', 5) : tile,
      ),
    };
    expect(matched(missingWind, 'wriggling-snake')).toBe(false);
    expect(matched(mixedRun, 'wriggling-snake')).toBe(false);
  });

  it('detects all honours', () => {
    expect(
      matched(
        winning([
          set('1', 'pung', wind('east')),
          set('2', 'pung', wind('south')),
          set('3', 'pung', dragon('red')),
          set('4', 'pung', dragon('green')),
          set('5', 'pair', dragon('white')),
        ]),
        'all-winds-and-dragons',
      ),
    ).toBe(true);
  });

  it('detects all terminals', () => {
    expect(
      matched(
        winning([
          set('1', 'pung', suited('bamboo', 1)),
          set('2', 'pung', suited('bamboo', 9)),
          set('3', 'pung', suited('characters', 1)),
          set('4', 'pung', suited('circles', 9)),
          set('5', 'pair', suited('characters', 9)),
        ]),
        'heads-and-tails',
      ),
    ).toBe(true);
  });

  it('detects four kongs', () => {
    expect(
      matched(
        winning([
          set('1', 'kong', suited('bamboo', 2)),
          set('2', 'kong', suited('bamboo', 3)),
          set('3', 'kong', suited('characters', 4)),
          set('4', 'kong', dragon('red')),
          set('5', 'pair', suited('circles', 5)),
        ]),
        'fourfold-plenty',
      ),
    ).toBe(true);
  });

  it('detects three great scholars', () => {
    expect(
      matched(
        winning([
          set('1', 'pung', dragon('red')),
          set('2', 'pung', dragon('green')),
          set('3', 'kong', dragon('white')),
          set('4', 'pung', suited('circles', 4)),
          set('5', 'pair', suited('bamboo', 2)),
        ]),
        'three-great-scholars',
      ),
    ).toBe(true);
  });

  it('detects four winds', () => {
    expect(
      matched(
        winning([
          set('1', 'pung', wind('east')),
          set('2', 'pung', wind('south')),
          set('3', 'kong', wind('west')),
          set('4', 'pung', wind('north')),
          set('5', 'pair', suited('circles', 2)),
        ]),
        'four-blessings',
      ),
    ).toBe(true);
  });

  it('detects buried treasure and rejects an exposed set', () => {
    const sets = [
      set('1', 'pung', suited('bamboo', 2)),
      set('2', 'pung', suited('bamboo', 3)),
      set('3', 'pung', suited('bamboo', 4)),
      set('4', 'pung', dragon('red')),
      set('5', 'pair', suited('bamboo', 5)),
    ];
    expect(matched(winning(sets), 'buried-treasure')).toBe(true);
    sets[0] = { ...sets[0], visibility: 'exposed' };
    expect(matched(winning(sets), 'buried-treasure')).toBe(false);
  });

  it('applies the final claimed-group exception to Buried Treasure only with matching provenance', () => {
    const base = [
      set('one', 'pung', suited('bamboo', 2), 'exposed'),
      set('two', 'pung', suited('bamboo', 3)),
      set('three', 'pung', suited('bamboo', 4)),
      set('four', 'pung', dragon('red')),
      set('pair', 'pair', suited('bamboo', 5)),
    ];
    const claimed: MahjongHand = {
      ...winning(base),
      winningMethod: 'discard',
      winningTileProvenance: {
        tile: suited('bamboo', 2),
        target: { type: 'grouped-set', setId: 'one' },
      },
    };

    expect(matched(claimed, 'buried-treasure')).toBe(true);
    expect(
      matched(
        { ...claimed, winningTileProvenance: undefined },
        'buried-treasure',
      ),
    ).toBe(false);
    expect(
      matched(
        {
          ...claimed,
          winningTileProvenance: {
            tile: suited('bamboo', 3),
            target: { type: 'grouped-set', setId: 'two' },
          },
        },
        'buried-treasure',
      ),
    ).toBe(false);
    expect(
      matched(
        {
          ...claimed,
          winningTileProvenance: {
            tile: suited('bamboo', 2),
            target: { type: 'grouped-set', setId: 'stale' },
          },
        },
        'buried-treasure',
      ),
    ).toBe(false);
    expect(
      matched(
        {
          ...claimed,
          sets: base.map((group, index) =>
            index === 1 ? { ...group, visibility: 'exposed' } : group,
          ),
        },
        'buried-treasure',
      ),
    ).toBe(false);
    expect(
      matched({ ...claimed, winningMethod: 'wall' }, 'buried-treasure'),
    ).toBe(false);
    expect(
      matched(
        {
          ...claimed,
          winningMethod: 'wall',
          winningTileProvenance: undefined,
          sets: base.map((group) => ({
            ...group,
            visibility: 'concealed',
          })),
        },
        'buried-treasure',
      ),
    ).toBe(true);

    const pairClaimed: MahjongHand = {
      ...claimed,
      sets: base.map((group) => ({
        ...group,
        visibility: group.id === 'pair' ? 'exposed' : 'concealed',
      })),
      winningTileProvenance: {
        tile: suited('bamboo', 5),
        target: { type: 'grouped-set', setId: 'pair' },
      },
    };
    expect(matched(pairClaimed, 'buried-treasure')).toBe(true);
  });

  it('allows claimed Gates only when loose provenance selects a terminal', () => {
    const looseTiles = [
      suited('circles', 1),
      suited('circles', 1),
      suited('circles', 1),
      suited('circles', 2),
      suited('circles', 3),
      suited('circles', 4),
      suited('circles', 5),
      suited('circles', 5),
      suited('circles', 6),
      suited('circles', 7),
      suited('circles', 8),
      suited('circles', 9),
      suited('circles', 9),
      suited('circles', 9),
    ];
    const claimed: MahjongHand = {
      ...looseWinning(looseTiles),
      winningMethod: 'final-discard',
      winningTileProvenance: {
        tile: suited('circles', 9),
        target: { type: 'loose-layout' },
      },
    };
    expect(matched(claimed, 'gates-of-heaven')).toBe(true);
    expect(
      matched(
        {
          ...claimed,
          winningTileProvenance: {
            tile: suited('circles', 5),
            target: { type: 'loose-layout' },
          },
        },
        'gates-of-heaven',
      ),
    ).toBe(false);
    expect(
      matched(
        { ...claimed, winningTileProvenance: undefined },
        'gates-of-heaven',
      ),
    ).toBe(false);
    expect(
      matched(
        {
          ...claimed,
          winningTileProvenance: {
            tile: suited('bamboo', 9),
            target: { type: 'loose-layout' },
          },
        },
        'gates-of-heaven',
      ),
    ).toBe(false);
    expect(
      matched(
        {
          ...claimed,
          winningMethod: 'wall',
          winningTileProvenance: undefined,
        },
        'gates-of-heaven',
      ),
    ).toBe(true);
    expect(
      matched(
        { ...claimed, winningMethod: 'robbing-kong' },
        'gates-of-heaven',
      ),
    ).toBe(false);
  });

  it('rejects kongs and mixed suits for buried treasure', () => {
    const base = [
      set('1', 'pung', suited('bamboo', 2)),
      set('2', 'pung', suited('bamboo', 3)),
      set('3', 'pung', suited('bamboo', 4)),
      set('4', 'pung', dragon('red')),
      set('5', 'pair', suited('bamboo', 5)),
    ];
    expect(
      matched(
        winning(base.map((group) => ({ ...group }))),
        'buried-treasure',
      ),
    ).toBe(true);
    expect(
      matched(
        winning(base.map((group, index) =>
          index === 3 ? { ...group, kind: 'kong' as const } : group,
        )),
        'buried-treasure',
      ),
    ).toBe(false);
    expect(
      matched(
        winning(base.map((group, index) =>
          index === 2 ? set('3', 'pung', suited('circles', 4)) : group,
        )),
        'buried-treasure',
      ),
    ).toBe(false);
  });

  it('reports every detector result independently', () => {
    const results = detectSpecialHands(winning([]));
    expect(results).toHaveLength(13);
    expect(new Set(results.map((result) => result.id)).size).toBe(results.length);
  });
});
