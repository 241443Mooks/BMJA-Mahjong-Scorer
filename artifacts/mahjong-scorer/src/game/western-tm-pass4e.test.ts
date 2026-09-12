import { describe, expect, it } from 'vitest';
import { dragon, set, suited, wind } from '../scoring';
import type { HandSet, MahjongHand, PlayingTile, SuitTile } from '../scoring';
import { bmjaSpecialHandBindings, canonicalSpecialHandPatterns } from '../scoring/special-hands';
import { detectSpecialFishing } from '../scoring/fishing';
import { BMJA_RULESET, WESTERN_TM_RULESET } from './ruleset';
import { westernTmSpecialHandBindings } from './western-tm-catalogue';

const g = (...sets: HandSet[]): MahjongHand => ({ sets, bonusTiles: [], isWinner: true });
const p = (id: string, tile: PlayingTile) => set(id, 'pung', tile);
const k = (id: string, tile: PlayingTile) => set(id, 'kong', tile);
const q = (id: string, tile: PlayingTile) => set(id, 'pair', tile);
const c = (id: string, suit: SuitTile['suit'], rank: 1 | 2 | 3 | 4 | 5 | 6 | 7) => set(id, 'chow', suited(suit, rank));
const l = (looseTiles: PlayingTile[]): MahjongHand => ({ sets: [], bonusTiles: [], isWinner: true, looseTiles });
const run = (suit: SuitTile['suit'], ranks: number[]) => ranks.map((rank) => suited(suit, rank as SuitTile['rank']));
const score = (hand: MahjongHand) => WESTERN_TM_RULESET.scoreHand({ hand, playerWind: 'east', prevailingWind: 'east' });

type Case = { id: string; name: string; value: number; fishing: number; hand: MahjongHand; miss: MahjongHand };
const cases: Case[] = [
  { id: 'suit-run-one-to-seven-with-winds-and-dragon-pung', name: "Greta's Dragon", value: 1000, fishing: 400, hand: l([...run('bamboo',[1,2,3,4,5,6,7]),wind('east'),wind('south'),wind('west'),wind('north'),dragon('red'),dragon('red'),dragon('red')]), miss: l([...run('bamboo',[1,2,3,4,5,6,7]),wind('east'),wind('south'),wind('west'),wind('west'),dragon('red'),dragon('red'),dragon('red')]) },
  { id: 'full-suit-run-with-dragon-singles-and-wind-pair', name: "Dragon's Run", value: 1500, fishing: 600, hand: l([...run('characters',[1,2,3,4,5,6,7,8,9]),dragon('green'),dragon('red'),dragon('white'),wind('east'),wind('east')]), miss: l([...run('characters',[1,2,3,4,5,6,7,8,9]),dragon('green'),dragon('red'),dragon('red'),wind('east'),wind('east')]) },
  { id: 'two-suit-pairs-and-chows-one-two-five-six-nine', name: 'Yin Yang', value: 1000, fishing: 400, hand: l([...run('bamboo',[1,1,2,3,4,5,5]),...run('circles',[5,5,6,7,8,9,9])]), miss: l([...run('bamboo',[1,1,2,3,4,5,5]),...run('bamboo',[5,5,6,7,8,9,9])]) },
  { id: 'three-suit-chows-with-suited-meld-and-pair', name: 'Little Robert', value: 500, fishing: 200, hand: g(c('b','bamboo',2),c('c','characters',4),c('o','circles',6),k('m',suited('characters',8)),q('pair',suited('bamboo',9))), miss: g(c('b','bamboo',2),c('c','characters',4),c('o','circles',6),c('x','bamboo',5),q('pair',suited('bamboo',9))) },
  { id: 'circle-chows-with-one-two-three-four-five-six-seven-eight-nine', name: 'Moon at Bottom of Well', value: 1000, fishing: 400, hand: g(c('a','circles',1),c('b','circles',4),c('c','circles',7),c('d','circles',2),q('pair',suited('circles',5))), miss: g(c('a','circles',1),c('b','circles',4),c('c','bamboo',7),c('d','circles',2),q('pair',suited('circles',5))) },
  { id: 'wind-pair-with-three-suit-chows', name: 'Windy Chow', value: 500, fishing: 200, hand: l([wind('east'),wind('east'),wind('south'),wind('west'),wind('north'),...run('bamboo',[2,3,4]),...run('characters',[4,5,6]),...run('circles',[6,7,8])]), miss: l([wind('east'),wind('east'),wind('south'),wind('west'),wind('west'),...run('bamboo',[2,3,4]),...run('characters',[4,5,6]),...run('circles',[6,7,8])]) },
  { id: 'wind-pair-with-three-suit-one-two-three-chows', name: 'Chop Suey', value: 500, fishing: 200, hand: l([wind('east'),wind('east'),wind('south'),wind('west'),wind('north'),...run('bamboo',[1,2,3]),...run('characters',[1,2,3]),...run('circles',[1,2,3])]), miss: l([wind('east'),wind('east'),wind('south'),wind('west'),wind('north'),...run('bamboo',[2,3,4]),...run('characters',[1,2,3]),...run('circles',[1,2,3])]) },
  { id: 'wind-pair-with-three-suit-seven-eight-nine-chows', name: 'Chow Mein', value: 500, fishing: 200, hand: l([wind('east'),wind('east'),wind('south'),wind('west'),wind('north'),...run('bamboo',[7,8,9]),...run('characters',[7,8,9]),...run('circles',[7,8,9])]), miss: l([wind('east'),wind('east'),wind('south'),wind('west'),wind('north'),...run('bamboo',[6,7,8]),...run('characters',[7,8,9]),...run('circles',[7,8,9])]) },
];

describe('western-tm@0.1 Companion Pass 4E catalogue wave', () => {
  it.each(cases)('$name has canonical, binding and BMJA-isolation evidence', ({ id, name, value, hand, miss }) => {
    const detector = canonicalSpecialHandPatterns.find((pattern) => pattern.id === id)!;
    expect(detector.detect(hand)).toBe(true);
    expect(detector.detect(miss)).toBe(false);
    expect(score(hand).specialHands).toContainEqual(expect.objectContaining({ id, name, value, matched: true }));
    expect(BMJA_RULESET.scoreHand({ hand, playerWind: 'east', prevailingWind: 'east' }).specialHands).not.toContainEqual(expect.objectContaining({ id }));
    expect(bmjaSpecialHandBindings.some((binding) => binding.patternId === id)).toBe(false);
  });

  it('keeps Windy Chow truthfully overlapping Chop Suey and Chow Mein without stacking values', () => {
    const windy = canonicalSpecialHandPatterns.find(({ id }) => id === 'wind-pair-with-three-suit-chows')!.detect;
    expect(windy(cases[6]!.hand)).toBe(true);
    expect(windy(cases[7]!.hand)).toBe(true);
    expect(score(cases[6]!.hand).calculationComponents).toContainEqual(expect.objectContaining({ id: 'special-wind-pair-with-three-suit-chows', subtotal: 500 }));
    expect(score(cases[7]!.hand).calculationComponents).toContainEqual(expect.objectContaining({ id: 'special-wind-pair-with-three-suit-chows', subtotal: 500 }));
  });

  it('finds representative loose, grouped and Windy Chow-family fishing', () => {
    const find = (hand: MahjongHand, id: string) => detectSpecialFishing(hand, westernTmSpecialHandBindings).find((match) => match.id === id);
    const groupedFishing = { ...cases[3]!.hand, isWinner: false, sets: cases[3]!.hand.sets.slice(0, -1), remainingTiles: [suited('bamboo', 9)] };
    expect(find(groupedFishing, cases[3]!.id)?.fishingValue).toBe(200);
    expect(find({ ...cases[6]!.hand, isWinner: false, looseTiles: cases[6]!.hand.looseTiles!.slice(0, -1) }, cases[6]!.id)?.fishingValue).toBe(200);
  });
});
