import { describe, expect, it } from 'vitest';
import { dragon, set, suited, wind } from '../scoring';
import type { MahjongHand, Suit } from '../scoring';
import { canonicalSpecialHandPatterns } from '../scoring/special-hands';
import { BMJA_RULESET, WESTERN_TM_RULESET, westernTmSpecialHandBindings } from './ruleset';

const chows = (suit: Suit, exposed = false) => [1, 4, 7].map((rank) => set(`chow-${rank}`, 'chow', suited(suit, rank as 1 | 4 | 7), exposed ? 'exposed' : 'concealed'));
const grouped = (suit: Suit, pungTile: ReturnType<typeof suited> | ReturnType<typeof wind> | ReturnType<typeof dragon>, pairTile: ReturnType<typeof suited> | ReturnType<typeof wind> | ReturnType<typeof dragon>, options: { pungKind?: 'pung' | 'kong'; pungExposed?: boolean; pairExposed?: boolean; chowExposed?: boolean } = {}): MahjongHand => ({
  sets: [...chows(suit, options.chowExposed), set('pung', options.pungKind ?? 'pung', pungTile, options.pungExposed ? 'exposed' : 'concealed'), set('pair', 'pair', pairTile, options.pairExposed ? 'exposed' : 'concealed')],
  bonusTiles: [], isWinner: true,
});
const score = (hand: MahjongHand) => WESTERN_TM_RULESET.scoreHand({ hand, playerWind: 'east', prevailingWind: 'east' });
const ids = [
  'run-one-to-nine-with-same-suit-pung-and-pair',
  'run-one-to-nine-with-wind-pung-and-pair',
  'run-one-to-nine-with-dragon-pung-and-pair',
  'run-one-to-nine-with-honour-pung-and-any-pair',
] as const;
const detector = (id: string) => canonicalSpecialHandPatterns.find((pattern) => pattern.id === id)!;

describe('western-tm@0.1 Companion Pass 4B grouped run hands', () => {
  it('adds four Western-only 1000 / 400 concealed-Pung bindings', () => {
    expect(westernTmSpecialHandBindings).toHaveLength(25);
    for (const id of ids) {
      expect(westernTmSpecialHandBindings.filter(({ patternId }) => patternId === id)).toEqual([expect.objectContaining({ value: 1000, fishingValue: 400, exposure: { allowed: false } })]);
    }
  });

  it('recognises Run, Pung & Pair only with the complete same-suit run and groups', () => {
    const hand = grouped('bamboo', suited('bamboo', 5), suited('bamboo', 3));
    expect(detector(ids[0]).detect(hand)).toBe(true);
    expect(detector(ids[0]).detect(grouped('bamboo', suited('bamboo', 5), suited('bamboo', 3), { pungKind: 'kong' }))).toBe(false);
    const mixed = grouped('bamboo', suited('bamboo', 5), suited('bamboo', 3)); mixed.sets[1] = set('chow-4', 'chow', suited('circles', 4));
    const missing = grouped('bamboo', suited('bamboo', 5), suited('bamboo', 3)); missing.sets[2] = set('chow-7', 'chow', suited('bamboo', 4));
    expect(detector(ids[0]).detect(mixed)).toBe(false);
    expect(detector(ids[0]).detect(missing)).toBe(false);
    expect(detector(ids[0]).detect(grouped('bamboo', suited('circles', 5), suited('bamboo', 3)))).toBe(false);
    expect(detector(ids[0]).detect(grouped('bamboo', suited('bamboo', 5), suited('circles', 3)))).toBe(false);
  });

  it('recognises Guardian Winds and Guardian Dragons with their respective honour groups', () => {
    expect(detector(ids[1]).detect(grouped('circles', wind('east'), wind('south')))).toBe(true);
    expect(detector(ids[1]).detect(grouped('circles', wind('east'), wind('south'), { pungKind: 'kong' }))).toBe(true);
    expect(detector(ids[1]).detect(grouped('circles', wind('east'), suited('circles', 2)))).toBe(false);
    expect(detector(ids[1]).detect(grouped('circles', dragon('red'), wind('south')))).toBe(false);
    const mixedRun = grouped('circles', wind('east'), wind('south')); mixedRun.sets[1] = set('chow-4', 'chow', suited('bamboo', 4));
    expect(detector(ids[1]).detect(mixedRun)).toBe(false);
    expect(detector(ids[2]).detect(grouped('characters', dragon('red'), dragon('green')))).toBe(true);
    expect(detector(ids[2]).detect(grouped('characters', dragon('red'), dragon('green'), { pungKind: 'kong' }))).toBe(true);
    expect(detector(ids[2]).detect(grouped('characters', wind('east'), dragon('green')))).toBe(false);
    expect(detector(ids[2]).detect(grouped('characters', dragon('red'), suited('characters', 2)))).toBe(false);
  });

  it('recognises Grand Sequence with either honour Pung and every legal pair family', () => {
    for (const hand of [
      grouped('bamboo', wind('east'), suited('bamboo', 2)),
      grouped('bamboo', dragon('red'), suited('circles', 2)),
      grouped('bamboo', wind('east'), wind('south')),
      grouped('bamboo', dragon('red'), dragon('green')),
      grouped('bamboo', wind('east'), suited('bamboo', 2), { pungKind: 'kong' }),
    ]) expect(detector(ids[3]).detect(hand)).toBe(true);
    expect(detector(ids[3]).detect(grouped('bamboo', suited('bamboo', 5), dragon('red')))).toBe(false);
  });

  it('selects each concealed hand locally, excludes BMJA, and rejects represented exposed Pungs only', () => {
    const fixtures = [
      [ids[0], grouped('bamboo', suited('bamboo', 5), suited('bamboo', 3))],
      [ids[1], grouped('circles', wind('east'), wind('south'))],
      [ids[2], grouped('characters', dragon('red'), dragon('green'))],
      [ids[3], grouped('bamboo', wind('east'), dragon('red'))],
    ] as const;
    for (const [id, hand] of fixtures) {
      expect(score(hand).specialHands).toContainEqual(expect.objectContaining({ id, matched: true, value: 1000 }));
      expect(BMJA_RULESET.scoreHand({ hand, playerWind: 'east', prevailingWind: 'east' }).specialHands.some((special) => special.id === id)).toBe(false);
      const exposedPung = { ...hand, sets: hand.sets.map((group) => group.id === 'pung' ? { ...group, visibility: 'exposed' as const } : group) };
      expect(score(exposedPung).specialHands).toContainEqual(expect.objectContaining({ id, matched: false }));
      const exposedPair = { ...hand, sets: hand.sets.map((group) => group.id === 'pair' ? { ...group, visibility: 'exposed' as const } : group) };
      const exposedChow = { ...hand, sets: hand.sets.map((group) => group.id === 'chow-1' ? { ...group, visibility: 'exposed' as const } : group) };
      expect(score(exposedPair).specialHands).toContainEqual(expect.objectContaining({ id, matched: true }));
      expect(score(exposedChow).specialHands).toContainEqual(expect.objectContaining({ id, matched: true }));
    }
  });

  it('fishes through multiple Chows for a run tile, pair, or Pung completion but not an exposed Pung', () => {
    const near = (hand: MahjongHand, setId: string, remainingTiles: (ReturnType<typeof suited> | ReturnType<typeof wind> | ReturnType<typeof dragon>)[]) => ({ ...hand, sets: hand.sets.filter((group) => group.id !== setId), remainingTiles, isWinner: false });
    const run = grouped('bamboo', wind('east'), wind('south'));
    const pair = grouped('circles', dragon('red'), dragon('green'));
    const pung = grouped('characters', wind('east'), dragon('red'));
    expect(score(near(run, 'chow-7', [suited('bamboo', 7), suited('bamboo', 8)])).specialFishingMatches).toContainEqual(expect.objectContaining({ id: ids[1], fishingValue: 400 }));
    expect(score(near(pair, 'pair', [dragon('green')])).specialFishingMatches).toContainEqual(expect.objectContaining({ id: ids[2], fishingValue: 400 }));
    expect(score(near(pung, 'pung', [wind('east'), wind('east')])).specialFishingMatches).toContainEqual(expect.objectContaining({ id: ids[3], fishingValue: 400 }));
    const exposed = grouped('bamboo', wind('east'), wind('south'), { pungExposed: true });
    expect(score(near(exposed, 'pair', [wind('south')])).specialFishingMatches).not.toContainEqual(expect.objectContaining({ id: ids[1] }));
  });

  it('rejects physical fifth copies for every grouped shape', () => {
    expect(detector(ids[0]).detect(grouped('bamboo', suited('bamboo', 1), suited('bamboo', 1)))).toBe(false);
    expect(detector(ids[1]).detect(grouped('bamboo', wind('east'), wind('east')))).toBe(false);
    expect(detector(ids[2]).detect(grouped('bamboo', dragon('red'), dragon('red')))).toBe(false);
    expect(detector(ids[3]).detect(grouped('bamboo', wind('east'), wind('east')))).toBe(false);
  });
});
