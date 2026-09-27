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

  it('keeps a disabled profile treatment irrelevant', () => {
    expect(classicalFactIsMaterial(BUZZARD_2000_PROFILE_REF, hand, context, [
      { hand }, { hand: { ...hand, originalCall: true } },
    ])).toBe(false);
  });
});
