import { describe, expect, it } from 'vitest';
import { set, suited, wind } from '../scoring';
import type { HandSet, MahjongHand, PlayingTile, SuitTile } from '../scoring';
import { bmjaSpecialHandBindings, canonicalSpecialHandPatterns } from '../scoring/special-hands';
import { detectSpecialFishing } from '../scoring/fishing';
import { BMJA_RULESET, WESTERN_TM_RULESET } from './ruleset';
import { westernTmSpecialHandBindings } from './western-tm-catalogue';

const p = (id: string, suit: SuitTile['suit'], rank: SuitTile['rank']) => set(id, 'pung', suited(suit, rank));
const k = (id: string, suit: SuitTile['suit'], rank: SuitTile['rank']) => set(id, 'kong', suited(suit, rank));
const q = (id: string, tile: PlayingTile) => set(id, 'pair', tile);
const hand = (rank: SuitTile['rank'], looseTiles: PlayingTile[] = [wind('south'), wind('west'), wind('north')], sets: HandSet[] = [p('b', 'bamboo', rank), p('c', 'characters', rank), p('o', 'circles', rank), q('pair', wind('east'))]): MahjongHand => ({ sets, looseTiles, bonusTiles: [], isWinner: true });
const score = (candidate: MahjongHand) => WESTERN_TM_RULESET.scoreHand({ hand: candidate, playerWind: 'east', prevailingWind: 'east' });
const ids = [
  ['wind-pair-with-three-suit-rank-one-melds', 'Windy Ones', 1],
  ['wind-pair-with-three-suit-rank-nine-melds', 'Windy Nines', 9],
  ['wind-pair-with-one-meld-in-each-suit', 'Windvane', undefined],
  ['wind-pair-with-three-suit-rank-three-melds', 'Three Sisters', 3],
  ['wind-pair-with-three-suit-rank-seven-melds', 'Seven Brothers', 7],
] as const;

describe('western-tm@0.1 Pass 4F wind-family hybrid catalogue wave', () => {
  it.each(ids)('%s has its canonical shape, local binding and BMJA isolation', (id, name, rank) => {
    const candidate = hand((rank ?? 4) as SuitTile['rank']);
    const detector = canonicalSpecialHandPatterns.find((pattern) => pattern.id === id)!;
    expect(detector.detect(candidate)).toBe(true);
    expect(detector.detect(hand((rank === undefined ? 4 : rank === 1 ? 2 : 1) as SuitTile['rank']))).toBe(rank === undefined);
    expect(detector.detect(hand((rank ?? 4) as SuitTile['rank'], [wind('south'), wind('west'), wind('west')]))).toBe(false);
    expect(score(candidate).specialHands).toContainEqual(expect.objectContaining({ id, name, value: 1000, matched: true }));
    expect(BMJA_RULESET.scoreHand({ hand: candidate, playerWind: 'east', prevailingWind: 'east' }).specialHands).not.toContainEqual(expect.objectContaining({ id }));
    expect(bmjaSpecialHandBindings.some((binding) => binding.patternId === id)).toBe(false);
  });

  it('requires exactly one suited Pung/Kong in each suit while leaving Windvane ranks independent', () => {
    const windy = canonicalSpecialHandPatterns.find(({ id }) => id === 'wind-pair-with-one-meld-in-each-suit')!;
    expect(windy.detect(hand(1, [wind('south'), wind('west'), wind('north')], [p('b', 'bamboo', 1), p('c', 'characters', 5), p('o', 'circles', 9), q('pair', wind('east'))]))).toBe(true);
    expect(windy.detect(hand(1, [wind('south'), wind('west'), wind('north')], [p('b', 'bamboo', 1), p('b2', 'bamboo', 5), p('o', 'circles', 9), q('pair', wind('east'))]))).toBe(false);
    expect(windy.detect(hand(1, [wind('south'), wind('west'), wind('north')], [p('b', 'bamboo', 1), p('c', 'characters', 5), set('honour', 'pung', wind('north')), q('pair', wind('east'))]))).toBe(false);
  });

  it('honours one-dot exposure and truthful concealed overlap without stacking', () => {
    const concealed = hand(1);
    expect(score(concealed).specialHands).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'wind-pair-with-three-suit-rank-one-melds', value: 1000, matched: true }),
      expect.objectContaining({ id: 'wind-pair-with-one-meld-in-each-suit', value: 1000, matched: true }),
    ]));
    expect(score(concealed).calculationComponents.filter(({ id }) => id.startsWith('special-'))).toEqual([expect.objectContaining({ subtotal: 1000 })]);
    const exposed = { ...concealed, sets: concealed.sets.map((group) => group.id === 'b' ? { ...group, visibility: 'exposed' as const } : group) };
    expect(score(exposed).specialHands).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'wind-pair-with-three-suit-rank-one-melds', value: 500, matched: true })]));
    expect(score(exposed).specialHands.find(({ id }) => id === 'wind-pair-with-one-meld-in-each-suit')?.matched).toBe(false);
    expect(score(exposed).calculationComponents.filter(({ id }) => id.startsWith('special-'))).toEqual([expect.objectContaining({ subtotal: 500 })]);
  });

  it('supports profile-local hybrid fishing while preserving each exposure policy', () => {
    const fishing: MahjongHand = { ...hand(1, [wind('south'), wind('west')]), isWinner: false };
    const find = (candidate: MahjongHand, id: string) => detectSpecialFishing(candidate, westernTmSpecialHandBindings).find((match) => match.id === id);
    expect(find(fishing, 'wind-pair-with-three-suit-rank-one-melds')).toMatchObject({ fishingValue: 400, completingTiles: expect.arrayContaining([wind('north')]) });
    const exposed = { ...fishing, sets: fishing.sets.map((group) => group.id === 'b' ? { ...group, visibility: 'exposed' as const } : group) };
    expect(find(exposed, 'wind-pair-with-three-suit-rank-one-melds')?.fishingValue).toBe(200);
    expect(find(exposed, 'wind-pair-with-one-meld-in-each-suit')).toBeUndefined();
    const vane = { ...hand(1, [wind('south'), wind('west')], [p('b', 'bamboo', 1), p('c', 'characters', 5), k('o', 'circles', 9), q('pair', wind('east'))]), isWinner: false };
    expect(find(vane, 'wind-pair-with-one-meld-in-each-suit')).toMatchObject({ fishingValue: 400, completingTiles: expect.arrayContaining([wind('north')]) });
    expect(find({ ...vane, sets: vane.sets.map((group) => group.id === 'o' ? { ...group, visibility: 'exposed' as const } : group) }, 'wind-pair-with-one-meld-in-each-suit')).toBeUndefined();
  });
});
