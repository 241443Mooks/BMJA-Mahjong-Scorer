import { describe, expect, it } from 'vitest';
import { dragon, set, suited } from '../scoring';
import type { MahjongHand, Suit } from '../scoring';
import { canonicalSpecialHandPatterns } from '../scoring/special-hands';
import {
  BMJA_RULESET,
  WESTERN_TM_RULESET,
  westernTmSpecialHandBindings,
} from './ruleset';

const dragonFor = { bamboo: 'green', characters: 'red', circles: 'white' } as const;
const goldenGates = (
  suit: Suit,
  terminal: 1 | 9 = 1,
  exposed = false,
  terminalKind: 'pung' | 'kong' = 'pung',
): MahjongHand => ({
  sets: [
    set('terminal', terminalKind, suited(suit, terminal), exposed ? 'exposed' : 'concealed'),
    set('dragon', 'pung', dragon(dragonFor[suit]), 'concealed'),
    ...([2, 4, 6, 8] as const).map((rank) => set(`pair-${rank}`, 'pair', suited(suit, rank))),
  ],
  bonusTiles: [],
  isWinner: true,
});

const scoreWestern = (hand: MahjongHand) =>
  WESTERN_TM_RULESET.scoreHand({ hand, playerWind: 'east', prevailingWind: 'east' });

describe('western-tm@0.1 Companion Phase 3B: Golden Gates', () => {
  const pattern = canonicalSpecialHandPatterns.find(({ id }) => id === 'golden-gates')!;

  it('recognises both terminal alternatives and all corresponding suit/Dragon mappings', () => {
    expect(pattern.detect(goldenGates('bamboo', 1))).toBe(true);
    expect(pattern.detect(goldenGates('characters', 9))).toBe(true);
    expect(pattern.detect(goldenGates('circles', 1, false, 'kong'))).toBe(true);
  });

  it('rejects malformed structure, including the wrong Dragon and non-Pung/Kong terminal', () => {
    const wrongDragon = goldenGates('bamboo');
    wrongDragon.sets[1] = set('dragon', 'pung', dragon('red'));
    const wrongPair = goldenGates('characters');
    wrongPair.sets[4] = set('pair-6', 'pair', suited('characters', 7));
    const otherSuitTerminal = goldenGates('circles');
    otherSuitTerminal.sets[0] = set('terminal', 'pung', suited('bamboo', 1));
    const chow = goldenGates('bamboo');
    chow.sets[0] = set('terminal', 'chow', suited('bamboo', 1));
    const extraHonour = goldenGates('bamboo');
    extraHonour.sets[5] = set('pair-8', 'pair', dragon('green'));
    for (const hand of [wrongDragon, wrongPair, otherSuitTerminal, chow, extraHonour]) {
      expect(pattern.detect(hand)).toBe(false);
    }
  });

  it('binds Golden Gates only to Western with the explicit exposure policy', () => {
    expect(westernTmSpecialHandBindings).toHaveLength(21);
    expect(westernTmSpecialHandBindings.filter(({ patternId }) => patternId === 'golden-gates')).toEqual([
      expect.objectContaining({
        profile: { id: 'western-tm', version: '0.1' },
        name: 'Golden Gates',
        value: 1000,
        fishingValue: 400,
        exposure: { allowed: true, exposedValue: 500, exposedFishingValue: 200 },
      }),
    ]);
    expect(BMJA_RULESET.scoreHand({ hand: goldenGates('bamboo'), playerWind: 'east', prevailingWind: 'east' }).specialHands.some(({ id }) => id === 'golden-gates')).toBe(false);
  });

  it('scores concealed and represented-exposed winners at their binding values', () => {
    const concealed = scoreWestern(goldenGates('bamboo', 1));
    const exposed = scoreWestern(goldenGates('characters', 9, true));
    const exposedDragon = goldenGates('circles', 1);
    exposedDragon.sets[1] = set('dragon', 'pung', dragon('white'), 'exposed');
    expect(concealed).toMatchObject({ valid: true, scoringMode: 'special', finalScore: 1000 });
    expect(exposed).toMatchObject({ valid: true, scoringMode: 'special', finalScore: 500 });
    expect(scoreWestern(exposedDragon)).toMatchObject({ valid: true, scoringMode: 'special', finalScore: 500 });
  });

  it('keeps a claimed winning pair structural and concealed-valued', () => {
    const claimedPair: MahjongHand = {
      ...goldenGates('bamboo', 1),
      sets: goldenGates('bamboo', 1).sets.map((group) =>
        group.id === 'pair-8' ? { ...group, visibility: 'exposed' } : group,
      ),
      winningMethod: 'discard',
    };
    expect(pattern.detect(claimedPair)).toBe(true);
    expect(scoreWestern(claimedPair)).toMatchObject({
      valid: true,
      scoringMode: 'special',
      finalScore: 1000,
    });
  });

  it('uses the profile-local concealed and exposed fishing values', () => {
    const fishing = (suit: Suit, exposed: boolean): MahjongHand => ({
      ...goldenGates(suit, 1, exposed),
      sets: goldenGates(suit, 1, exposed).sets.filter(({ id }) => id !== 'pair-8'),
      remainingTiles: [suited(suit, 8)],
      isWinner: false,
    });
    expect(scoreWestern(fishing('circles', false)).specialFishingMatches).toContainEqual(
      expect.objectContaining({ id: 'golden-gates', fishingValue: 400 }),
    );
    expect(scoreWestern(fishing('bamboo', true)).specialFishingMatches).toContainEqual(
      expect.objectContaining({ id: 'golden-gates', fishingValue: 200 }),
    );
  });

  it('does not alter pre-existing Western binding values or BMJA fishing membership', () => {
    expect(westernTmSpecialHandBindings.find(({ patternId }) => patternId === 'wriggly-dragon')).toMatchObject({ value: 1000, fishingValue: 400 });
    expect(BMJA_RULESET.scoreHand({ hand: goldenGates('circles'), playerWind: 'east', prevailingWind: 'east' }).specialFishingMatches).not.toContainEqual(expect.objectContaining({ id: 'golden-gates' }));
  });
});
