import { describe, expect, it } from 'vitest';
import { detectSpecialHands, dragon, set, suited, wind } from '.';
import {
  bmjaSpecialHandBindings,
  canonicalSpecialHandPatterns,
  resolveSpecialHandBindings,
} from './special-hands';
import type { GameContext, HandSet, MahjongHand } from '.';

const winning = (sets: HandSet[]): MahjongHand => ({
  sets,
  bonusTiles: [],
  isWinner: true,
});
const matched = (hand: MahjongHand, id: string) =>
  detectSpecialHands(hand).find((result) => result.id === id)?.matched;
const context = (playerWind: GameContext['playerWind']): GameContext => ({
  playerWind,
  prevailingWind: 'east',
  limit: 1000,
});
const matchedFor = (
  hand: MahjongHand,
  id: string,
  playerWind: GameContext['playerWind'],
) =>
  detectSpecialHands(hand, context(playerWind)).find(
    (result) => result.id === id,
  )?.matched;
const looseWinning = (looseTiles: MahjongHand['looseTiles']): MahjongHand => ({
  sets: [],
  looseTiles,
  bonusTiles: [],
  isWinner: true,
});

describe('independent special-hand detectors', () => {
  it('preserves the complete BMJA special-hand public metadata contract', () => {
    expect(
      detectSpecialHands(winning([])).map(
        ({ id, name, description, value }) => ({
          id,
          name,
          description,
          value,
        }),
      ),
    ).toEqual([
      { id: 'knitting', name: 'Knitting', description: 'Seven pairs, each pairing the same number across two different suits; pairs may repeat.', value: 500 },
      { id: 'triple-knitting', name: 'Triple Knitting', description: 'Four same-number groups across all three suits, plus a same-number pair across two suits.', value: 500 },
      { id: 'all-pair-honours', name: 'All pair honours', description: 'Seven pairs of major tiles: 1s, 9s, winds and dragons; repeated pairs are allowed.', value: 500 },
      { id: 'imperial-jade', name: 'Imperial Jade', description: 'Four pungs/kongs and a pair using only Green Dragon or Bamboo 2, 3, 4, 6 and 8.', value: 1000 },
      { id: 'thirteen-unique-wonders', name: 'Thirteen unique wonders', description: 'One of every terminal, wind and dragon, plus a pair of any one.', value: 1000 },
      { id: 'gates-of-heaven', name: 'The Gates of Heaven', description: 'A concealed one-suit layout with three 1s, three 9s, 2 through 8, and one of 2 through 8 paired.', value: 1000 },
      { id: 'wriggling-snake', name: 'The Wriggling Snake', description: 'A pair of suited 1s, suited 2 through 9 in that suit, and one of each Wind.', value: 1000 },
      { id: 'all-winds-and-dragons', name: 'All Winds and Dragons', description: 'Four pungs/kongs and a pair, all made from winds and dragons.', value: 1000 },
      { id: 'heads-and-tails', name: 'Heads and Tails', description: 'Four pungs/kongs and a pair, all made from suited 1s and 9s.', value: 1000 },
      { id: 'fourfold-plenty', name: 'Fourfold Plenty', description: 'Four kongs and a pair.', value: 1000 },
      { id: 'three-great-scholars', name: 'Three great scholars', description: 'A pung or kong of each of the three dragons.', value: 1000 },
      { id: 'four-blessings', name: 'Four Blessings Hovering over the Door', description: 'A pung or kong of each wind, plus any pair.', value: 1000 },
      { id: 'buried-treasure', name: 'Buried treasure', description: 'Four concealed pungs and a concealed pair, using one suit with optional winds/dragons.', value: 1000 },
      { id: 'heavens-blessing', name: "Heaven's Blessing", description: 'East makes Mah Jong immediately with the original fourteen dealt tiles.', value: 1000 },
      { id: 'earths-blessing', name: "Earth's Blessing", description: "A non-East player makes Mah Jong with East's first discard.", value: 1000 },
      { id: 'gathering-plum-blossom', name: 'Gathering the Plum Blossom from the Roof', description: 'A replacement tile is 5 Circles and completes Mah Jong.', value: 1000 },
      { id: 'plucking-moon', name: 'Plucking the Moon from the Bottom of the Sea', description: 'The last wall tile is 1 Circles and completes Mah Jong.', value: 1000 },
      { id: 'twofold-fortune', name: 'Twofold Fortune', description: 'One kong replacement completes another kong, whose replacement completes Mah Jong.', value: 1000 },
    ]);
  });

  it('binds one canonical Three Great Scholars detector to BMJA 1.0 metadata', () => {
    expect(
      canonicalSpecialHandPatterns.filter(
        ({ id }) => id === 'three-great-scholars',
      ),
    ).toHaveLength(1);
    expect(
      bmjaSpecialHandBindings.find(
        ({ patternId }) => patternId === 'three-great-scholars',
      ),
    ).toMatchObject({
      patternId: 'three-great-scholars',
      profile: { id: 'bmja', version: '1.0' },
      name: 'Three great scholars',
      description: 'A pung or kong of each of the three dragons.',
      value: 1000,
    });
  });

  it('renders a test-only binding through the same canonical detector', () => {
    const profile = { id: 'fixture', version: 'test' };
    const [{ binding, pattern }] = resolveSpecialHandBindings(profile, [
      {
        patternId: 'three-great-scholars',
        profile,
        name: 'Fixture dragons',
        description: 'Fixture-only local wording.',
        value: 1500,
      },
    ]);
    expect(pattern).toBe(
      canonicalSpecialHandPatterns.find(
        ({ id }) => id === 'three-great-scholars',
      ),
    );
    expect(binding).toMatchObject({ name: 'Fixture dragons', value: 1500 });
  });

  it('rejects an unknown canonical ID even when its local name matches', () => {
    const profile = { id: 'fixture', version: 'test' };
    expect(() =>
      resolveSpecialHandBindings(profile, [
        {
          patternId: 'three-great-scholars-alias',
          profile,
          name: 'Three great scholars',
          description: 'A local alias is not an identity key.',
          value: 1500,
        },
      ]),
    ).toThrow(
      'Unknown canonical special-hand pattern "three-great-scholars-alias".',
    );
  });

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
        winning(
          base.map((group, index) =>
            index === 4 ? set('5', 'pair', suited('bamboo', 5)) : group,
          ),
        ),
        'imperial-jade',
      ),
    ).toBe(false);
    expect(
      matched(
        winning(
          base.map((group, index) =>
            index === 2 ? set('3', 'chow', suited('bamboo', 2)) : group,
          ),
        ),
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
      matched({ ...claimed, winningMethod: 'robbing-kong' }, 'gates-of-heaven'),
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
      matched(winning(base.map((group) => ({ ...group }))), 'buried-treasure'),
    ).toBe(true);
    expect(
      matched(
        winning(
          base.map((group, index) =>
            index === 3 ? { ...group, kind: 'kong' as const } : group,
          ),
        ),
        'buried-treasure',
      ),
    ).toBe(false);
    expect(
      matched(
        winning(
          base.map((group, index) =>
            index === 2 ? set('3', 'pung', suited('circles', 4)) : group,
          ),
        ),
        'buried-treasure',
      ),
    ).toBe(false);
  });

  it("detects Heaven's Blessing only for East's original dealt hand", () => {
    const hand: MahjongHand = {
      ...winning([
        set('1', 'pung', dragon('red')),
        set('2', 'pung', suited('bamboo', 2)),
        set('3', 'pung', suited('bamboo', 3)),
        set('4', 'pung', suited('bamboo', 4)),
        set('5', 'pair', suited('bamboo', 5)),
      ]),
      winningMethod: 'initial-deal',
    };
    expect(matchedFor(hand, 'heavens-blessing', 'east')).toBe(true);
    expect(matchedFor(hand, 'heavens-blessing', 'south')).toBe(false);
    expect(
      matchedFor(
        { ...hand, winningMethod: 'wall' },
        'heavens-blessing',
        'east',
      ),
    ).toBe(false);
    expect(
      matchedFor(
        {
          ...hand,
          sets: hand.sets.map((group, index) =>
            index === 0 ? { ...group, kind: 'kong' } : group,
          ),
        },
        'heavens-blessing',
        'east',
      ),
    ).toBe(false);
  });

  it("detects Earth's Blessing only from East's first discard to a non-East player", () => {
    const hand: MahjongHand = {
      ...winning([
        set('1', 'pung', dragon('red')),
        set('2', 'pung', suited('bamboo', 2)),
        set('3', 'pung', suited('bamboo', 3)),
        set('4', 'pung', suited('bamboo', 4)),
        set('5', 'pair', suited('bamboo', 5)),
      ]),
      winningMethod: 'discard',
      winningEventEvidence: {
        type: 'discard',
        discardedBy: 'east',
        handDiscardOrdinal: 1,
      },
    };
    expect(matchedFor(hand, 'earths-blessing', 'south')).toBe(true);
    expect(matchedFor(hand, 'earths-blessing', 'east')).toBe(false);
    expect(
      matchedFor(
        { ...hand, winningEventEvidence: undefined },
        'earths-blessing',
        'south',
      ),
    ).toBe(false);
    expect(
      matchedFor(
        {
          ...hand,
          winningEventEvidence: {
            type: 'discard',
            discardedBy: 'east',
            handDiscardOrdinal: 2,
          },
        },
        'earths-blessing',
        'south',
      ),
    ).toBe(false);
  });

  it('infers Plum Blossom only from a replacement winning 5 Circles', () => {
    const hand: MahjongHand = {
      ...winning([
        set('kong', 'kong', suited('bamboo', 2)),
        set('2', 'pung', suited('bamboo', 3)),
        set('3', 'pung', suited('bamboo', 4)),
        set('4', 'pung', dragon('red')),
        set('pair', 'pair', suited('circles', 5)),
      ]),
      winningMethod: 'loose-tile',
      winningTileProvenance: {
        tile: suited('circles', 5),
        target: { type: 'grouped-set', setId: 'pair' },
      },
    };
    expect(matched(hand, 'gathering-plum-blossom')).toBe(true);
    expect(
      matched({ ...hand, winningMethod: 'wall' }, 'gathering-plum-blossom'),
    ).toBe(false);
    expect(
      matched(
        {
          ...hand,
          winningTileProvenance: {
            tile: suited('circles', 1),
            target: { type: 'grouped-set', setId: 'pair' },
          },
        },
        'gathering-plum-blossom',
      ),
    ).toBe(false);
  });

  it('infers Moon only from a last-wall winning 1 Circles', () => {
    const hand: MahjongHand = {
      ...winning([
        set('1', 'pung', dragon('red')),
        set('2', 'pung', suited('bamboo', 2)),
        set('3', 'pung', suited('bamboo', 3)),
        set('4', 'pung', suited('bamboo', 4)),
        set('pair', 'pair', suited('circles', 1)),
      ]),
      winningMethod: 'last-wall-tile',
      winningTileProvenance: {
        tile: suited('circles', 1),
        target: { type: 'grouped-set', setId: 'pair' },
      },
    };
    expect(matched(hand, 'plucking-moon')).toBe(true);
    expect(matched({ ...hand, winningMethod: 'wall' }, 'plucking-moon')).toBe(
      false,
    );
    expect(
      matched({ ...hand, winningTileProvenance: undefined }, 'plucking-moon'),
    ).toBe(false);
  });

  it('detects Twofold Fortune only with two kongs and confirmed replacement sequence', () => {
    const hand: MahjongHand = {
      ...winning([
        set('1', 'kong', suited('bamboo', 2)),
        set('2', 'kong', suited('bamboo', 3)),
        set('3', 'pung', suited('bamboo', 4)),
        set('4', 'pung', dragon('red')),
        set('pair', 'pair', suited('circles', 5)),
      ]),
      winningMethod: 'loose-tile',
      winningEventEvidence: {
        type: 'replacement-chain',
        kongDeclarations: 2,
      },
    };
    expect(matched(hand, 'twofold-fortune')).toBe(true);
    expect(
      matched({ ...hand, winningEventEvidence: undefined }, 'twofold-fortune'),
    ).toBe(false);
    expect(matched({ ...hand, winningMethod: 'wall' }, 'twofold-fortune')).toBe(
      false,
    );
    expect(
      matched(
        {
          ...hand,
          sets: hand.sets.map((group, index) =>
            index === 1 ? { ...group, kind: 'pung' } : group,
          ),
        },
        'twofold-fortune',
      ),
    ).toBe(false);
  });

  it('reports every detector result independently', () => {
    const results = detectSpecialHands(winning([]));
    expect(results).toHaveLength(18);
    expect(new Set(results.map((result) => result.id)).size).toBe(
      results.length,
    );
  });
});
