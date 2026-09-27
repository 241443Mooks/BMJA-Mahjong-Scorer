import { beforeAll, describe, expect, it } from 'vitest';
import { dragon, set, suited, wind } from '../scoring';
import { BUZZARD_2000_PROFILE_REF } from '../game/buzzard-2000';
import { BMJA_PROFILE_REF } from '../game/ruleset';
import { initialiseCurrentRulesRuntimes } from './current-runtime-registry';
import { classicalFactIsMaterial } from './classical-materiality';

const context = { playerWind: 'east' as const, prevailingWind: 'east' as const, limit: 1000 };
const hand = {
  sets: [set('pung', 'pung', suited('bamboo', 2)), set('chow', 'chow', suited('characters', 1)), set('dragon', 'pung', dragon('red')),
    set('wind', 'pung', wind('east')), set('pair', 'pair', suited('circles', 5))],
  bonusTiles: [], isWinner: true, winningMethod: 'wall' as const, originalCall: false,
};

describe('Classical exact-runtime evidence materiality', () => {
  beforeAll(async () => initialiseCurrentRulesRuntimes());

  it('detects material facts from stable exact-runtime conclusions', () => {
    expect(classicalFactIsMaterial(BMJA_PROFILE_REF, hand, context, [
      { hand }, { hand: { ...hand, winningMethod: 'discard' } },
    ])).toBe(true);
  });

  it('detects material BMJA Original Call evidence', () => {
    expect(classicalFactIsMaterial(BMJA_PROFILE_REF, hand, context, [
      { hand: { ...hand, originalCall: false } }, { hand: { ...hand, originalCall: true } },
    ])).toBe(true);
  });

  it('detects standalone player and prevailing Wind materiality', () => {
    expect(classicalFactIsMaterial(BMJA_PROFILE_REF, hand, context, [
      { context: { ...context, playerWind: 'east' } }, { context: { ...context, playerWind: 'south' } },
    ])).toBe(true);
    expect(classicalFactIsMaterial(BMJA_PROFILE_REF, hand, context, [
      { context: { ...context, prevailingWind: 'east' } }, { context: { ...context, prevailingWind: 'south' } },
    ])).toBe(true);
  });

  it('treats winning method as irrelevant for a non-winner', () => {
    expect(classicalFactIsMaterial(BUZZARD_2000_PROFILE_REF, hand, context, [
      { hand: { ...hand, isWinner: false, winningMethod: 'wall' } }, { hand: { ...hand, isWinner: false, winningMethod: 'discard' } },
    ])).toBe(false);
  });

  it('keeps a disabled profile treatment irrelevant', () => {
    expect(classicalFactIsMaterial(BUZZARD_2000_PROFILE_REF, hand, context, [
      { hand }, { hand: { ...hand, originalCall: true } },
    ])).toBe(false);
  });
});
