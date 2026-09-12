import { describe, expect, it } from 'vitest';
import { set, suited } from '.';
import { detectedPatterns } from './detected-patterns';
import { scoreHand } from './score';
import {
  detectSpecialHands,
  isFixedSpecialHandBinding,
  specialHandValueFor,
  type SpecialHandPatternBinding,
} from './special-hands';
import type { MahjongHand } from './types';

const testProfile = { id: 'test-calculated', version: '1' } as const;
const calculatedAndFixedBindings: SpecialHandPatternBinding[] = [
  {
    patternId: 'buried-treasure',
    profile: testProfile,
    name: 'Calculated test binding',
    description: 'Test-only calculated binding.',
    scoreModel: { kind: 'calculated' },
  },
  {
    patternId: 'buried-treasure',
    profile: testProfile,
    name: 'Fixed test binding',
    description: 'Test-only fixed binding.',
    value: 777,
  },
];

// This legal, concealed single-suit hand shares the existing BMJA Purity
// calculation path and the canonical Buried Treasure structure. The bindings
// remain entirely test-local.
const legalOverlap: MahjongHand = {
  sets: [
    set('p2', 'pung', suited('bamboo', 2)),
    set('p3', 'pung', suited('bamboo', 3)),
    set('p6', 'pung', suited('bamboo', 6)),
    set('p9', 'pung', suited('bamboo', 9)),
    set('pair', 'pair', suited('bamboo', 5)),
  ],
  bonusTiles: [],
  isWinner: true,
};

describe('calculated special-hand binding model', () => {
  it('represents a calculated binding and result without a fake numeric value', () => {
    const calculated = calculatedAndFixedBindings[0]!;
    const result = detectSpecialHands(legalOverlap, undefined, [calculated])[0]!;
    expect(calculated).toEqual(expect.objectContaining({ scoreModel: { kind: 'calculated' } }));
    expect(calculated).not.toHaveProperty('value');
    expect(result).toEqual(expect.objectContaining({ scoreModel: 'calculated', matched: true }));
    expect(result).not.toHaveProperty('value');
    expect(detectedPatterns(scoreHand(
      legalOverlap,
      { playerWind: 'east', prevailingWind: 'east', limit: 1000 },
      [calculated],
    ))).toContainEqual(expect.objectContaining({ name: 'Calculated test binding', effect: 'Calculated' }));
  });

  it('keeps calculated bindings out of fixed-value helpers at type level', () => {
    const calculated = calculatedAndFixedBindings[0]!;
    expect(isFixedSpecialHandBinding(calculated)).toBe(false);
    if (false) {
      // @ts-expect-error Calculated bindings have no fixed-value scoring route.
      specialHandValueFor(legalOverlap, calculated);
    }
  });

  it('keeps a legal test-only fixed overlap ahead of calculated scoring', () => {
    const result = scoreHand(
      legalOverlap,
      { playerWind: 'east', prevailingWind: 'east', limit: 1000 },
      calculatedAndFixedBindings,
    );
    expect(result.specialHands).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Calculated test binding', scoreModel: 'calculated', matched: true }),
      expect.objectContaining({ name: 'Fixed test binding', scoreModel: 'fixed', value: 777, matched: true }),
    ]));
    expect(result).toMatchObject({ finalScore: 777 });
    expect(result.calculationComponents).toEqual([
      expect.objectContaining({ id: 'special-buried-treasure', subtotal: 777 }),
    ]);
  });

  it('does not forbid exposed chows unless a calculated binding policy says so', () => {
    const chowAllowed: SpecialHandPatternBinding = {
      patternId: 'purity-one-chow',
      profile: testProfile,
      name: 'Chow-allowed calculated test binding',
      description: 'Test-only calculated exposure policy.',
      scoreModel: { kind: 'calculated', exposure: { multiplier: 0.5, triggerSetKinds: ['pung'] } },
    };
    const hand: MahjongHand = {
      sets: [
        set('p2', 'pung', suited('bamboo', 2)), set('p3', 'pung', suited('bamboo', 3)),
        set('p9', 'pung', suited('bamboo', 9)), set('chow', 'chow', suited('bamboo', 4), 'exposed'),
        set('pair', 'pair', suited('bamboo', 5)),
      ], bonusTiles: [], isWinner: true,
    };
    expect(detectSpecialHands(hand, undefined, [chowAllowed])).toContainEqual(
      expect.objectContaining({ id: 'purity-one-chow', matched: true }),
    );
  });
});
