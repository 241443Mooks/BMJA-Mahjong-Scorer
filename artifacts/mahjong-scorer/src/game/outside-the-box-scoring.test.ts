import { describe, expect, it } from 'vitest';
import { bonus, dragon, set, suited, wind } from '../scoring';
import type { MahjongHand } from '../scoring';
import { OUTSIDE_THE_BOX_RULESET, BMJA_RULESET, WESTERN_TM_RULESET } from './ruleset';
import { outsideTheBoxDoubleRules } from './outside-the-box-scoring';

const context = { playerWind: 'east' as const, prevailingWind: 'east' as const, limit: 1000 };
const hand = (sets: MahjongHand['sets'], bonusTiles: MahjongHand['bonusTiles'] = []): MahjongHand => ({ sets, bonusTiles, isWinner: true, winningMethod: 'wall' });
const ids = (value: MahjongHand) => outsideTheBoxDoubleRules(value, context).map((rule) => [rule.id, rule.amount]);

describe('Outside the Box ordinary scoring policy', () => {
  it('stacks Dragon and Wind combinations above their ordinary component doubles', () => {
    const littleDragons = hand([
      set('r', 'pung', dragon('red')), set('g', 'kong', dragon('green')),
      set('b', 'pung', suited('bamboo', 2)), set('c', 'chow', suited('circles', 3)), set('w', 'pair', dragon('white')),
    ]);
    const bigDragons = hand([
      set('r', 'pung', dragon('red')), set('g', 'kong', dragon('green')), set('w', 'pung', dragon('white')),
      set('c', 'chow', suited('circles', 3)), set('p', 'pair', suited('bamboo', 5)),
    ]);
    const littleWinds = hand([
      set('e', 'pung', wind('east')), set('s', 'pung', wind('south')), set('w', 'kong', wind('west')),
      set('c', 'chow', suited('circles', 3)), set('n', 'pair', wind('north')),
    ]);
    const bigWinds = hand([
      set('e', 'pung', wind('east')), set('s', 'pung', wind('south')), set('w', 'kong', wind('west')), set('n', 'pung', wind('north')),
      set('p', 'pair', suited('bamboo', 5)),
    ]);
    expect(ids(littleDragons)).toContainEqual(['otb-little-three-dragons', 1]);
    expect(ids(bigDragons)).toContainEqual(['otb-big-three-dragons', 2]);
    expect(ids(bigDragons)).not.toContainEqual(['otb-little-three-dragons', 1]);
    expect(ids(littleWinds)).toContainEqual(['otb-little-four-joys', 1]);
    expect(ids(bigWinds)).toContainEqual(['otb-big-four-joys', 2]);
    expect(ids(bigWinds)).not.toContainEqual(['otb-little-four-joys', 1]);

    for (const [candidate, expected] of [
      [littleDragons, ['otb-little-three-dragons', 1]],
      [bigDragons, ['otb-big-three-dragons', 2]],
      [littleWinds, ['otb-little-four-joys', 1]],
      [bigWinds, ['otb-big-four-joys', 2]],
    ] as const) {
      expect(ids({ ...candidate, isWinner: false })).toContainEqual(expected);
    }
  });

  it('counts concealed Pungs/Kongs once, with the exposed-Kong exception', () => {
    const concealed = hand([
      set('a', 'pung', suited('bamboo', 2)), set('b', 'pung', suited('characters', 3)), set('c', 'kong', suited('circles', 4)),
      set('d', 'chow', suited('bamboo', 5)), set('p', 'pair', wind('south')),
    ]);
    const exposedKong = { ...concealed, sets: concealed.sets.map((group) => group.id === 'c' ? { ...group, visibility: 'exposed' as const } : group) };
    const exposedPung = { ...concealed, sets: concealed.sets.map((group) => group.id === 'c' ? { ...group, kind: 'pung' as const, visibility: 'exposed' as const } : group) };
    expect(ids(concealed)).toContainEqual(['otb-three-concealed-pung-kong', 1]);
    expect(ids(exposedKong)).toContainEqual(['otb-three-concealed-pung-kong', 1]);
    expect(ids(exposedPung)).not.toContainEqual(['otb-three-concealed-pung-kong', 1]);
    expect(ids({ ...concealed, isWinner: false })).toContainEqual(['otb-three-concealed-pung-kong', 1]);
    expect(ids({ ...exposedKong, isWinner: false })).toContainEqual(['otb-three-concealed-pung-kong', 1]);
  });

  it('caps ordinary OTB scoring but lets a fixed special retain its bonus subtotal', () => {
    const ordinary = hand([
      set('r', 'pung', dragon('red')), set('e', 'pung', wind('east')), set('s', 'pung', suited('characters', 3)),
      set('w', 'pung', suited('circles', 4)), set('p', 'pair', suited('bamboo', 5)),
    ]);
    expect(OUTSIDE_THE_BOX_RULESET.scoreHand({ hand: ordinary, ...context, limit: 100 }).finalScore).toBe(100);

    const buriedTreasure = hand([
      set('a', 'pung', suited('bamboo', 2)), set('b', 'pung', suited('bamboo', 3)), set('c', 'pung', suited('bamboo', 4)),
      set('d', 'pung', wind('east')), set('p', 'pair', suited('bamboo', 5)),
    ], [bonus('flower', 1)]);
    const otb = OUTSIDE_THE_BOX_RULESET.scoreHand({ hand: buriedTreasure, ...context });
    expect(otb).toMatchObject({ finalScore: 1008, uncappedScore: 1008, limitApplied: false });
    expect(BMJA_RULESET.scoreHand({ hand: buriedTreasure, ...context }).finalScore).toBe(1000);
    expect(WESTERN_TM_RULESET.scoreHand({ hand: buriedTreasure, ...context }).finalScore).toBe(1000);
  });

  it('awards pair-completion points only when winning-tile provenance identifies that pair', () => {
    const ordinary = hand([
      set('a', 'pung', suited('characters', 2)), set('b', 'pung', suited('circles', 3)), set('c', 'chow', suited('bamboo', 4)),
      set('d', 'pung', wind('south')), set('pair', 'pair', suited('bamboo', 8)),
    ]);
    const withPairProvenance = {
      ...ordinary,
      winningTileProvenance: { tile: suited('bamboo', 8), target: { type: 'grouped-set' as const, setId: 'pair' } },
    };
    expect(OUTSIDE_THE_BOX_RULESET.scoreHand({ hand: withPairProvenance, ...context }).pointRules)
      .toContainEqual(expect.objectContaining({ id: 'otb-winning-pair', amount: 2 }));
    expect(OUTSIDE_THE_BOX_RULESET.scoreHand({ hand: ordinary, ...context }).pointRules)
      .not.toContainEqual(expect.objectContaining({ id: 'otb-winning-pair' }));
  });

  it('retains the concealed-hand double alongside the last-wall double', () => {
    const concealedLastWall = {
      ...hand([
        set('a', 'pung', suited('characters', 2)), set('b', 'pung', suited('circles', 3)), set('c', 'chow', suited('bamboo', 4)),
        set('d', 'pung', wind('south')), set('pair', 'pair', suited('bamboo', 8)),
      ]),
      winningMethod: 'last-wall-tile' as const,
    };
    const score = OUTSIDE_THE_BOX_RULESET.scoreHand({ hand: concealedLastWall, ...context });
    expect(score.doubleRules).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'concealed-hand' }),
      expect.objectContaining({ id: 'win-last-wall-tile' }),
    ]));
  });

  it('treats the final main-wall tile as a live-wall point without duplicating wall wins', () => {
    const concealed = hand([
      set('a', 'pung', suited('characters', 2)), set('b', 'pung', suited('circles', 3)), set('c', 'chow', suited('bamboo', 4)),
      set('d', 'pung', wind('south')), set('pair', 'pair', suited('bamboo', 8)),
    ]);
    const lastWall = { ...concealed, winningMethod: 'last-wall-tile' as const };
    const otb = OUTSIDE_THE_BOX_RULESET.scoreHand({ hand: lastWall, ...context });
    expect(otb.pointRules).toContainEqual(expect.objectContaining({ id: 'otb-last-wall-live-wall', amount: 2 }));
    expect(otb.doubleRules).toContainEqual(expect.objectContaining({ id: 'win-last-wall-tile' }));
    expect(OUTSIDE_THE_BOX_RULESET.scoreHand({ hand: concealed, ...context }).pointRules
      .filter((rule) => rule.id === 'live-wall-win' || rule.id === 'otb-last-wall-live-wall'))
      .toHaveLength(1);
    for (const ruleset of [BMJA_RULESET, WESTERN_TM_RULESET]) {
      expect(ruleset.scoreHand({ hand: lastWall, ...context }).pointRules)
        .not.toContainEqual(expect.objectContaining({ id: 'otb-last-wall-live-wall' }));
    }
  });

  it('includes provenance-proved pair completion in calculated OTB Purity only', () => {
    const purity = hand([
      set('a', 'pung', suited('characters', 2)), set('b', 'pung', suited('characters', 3)), set('c', 'pung', suited('characters', 4)),
      set('d', 'kong', suited('characters', 6)), set('pair', 'pair', suited('characters', 8)),
    ]);
    const withPairProvenance = {
      ...purity,
      winningTileProvenance: { tile: suited('characters', 8), target: { type: 'grouped-set' as const, setId: 'pair' } },
    };
    const otb = OUTSIDE_THE_BOX_RULESET.scoreHand({ hand: withPairProvenance, ...context });
    const without = OUTSIDE_THE_BOX_RULESET.scoreHand({ hand: purity, ...context });
    expect(otb.pointRules).toContainEqual(expect.objectContaining({ id: 'otb-winning-pair', amount: 2 }));
    expect(otb.calculationComponents).toContainEqual(expect.objectContaining({ id: 'purity-playing-tiles', base: 52, subtotal: 416 }));
    expect(without.pointRules).not.toContainEqual(expect.objectContaining({ id: 'otb-winning-pair' }));
    expect(without.calculationComponents).toContainEqual(expect.objectContaining({ id: 'purity-playing-tiles', base: 50, subtotal: 400 }));
    for (const ruleset of [BMJA_RULESET, WESTERN_TM_RULESET]) {
      expect(ruleset.scoreHand({ hand: withPairProvenance, ...context }).calculationComponents)
        .toContainEqual(expect.objectContaining({ id: 'purity-playing-tiles', base: 50, subtotal: 400 }));
    }
  });
});
