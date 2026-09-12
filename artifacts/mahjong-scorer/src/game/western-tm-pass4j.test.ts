import { describe, expect, it } from 'vitest';
import { dragon, set, suited, wind } from '../scoring';
import type { MahjongHand, PlayingTile, SuitTile } from '../scoring';
import { detectSpecialFishing } from '../scoring/fishing';
import { canonicalSpecialHandPatterns, isFixedSpecialHandBinding } from '../scoring/special-hands';
import { BMJA_RULESET, WESTERN_TM_RULESET } from './ruleset';
import { westernTmSpecialHandBindings } from './western-tm-catalogue';

const p = (id: string, tile: PlayingTile) => set(id, 'pung', tile);
const k = (id: string, tile: PlayingTile) => set(id, 'kong', tile);
const q = (id: string, tile: PlayingTile) => set(id, 'pair', tile);
const l = (looseTiles: PlayingTile[]): MahjongHand => ({ sets: [], looseTiles, bonusTiles: [], isWinner: true });
const run = (suit: SuitTile['suit'], ranks: number[]) => ranks.map((rank) => suited(suit, rank as SuitTile['rank']));
const detector = (id: string) => canonicalSpecialHandPatterns.find((pattern) => pattern.id === id)!;
const score = (hand: MahjongHand, playerWind: 'east' | 'south' = 'east') => WESTERN_TM_RULESET.scoreHand({ hand, playerWind, prevailingWind: playerWind === 'east' ? 'south' : 'east' });
const fishing = (hand: MahjongHand, id: string, playerWind: 'east' | 'south' = 'east') => detectSpecialFishing(hand, westernTmSpecialHandBindings, { playerWind, prevailingWind: playerWind === 'east' ? 'south' : 'east', limit: 1000 }).find((match) => match.id === id);

describe('western-tm@0.1 Pass 4J certification and fixed wave', () => {
  it('certifies all four corrected source values without changing their predicates', () => {
    expect(westernTmSpecialHandBindings.filter(isFixedSpecialHandBinding).filter((binding) => ['wind-pair-with-three-suit-one-two-three-chows', 'wind-pair-with-three-suit-seven-eight-nine-chows', 'four-chows-three-suits-with-own-wind-pair', 'two-odd-suits-and-one-even-suit'].includes(binding.patternId)).map(({ patternId, value, fishingValue }) => [patternId, value, fishingValue])).toEqual([
      ['wind-pair-with-three-suit-one-two-three-chows', 1000, 400], ['wind-pair-with-three-suit-seven-eight-nine-chows', 1000, 400], ['two-odd-suits-and-one-even-suit', 1500, 600], ['four-chows-three-suits-with-own-wind-pair', 500, 200],
    ]);
  });

  it('uses a neutral Western Gates detector, preserving BMJA completion semantics', () => {
    const gates = l([...run('circles', [1,1,1,2,3,4,5,5,6,7,8,9,9,9])]);
    const id = 'western-gates-of-heaven';
    expect(detector(id).detect(gates)).toBe(true);
    for (const rank of [2,3,4,5,6,7,8]) expect(detector(id).detect(l([...run('bamboo', [1,1,1,2,3,4,5,6,7,8,9,9,9]), suited('bamboo', rank as SuitTile['rank'])]))).toBe(true);
    expect(detector(id).detect(l([...run('bamboo', [1,1,1,2,3,4,5,5,6,7,8,9,9]), suited('characters', 9)]))).toBe(false);
    expect(detector(id).detect(l([...run('circles', [1,1,2,3,4,5,5,6,7,8,9,9,9,9])]))).toBe(false);
    expect(detector(id).detect(l([...run('circles', [1,1,1,2,3,4,5,5,6,7,8,8,9,9])]))).toBe(false);
    expect(score(gates).specialHands).toContainEqual(expect.objectContaining({ id, value: 1000 }));
    expect(BMJA_RULESET.scoreHand({ hand: gates, playerWind: 'east', prevailingWind: 'east' }).specialHands.some((match) => match.id === id)).toBe(false);
    expect(fishing({ ...gates, isWinner: false, looseTiles: gates.looseTiles!.slice(0, -1) }, id)?.fishingValue).toBe(400);
  });

  it("recognises Gertie's Garter as two exact loose 1–7 runs", () => {
    const id = 'two-suit-runs-one-to-seven'; const hand = l([...run('bamboo',[1,2,3,4,5,6,7]), ...run('characters',[1,2,3,4,5,6,7])]);
    expect(detector(id).detect(hand)).toBe(true); expect(score(hand).specialHands).toContainEqual(expect.objectContaining({ id, value: 1000 }));
    expect(detector(id).detect(l([...run('bamboo',[1,2,3,4,5,6,7]), ...run('bamboo',[1,2,3,4,5,6,7])]))).toBe(false);
    expect(detector(id).detect(l([...run('bamboo',[1,2,3,4,5,6,7]), ...run('characters',[1,2,3,4,5,6]), suited('circles',7)]))).toBe(false);
    expect(fishing({ ...hand, isWinner: false, looseTiles: hand.looseTiles!.slice(0, -1) }, id)?.fishingValue).toBe(400);
  });

  it('applies Lillypilly one-dot exposure only to its represented Pungs/Kongs', () => {
    const id = 'green-dragon-pung-white-dragon-pair-three-circle-melds'; const hand: MahjongHand = { sets: [p('green',dragon('green')), p('one',suited('circles',1)), k('five',suited('circles',5)), p('nine',suited('circles',9)), q('white',dragon('white'))], bonusTiles: [], isWinner: true };
    expect(detector(id).detect(hand)).toBe(true); expect(score(hand).specialHands).toContainEqual(expect.objectContaining({ id, value: 1000 }));
    expect(detector(id).detect({ ...hand, sets: [k('green',dragon('green')), ...hand.sets.slice(1)] })).toBe(false);
    expect(detector(id).detect({ ...hand, sets: [...hand.sets.slice(0,4),q('red',dragon('red'))] })).toBe(false);
    expect(score({ ...hand, sets: hand.sets.map((group) => group.id === 'green' ? { ...group, visibility: 'exposed' as const } : group) }).specialHands).toContainEqual(expect.objectContaining({ id, value: 500 }));
    expect(score({ ...hand, sets: hand.sets.map((group) => group.id === 'five' ? { ...group, visibility: 'exposed' as const } : group) }).specialHands).toContainEqual(expect.objectContaining({ id, value: 500 }));
    const near = { ...hand, isWinner: false, sets: hand.sets.filter((group) => group.kind !== 'pair'), remainingTiles: [dragon('white')] };
    expect(fishing(near,id)?.fishingValue).toBe(400); expect(fishing({ ...near, sets: near.sets.map((group) => group.id === 'one' ? { ...group, visibility: 'exposed' as const } : group) },id)?.fishingValue).toBe(200);
  });

  it('keeps Numbers Doubled distinct from Numbers in Parallel and exposure-neutral', () => {
    const id = 'two-ranks-doubled-across-two-suits-with-honour-pair'; const hand: MahjongHand = { sets: [p('b6',suited('bamboo',6)), k('c6',suited('characters',6)), p('b7',suited('bamboo',7)), p('c7',suited('characters',7)), q('pair',wind('east'))], bonusTiles: [], isWinner: true };
    expect(detector(id).detect(hand)).toBe(true); expect(score({ ...hand, sets: hand.sets.map((group) => group.id === 'b6' ? { ...group, visibility: 'exposed' as const } : group) }).specialHands).toContainEqual(expect.objectContaining({ id, value: 1500 }));
    expect(detector(id).detect({ ...hand, sets: [...hand.sets.slice(0,3),p('c9',suited('characters',9)),hand.sets[4]!] })).toBe(false);
    const near = { ...hand, isWinner: false, sets: hand.sets.filter((group) => group.kind !== 'pair'), remainingTiles: [wind('east')] }; expect(fishing(near,id)?.fishingValue).toBe(600);
  });

  it('recognises Civil War hybrid layout and full two-dot exposure', () => {
    const id = 'north-south-wind-melds-with-1861-and-1865-two-suit-layout'; const hand: MahjongHand = { sets: [k('north',wind('north')),p('south',wind('south'))], looseTiles: [...run('bamboo',[1,1,6,8]),...run('characters',[1,5,6,8])], bonusTiles: [], isWinner: true };
    expect(detector(id).detect(hand)).toBe(true); expect(score({ ...hand, sets: hand.sets.map((group) => ({ ...group, visibility: 'exposed' as const })) }).specialHands).toContainEqual(expect.objectContaining({ id, value: 1500 }));
    expect(detector(id).detect({ ...hand, sets: [p('east',wind('east')),p('west',wind('west'))] })).toBe(false);
    expect(fishing({ ...hand, isWinner: false, looseTiles: hand.looseTiles!.slice(0,-1) },id)?.fishingValue).toBe(600);
  });

  it("recognises Dragon's Gates terminal Pungs/Kongs and suit-dragon mapping", () => {
    const id = 'two-to-eight-run-pair-with-terminal-meld-and-corresponding-dragon-meld';
    for (const [suit, colour] of [['bamboo','green'],['characters','red'],['circles','white']] as const) {
      const hand: MahjongHand = { sets: [k('terminal',suited(suit,9)),k('dragon',dragon(colour))], looseTiles: [...run(suit,[2,3,4,5,5,6,7,8])], bonusTiles: [], isWinner: true };
      expect(detector(id).detect(hand)).toBe(true); expect(score(hand).specialHands).toContainEqual(expect.objectContaining({ id, value: 1000 }));
      expect(score({ ...hand, sets: hand.sets.map((group) => group.id === 'terminal' ? { ...group, visibility: 'exposed' as const } : group) }).specialHands).toContainEqual(expect.objectContaining({ id, value: 500 }));
      const near = { ...hand, isWinner: false, looseTiles: hand.looseTiles!.slice(0,-1) }; expect(fishing(near,id)?.fishingValue).toBe(400); expect(fishing({ ...near, sets: near.sets.map((group) => group.id === 'dragon' ? { ...group, visibility: 'exposed' as const } : group) },id)?.fishingValue).toBe(200);
    }
  });

  it('preserves own-Wind context for Red Lantern and halves either exposed meld', () => {
    const id = 'one-to-seven-run-pair-with-red-dragon-and-own-wind-melds';
    for (const own of ['east','south'] as const) {
      const hand: MahjongHand = { sets: [k('red',dragon('red')),p('own',wind(own))], looseTiles: [...run('circles',[1,2,3,4,4,5,6,7])], bonusTiles: [], isWinner: true };
      expect(detector(id).detect(hand,{ playerWind: own, prevailingWind: own === 'east' ? 'south' : 'east', limit: 1000 })).toBe(true);
      expect(detector(id).detect(hand,{ playerWind: own === 'east' ? 'south' : 'east', prevailingWind: own, limit: 1000 })).toBe(false);
      expect(score(hand,own).specialHands).toContainEqual(expect.objectContaining({ id, value: 2000 }));
      expect(score({ ...hand, sets: hand.sets.map((group) => group.id === 'red' ? { ...group, visibility: 'exposed' as const } : group) },own).specialHands).toContainEqual(expect.objectContaining({ id, value: 1000 }));
      const near = { ...hand, isWinner: false, looseTiles: hand.looseTiles!.slice(0,-1) }; expect(fishing(near,id,own)?.fishingValue).toBe(800); expect(fishing({ ...near, sets: near.sets.map((group) => group.id === 'own' ? { ...group, visibility: 'exposed' as const } : group) },id,own)?.fishingValue).toBe(400);
    }
  });
});
