import { describe, expect, it } from 'vitest';
import { bonus, scoreHand, set, suited } from '../scoring';
import type { MahjongHand } from '../scoring';
import { canonicalSpecialHandPatterns, isFixedSpecialHandBinding, specialHandValueFor } from '../scoring/special-hands';
import { BMJA_RULESET, WESTERN_TM_RULESET, westernTmSpecialHandBindings } from './ruleset';

const scoreWestern = (hand: MahjongHand, limit = 1000) =>
  WESTERN_TM_RULESET.scoreHand({ hand, playerWind: 'east', prevailingWind: 'east', limit });

const plainPurity: MahjongHand = {
  sets: [
    set('p2', 'pung', suited('bamboo', 2)),
    set('p3', 'pung', suited('bamboo', 3)),
    set('p6', 'pung', suited('bamboo', 6)),
    set('p9', 'pung', suited('bamboo', 9)),
    set('pair', 'pair', suited('bamboo', 5)),
  ],
  bonusTiles: [], isWinner: true,
};

const bonusPurity: MahjongHand = {
  sets: [
    set('p1', 'pung', suited('characters', 2), 'exposed'),
    set('p2', 'pung', suited('characters', 3)),
    set('p3', 'pung', suited('characters', 6)),
    set('k1', 'kong', suited('characters', 9)),
    set('pair', 'pair', suited('characters', 5)),
  ],
  bonusTiles: [bonus('flower', 1), bonus('season', 2)],
  isWinner: true, winningMethod: 'discard',
};

describe('western-tm@0.1 Companion Phase 3C: calculated Purity', () => {
  it('binds one canonical Purity pattern as calculated with no numeric winning or fishing value', () => {
    const bindings = westernTmSpecialHandBindings.filter(({ patternId }) => patternId === 'purity');
    expect(westernTmSpecialHandBindings).toHaveLength(14);
    expect(canonicalSpecialHandPatterns.filter(({ id }) => id === 'purity')).toHaveLength(1);
    expect(bindings).toEqual([expect.objectContaining({ name: 'Purity', scoreModel: { kind: 'calculated' } })]);
    expect(bindings[0]).not.toHaveProperty('value');
    expect(bindings[0]).not.toHaveProperty('fishingValue');
  });

  it('matches calculated Purity and retains the shared ordinary calculation rather than a fixed band', () => {
    const plain = scoreWestern(plainPurity);
    const withBonus = scoreWestern(bonusPurity);
    expect(plain.specialHands).toContainEqual(expect.objectContaining({ id: 'purity', scoreModel: 'calculated', matched: true }));
    expect(plain.specialHands.find(({ id }) => id === 'purity')).not.toHaveProperty('value');
    expect(plain.finalScore).toBe(320);
    expect(withBonus.finalScore).toBe(512);
    expect(plain.finalScore).not.toBe(withBonus.finalScore);
    expect([500, 1000, 1500, 2000]).not.toContain(plain.finalScore);
    expect([500, 1000, 1500, 2000]).not.toContain(withBonus.finalScore);
    expect(withBonus.calculationComponents).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'purity-playing-tiles', subtotal: 496 }),
      expect.objectContaining({ id: 'purity-bonus-tiles', subtotal: 16 }),
    ]));
  });

  it('retains the ordinary 1000-point limit for calculated Purity', () => {
    const fourKongs: MahjongHand = {
      sets: ([1, 2, 3, 4] as const).map((rank) => set(`k${rank}`, 'kong', suited('circles', rank))),
      // A distinct pair keeps the purity shape while the four kongs exceed the ordinary cap.
      bonusTiles: [], isWinner: true, winningMethod: 'final-discard',
    };
    fourKongs.sets.push(set('pair', 'pair', suited('circles', 5)));
    const result = scoreWestern(fourKongs);
    expect(result.uncappedScore).toBeGreaterThan(1000);
    expect(result).toMatchObject({ finalScore: 1000, limitApplied: true });
  });

  it('keeps a simultaneous fixed Western match ahead of calculated Purity', () => {
    const overlap: MahjongHand = {
      sets: [
        set('one-a', 'pung', suited('bamboo', 1)), set('one-b', 'pung', suited('bamboo', 1)),
        set('nine-a', 'pung', suited('bamboo', 9)), set('nine-b', 'pung', suited('bamboo', 9)),
        set('pair', 'pair', suited('bamboo', 1)),
      ], bonusTiles: [], isWinner: true,
    };
    const result = scoreWestern(overlap);
    expect(result.specialHands).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'purity', scoreModel: 'calculated', matched: true }),
      expect.objectContaining({ id: 'heads-and-tails', scoreModel: 'fixed', value: 1000, matched: true }),
    ]));
    expect(result.finalScore).toBe(1000);
    expect(result.calculationComponents).toEqual([expect.objectContaining({ id: 'special-heads-and-tails', subtotal: 1000 })]);
  });

  it('does not invent Western Purity fishing and preserves BMJA Purity winner and fishing outcomes', () => {
    expect(scoreWestern(plainPurity).specialFishingMatches).toEqual([]);
    expect(BMJA_RULESET.scoreHand({ hand: bonusPurity, playerWind: 'east', prevailingWind: 'east' })).toMatchObject({ finalScore: 512, uncappedScore: 512 });
    const fishing: MahjongHand = {
      sets: [
        set('1', 'pung', suited('bamboo', 2)), set('2', 'pung', suited('bamboo', 3)),
        set('3', 'kong', suited('bamboo', 6)), set('4', 'pair', suited('bamboo', 8)),
      ],
      remainingTiles: [suited('bamboo', 4), suited('bamboo', 4)], bonusTiles: [], isWinner: false,
    };
    expect(BMJA_RULESET.scoreHand({ hand: fishing, playerWind: 'east', prevailingWind: 'east' }).specialFishingMatches).toContainEqual(expect.objectContaining({ id: 'purity', fishingValue: 'three-doubles' }));
    expect(scoreWestern(fishing).specialFishingMatches).toEqual([]);
  });

  it('does not allow a calculated binding into the fixed-value helper', () => {
    const calculated = westernTmSpecialHandBindings.find(({ patternId }) => patternId === 'purity')!;
    expect(isFixedSpecialHandBinding(calculated)).toBe(false);
    if (false) {
      // @ts-expect-error Calculated bindings have no fixed-value scoring route.
      specialHandValueFor(plainPurity, calculated);
    }
  });
});
