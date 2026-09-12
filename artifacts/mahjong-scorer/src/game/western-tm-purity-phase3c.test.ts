import { describe, expect, it } from 'vitest';
import { bonus, set, suited, wind } from '../scoring';
import type { MahjongHand } from '../scoring';
import { canonicalSpecialHandPatterns } from '../scoring/special-hands';
import { BMJA_RULESET, WESTERN_TM_RULESET, westernTmSpecialHandBindings } from './ruleset';

const scoreWestern = (hand: MahjongHand) =>
  WESTERN_TM_RULESET.scoreHand({ hand, playerWind: 'east', prevailingWind: 'east' });

const fourPungPurity: MahjongHand = {
  sets: [
    set('p2', 'pung', suited('bamboo', 2)), set('p3', 'pung', suited('bamboo', 3)),
    set('p6', 'pung', suited('bamboo', 6)), set('p9', 'pung', suited('bamboo', 9)),
    set('pair', 'pair', suited('bamboo', 5)),
  ], bonusTiles: [], isWinner: true,
};
const oneChowPurity: MahjongHand = {
  sets: [
    set('p2', 'pung', suited('bamboo', 2)), set('p3', 'pung', suited('bamboo', 3)),
    set('p9', 'pung', suited('bamboo', 9)), set('chow', 'chow', suited('bamboo', 4)),
    set('pair', 'pair', suited('bamboo', 5)),
  ], bonusTiles: [], isWinner: true,
};

describe('western-tm@0.1 Companion Phase 3C: calculated Purity', () => {
  it('binds exactly one calculated Purity to the distinct canonical structure', () => {
    const bindings = westernTmSpecialHandBindings.filter(({ patternId }) => patternId === 'purity-one-chow');
    expect(canonicalSpecialHandPatterns.filter(({ id }) => id === 'purity-one-chow')).toHaveLength(1);
    expect(bindings).toEqual([expect.objectContaining({ name: 'Purity', scoreModel: { kind: 'calculated', exposure: { multiplier: 0.5, triggerSetKinds: ['pung', 'kong'], forbiddenSetKinds: ['chow'] } } })]);
    expect(bindings[0]).not.toHaveProperty('value');
    expect(bindings[0]).not.toHaveProperty('fishingValue');
  });

  it('accepts four-pung and one-chow Purity, but rejects unsupported shapes', () => {
    const pattern = canonicalSpecialHandPatterns.find(({ id }) => id === 'purity-one-chow')!;
    expect(pattern.detect(fourPungPurity)).toBe(true);
    expect(pattern.detect(oneChowPurity)).toBe(true);
    const twoChows: MahjongHand = { ...oneChowPurity, sets: [
      set('p2', 'pung', suited('bamboo', 2)), set('p9', 'pung', suited('bamboo', 9)),
      set('chow-a', 'chow', suited('bamboo', 3)), set('chow-b', 'chow', suited('bamboo', 6)),
      set('pair', 'pair', suited('bamboo', 5)),
    ] };
    const mixed = { ...fourPungPurity, sets: fourPungPurity.sets.map((group) => group.id === 'p3' ? set('p3', 'pung', suited('circles', 3)) : group) };
    const honours = { ...fourPungPurity, sets: fourPungPurity.sets.map((group) => group.id === 'p3' ? set('p3', 'pung', wind('east')) : group) };
    expect(pattern.detect(twoChows)).toBe(false);
    expect(pattern.detect(mixed)).toBe(false);
    expect(pattern.detect(honours)).toBe(false);
  });

  it('rejects impossible copies and unexpected extra playing tiles', () => {
    const pattern = canonicalSpecialHandPatterns.find(({ id }) => id === 'purity-one-chow')!;
    const impossible = { ...fourPungPurity, sets: fourPungPurity.sets.map((group) => group.id === 'p3' ? set('p3', 'pung', suited('bamboo', 2)) : group) };
    expect(pattern.detect(impossible)).toBe(false);
    expect(pattern.detect({ ...fourPungPurity, looseTiles: [suited('bamboo', 7)] })).toBe(false);
    expect(pattern.detect({ ...fourPungPurity, remainingTiles: [suited('bamboo', 7)] })).toBe(false);
  });

  it('calculates concealed Purity and halves an equivalent represented exposed pung after ordinary calculation', () => {
    const concealed = scoreWestern(fourPungPurity);
    const exposedHand = { ...fourPungPurity, sets: fourPungPurity.sets.map((group) => group.id === 'p2' ? { ...group, visibility: 'exposed' as const } : group) };
    const exposed = scoreWestern(exposedHand);
    expect(concealed.specialHands).toContainEqual(expect.objectContaining({ id: 'purity-one-chow', scoreModel: 'calculated', matched: true }));
    expect(concealed.finalScore).toBe(320);
    // The ordinary exposed-pung calculation is 304; profile-local exposure halves it before the limit.
    expect(exposed).toMatchObject({ uncappedScore: 152, finalScore: 152, limitApplied: false });
    expect(exposed.calculationComponents).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'purity-playing-tiles', subtotal: 304 }),
      expect.objectContaining({ id: 'calculated-special-exposure-adjustment', label: 'Purity exposed adjustment', subtotal: -152 }),
    ]));
    expect(exposed.calculationComponents.reduce((sum, component) => sum + component.subtotal, 0)).toBe(exposed.uncappedScore);
  });

  it('does not halve an exposed pair and does not silently accept an exposed chow', () => {
    const exposedPair = { ...fourPungPurity, sets: fourPungPurity.sets.map((group) => group.id === 'pair' ? { ...group, visibility: 'exposed' as const } : group) };
    const exposedChow = { ...oneChowPurity, sets: oneChowPurity.sets.map((group) => group.id === 'chow' ? { ...group, visibility: 'exposed' as const } : group) };
    expect(scoreWestern(exposedPair).finalScore).toBe(320);
    expect(scoreWestern(exposedChow).specialHands).toContainEqual(expect.objectContaining({ id: 'purity-one-chow', matched: false }));
  });

  it('reports the matched one-chow calculated hand as special scoring mode', () => {
    expect(scoreWestern(oneChowPurity).scoringMode).toBe('special');
  });

  it('retains the ordinary 1000-point limit and leaves Western Purity fishing unresolved', () => {
    const fourKongs: MahjongHand = {
      sets: ([1, 2, 3, 4] as const).map((rank) => set(`k${rank}`, 'kong', suited('circles', rank))),
      bonusTiles: [], isWinner: true, winningMethod: 'final-discard',
    };
    fourKongs.sets.push(set('pair', 'pair', suited('circles', 5)));
    expect(scoreWestern(fourKongs)).toMatchObject({ finalScore: 1000, limitApplied: true });
    const fishing: MahjongHand = { sets: fourPungPurity.sets.slice(0, 4), remainingTiles: [suited('bamboo', 5), suited('bamboo', 5)], bonusTiles: [], isWinner: false };
    expect(scoreWestern(fishing).specialFishingMatches).toEqual([]);
  });

  it('leaves BMJA Purity winner scoring and fishing unchanged', () => {
    const bmjaPurity: MahjongHand = {
      sets: [
        set('p1', 'pung', suited('characters', 2), 'exposed'), set('p2', 'pung', suited('characters', 3)),
        set('p3', 'pung', suited('characters', 6)), set('k1', 'kong', suited('characters', 9)),
        set('pair', 'pair', suited('characters', 5)),
      ], bonusTiles: [bonus('flower', 1), bonus('season', 2)], isWinner: true, winningMethod: 'discard',
    };
    const bmja = BMJA_RULESET.scoreHand({ hand: bmjaPurity, playerWind: 'east', prevailingWind: 'east' });
    expect(bmja).toMatchObject({ finalScore: 512, uncappedScore: 512 });
    const fishing: MahjongHand = {
      sets: [set('1', 'pung', suited('bamboo', 2)), set('2', 'pung', suited('bamboo', 3)), set('3', 'kong', suited('bamboo', 6)), set('4', 'pair', suited('bamboo', 8))],
      remainingTiles: [suited('bamboo', 4), suited('bamboo', 4)], bonusTiles: [], isWinner: false,
    };
    expect(BMJA_RULESET.scoreHand({ hand: fishing, playerWind: 'east', prevailingWind: 'east' }).specialFishingMatches).toContainEqual(expect.objectContaining({ id: 'purity', fishingValue: 'three-doubles' }));
  });
});
