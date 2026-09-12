import { describe, expect, it } from 'vitest';
import { dragon, set, suited, wind } from '../scoring';
import type { HandSet, MahjongHand, PlayingTile, SuitTile } from '../scoring';
import { bmjaSpecialHandBindings, canonicalSpecialHandPatterns } from '../scoring/special-hands';
import { detectSpecialFishing } from '../scoring/fishing';
import { BMJA_RULESET, WESTERN_TM_RULESET } from './ruleset';
import { westernTmSpecialHandBindings } from './western-tm-catalogue';

const g = (...sets: HandSet[]): MahjongHand => ({ sets, bonusTiles: [], isWinner: true });
const p = (id: string, tile: PlayingTile, visibility: 'concealed' | 'exposed' = 'concealed') => set(id, 'pung', tile, visibility);
const k = (id: string, tile: PlayingTile, visibility: 'concealed' | 'exposed' = 'concealed') => set(id, 'kong', tile, visibility);
const q = (id: string, tile: PlayingTile) => set(id, 'pair', tile);
const c = (id: string, suit: SuitTile['suit'], rank: 1 | 2 | 3 | 4 | 5 | 6 | 7) => set(id, 'chow', suited(suit, rank));
const l = (looseTiles: PlayingTile[]): MahjongHand => ({ sets: [], bonusTiles: [], isWinner: true, looseTiles });
const r = (suit: SuitTile['suit'], ranks: number[]) => ranks.map((rank) => suited(suit, rank as SuitTile['rank']));
const score = (hand: MahjongHand) => WESTERN_TM_RULESET.scoreHand({ hand, playerWind: 'east', prevailingWind: 'east' });

type Case = { id: string; name: string; value: number; hand: MahjongHand; miss: MahjongHand };
const cases: Case[] = [
  { id: 'full-suit-run-with-honour-pung-and-opposite-honour-pair', name: "Dragon's Tail", value: 1000, hand: g(c('a','bamboo',1),c('b','bamboo',4),c('c','bamboo',7),p('wind',wind('east')),q('dragon',dragon('red'))), miss: g(c('a','bamboo',1),c('b','bamboo',4),c('c','bamboo',7),p('wind',wind('east')),q('other',wind('south'))) },
  { id: 'all-pair-green-dragon-and-bamboo', name: 'All Pair Jade', value: 1000, hand: l([dragon('green'),dragon('green'),...r('bamboo',[2,2,3,3,4,4,6,6,8,8,8,8])]), miss: l([dragon('green'),dragon('green'),...r('circles',[2,2,3,3,4,4,6,6,8,8,8,8])]) },
  { id: 'four-wind-pairs-with-two-dragon-melds', name: 'Windy Dragons', value: 1000, hand: g(q('e',wind('east')),q('s',wind('south')),q('w',wind('west')),q('n',wind('north')),p('red',dragon('red')),p('white',dragon('white'))), miss: g(q('e',wind('east')),q('e2',wind('east')),q('w',wind('west')),q('n',wind('north')),p('red',dragon('red')),p('white',dragon('white'))) },
  { id: 'red-dragon-pung-with-character-melds', name: 'Red Coral', value: 1000, hand: g(p('red',dragon('red')),p('a',suited('characters',1)),p('b',suited('characters',3)),p('c',suited('characters',5)),q('d',suited('characters',7))), miss: g(k('red',dragon('red')),p('a',suited('characters',1)),p('b',suited('characters',3)),p('c',suited('characters',5)),q('d',suited('characters',7))) },
  { id: 'white-dragon-pung-with-circle-melds', name: 'White Opal', value: 1000, hand: g(p('white',dragon('white')),p('a',suited('circles',1)),p('b',suited('circles',3)),p('c',suited('circles',5)),q('d',suited('circles',7))), miss: g(k('white',dragon('white')),p('a',suited('circles',1)),p('b',suited('circles',3)),p('c',suited('circles',5)),q('d',suited('circles',7))) },
  { id: 'one-suit-odd-melds', name: 'Chinese Odds', value: 500, hand: g(p('a',suited('characters',1)),p('b',suited('characters',3)),p('c',suited('characters',5)),p('d',suited('characters',7)),q('e',suited('characters',9))), miss: g(p('a',suited('characters',1)),p('b',suited('characters',3)),p('c',suited('characters',5)),p('d',suited('characters',7)),q('e',suited('characters',2))) },
  { id: 'two-odd-suits-and-one-even-suit', name: 'Odds & Evens', value: 1000, hand: l([...r('bamboo',[1,3,5,7,9]),...r('characters',[1,3,5,7,9]),...r('circles',[2,4,6,8])]), miss: l([...r('bamboo',[1,3,5,7,9]),...r('characters',[1,3,5,7,9]),...r('circles',[2,4,6,3])]) },
  { id: 'four-chows-three-suits-one-two-one', name: 'Robin', value: 500, hand: g(c('b','bamboo',1),c('c','characters',1),c('o1','circles',1),c('o2','circles',4),q('pair',suited('bamboo',7))), miss: g(c('b','bamboo',1),c('c','characters',1),c('o1','circles',1),c('o2','circles',4),q('pair',suited('circles',7))) },
  { id: 'parallel-suit-rank-melds-with-honours', name: 'Numbers in Parallel', value: 1500, hand: g(p('b',suited('bamboo',4)),p('c',suited('characters',4)),p('o',suited('circles',4)),p('w',wind('east')),q('d',dragon('red'))), miss: g(p('b',suited('bamboo',4)),p('c',suited('characters',4)),p('o',suited('circles',5)),p('w',wind('east')),q('d',dragon('red'))) },
  { id: 'green-dragon-pung-with-blue-circle-melds', name: 'Blue Mountains', value: 1000, hand: g(p('green',dragon('green')),p('a',suited('circles',2)),p('b',suited('circles',3)),p('c',suited('circles',8)),q('d',suited('circles',9))), miss: g(p('green',dragon('green')),p('a',suited('circles',2)),p('b',suited('circles',3)),p('c',suited('circles',6)),q('d',suited('circles',9))) },
  { id: 'white-dragon-meld-with-even-circle-melds', name: 'White Elephant', value: 1000, hand: g(k('white',dragon('white')),p('a',suited('circles',2)),p('b',suited('circles',6)),p('c',suited('circles',8)),q('d',suited('circles',4))), miss: g(k('white',dragon('white')),p('a',suited('circles',2)),p('b',suited('circles',6)),p('c',suited('circles',8)),q('d',suited('circles',3))) },
  { id: 'white-dragon-pung-with-odd-character-melds', name: 'Driven Snow', value: 1000, hand: g(p('white',dragon('white')),p('a',suited('characters',1)),p('b',suited('characters',3)),p('c',suited('characters',5)),q('d',suited('characters',7))), miss: g(k('white',dragon('white')),p('a',suited('characters',1)),p('b',suited('characters',3)),p('c',suited('characters',5)),q('d',suited('characters',7))) },
  { id: 'red-dragon-pung-with-even-character-melds', name: "Dragon's Scales", value: 1000, hand: g(p('red',dragon('red')),p('a',suited('characters',2)),p('b',suited('characters',4)),p('c',suited('characters',6)),q('d',suited('characters',8))), miss: g(k('red',dragon('red')),p('a',suited('characters',2)),p('b',suited('characters',4)),p('c',suited('characters',6)),q('d',suited('characters',8))) },
  { id: 'green-dragon-pung-with-bamboo-melds', name: 'Green Jade', value: 1000, hand: g(p('green',dragon('green')),p('a',suited('bamboo',2)),p('b',suited('bamboo',3)),p('c',suited('bamboo',4)),q('d',suited('bamboo',6))), miss: g(k('green',dragon('green')),p('a',suited('bamboo',2)),p('b',suited('bamboo',3)),p('c',suited('bamboo',4)),q('d',suited('bamboo',6))) },
  { id: 'green-and-white-dragon-melds-with-green-bamboo', name: 'Lily of the Valley', value: 2000, hand: g(p('green',dragon('green')),k('white',dragon('white')),p('a',suited('bamboo',2)),p('b',suited('bamboo',4)),q('d',suited('bamboo',6))), miss: g(p('green',dragon('green')),k('white',dragon('white')),p('a',suited('bamboo',2)),p('b',suited('bamboo',4)),q('d',suited('bamboo',5))) },
  { id: 'red-and-green-dragon-pungs-with-three-suits', name: 'Red Waratah', value: 1000, hand: g(p('red',dragon('red')),p('b',suited('bamboo',1)),p('o',suited('circles',2)),p('c',suited('characters',3)),q('green',dragon('green'))), miss: g(k('red',dragon('red')),p('b',suited('bamboo',1)),p('o',suited('circles',2)),p('c',suited('characters',3)),q('green',dragon('green'))) },
  { id: 'red-dragon-meld-with-red-bamboo-melds', name: 'Royal Ruby', value: 2000, hand: g(k('red',dragon('red')),p('a',suited('bamboo',1)),p('b',suited('bamboo',5)),p('c',suited('bamboo',7)),q('d',suited('bamboo',9))), miss: g(k('red',dragon('red')),p('a',suited('bamboo',1)),p('b',suited('bamboo',5)),p('c',suited('bamboo',7)),q('d',suited('bamboo',2))) },
  { id: 'red-and-white-dragon-melds-with-red-bamboo', name: 'Red Lily', value: 2000, hand: g(p('red',dragon('red')),k('white',dragon('white')),p('a',suited('bamboo',1)),p('b',suited('bamboo',5)),q('d',suited('bamboo',7))), miss: g(p('red',dragon('red')),k('white',dragon('white')),p('a',suited('bamboo',1)),p('b',suited('bamboo',5)),q('d',suited('bamboo',2))) },
  { id: 'red-and-green-dragon-melds-with-bamboo', name: 'Ruby Jade', value: 1000, hand: g(p('red',dragon('red')),k('green',dragon('green')),p('a',suited('bamboo',1)),p('b',suited('bamboo',2)),q('d',suited('bamboo',3))), miss: g(p('red',dragon('red')),k('green',dragon('green')),p('a',suited('bamboo',1)),p('b',suited('bamboo',2)),q('d',suited('circles',3))) },
];

describe('western-tm@0.1 Companion Pass 4D verification', () => {
  it.each(cases)('$name has direct canonical, Western and BMJA-isolation evidence', ({ id, name, value, hand, miss }) => {
    const detector = canonicalSpecialHandPatterns.find((pattern) => pattern.id === id)!;
    expect(detector.detect(hand)).toBe(true);
    expect(detector.detect(miss)).toBe(false);
    expect(score(hand).specialHands).toContainEqual(expect.objectContaining({ id, name, value, matched: true }));
    expect(BMJA_RULESET.scoreHand({ hand, playerWind: 'east', prevailingWind: 'east' }).specialHands).not.toContainEqual(expect.objectContaining({ id }));
    expect(bmjaSpecialHandBindings.some((binding) => binding.patternId === id)).toBe(false);
  });

  it('retains both All Pair Jade Green Dragon forms and green Bamboo only', () => {
    const detect = canonicalSpecialHandPatterns.find(({ id }) => id === cases[1]!.id)!.detect;
    expect(detect(l([dragon('green'),dragon('green'),dragon('green'),dragon('green'),...r('bamboo',[2,2,3,3,4,4,6,6,8,8])]))).toBe(true);
    expect(detect(cases[1]!.miss)).toBe(false);
  });
  it('rejects terminal Numbers in Parallel ranks', () => expect(canonicalSpecialHandPatterns.find(({ id }) => id === cases[8]!.id)!.detect(g(p('b',suited('bamboo',1)),p('c',suited('characters',1)),p('o',suited('circles',1)),p('w',wind('east')),q('d',dragon('red'))))).toBe(false));
  it('limits White Elephant to 2, 4, 6 and 8 Circles, and Blue Mountains to blue Circles', () => {
    const elephant = canonicalSpecialHandPatterns.find(({ id }) => id === cases[10]!.id)!.detect;
    for (const rank of [3, 5, 9] as const) expect(elephant(g(k('white',dragon('white')),p('a',suited('circles',2)),p('b',suited('circles',6)),p('c',suited('circles',8)),q('d',suited('circles',rank))))).toBe(false);
    const blue = canonicalSpecialHandPatterns.find(({ id }) => id === cases[9]!.id)!.detect;
    for (const rank of [2, 3, 4, 5, 8, 9] as const) {
      const others = ([2, 3, 4, 5, 8, 9] as const).filter((value) => value !== rank).slice(0, 3);
      expect(blue(g(p('green',dragon('green')),p('a',suited('circles',others[0]!)),p('b',suited('circles',others[1]!)),p('c',suited('circles',others[2]!)),q('d',suited('circles',rank))))).toBe(true);
    }
  });
  it('keeps the Western catalogue at 44 bindings', () => expect(westernTmSpecialHandBindings).toHaveLength(44));
  it('allows representative exposure without allowing a Kong in a Pung-only source group', () => {
    const elephant = { ...cases[10]!.hand, sets: cases[10]!.hand.sets.map((x) => x.id === 'a' ? { ...x, visibility: 'exposed' as const } : x) };
    expect(score(elephant).specialHands).toContainEqual(expect.objectContaining({ id: cases[10]!.id, value: 1000, matched: true }));
    const coral = { ...cases[3]!.hand, sets: cases[3]!.hand.sets.map((x) => x.id === 'red' ? { ...x, visibility: 'exposed' as const } : x) };
    expect(score(coral).specialHands).toContainEqual(expect.objectContaining({ id: cases[3]!.id, matched: true }));
    expect(canonicalSpecialHandPatterns.find(({ id }) => id === cases[3]!.id)!.detect(cases[3]!.miss)).toBe(false);
  });
  it('finds representative fishing paths and Dragon’s Tail exposure values', () => {
    const fish = (complete: MahjongHand, pairId: string, exposed = false) => ({ ...complete, isWinner: false, sets: complete.sets.filter(({ id }) => id !== pairId).map((x) => exposed && x.id === 'wind' ? { ...x, visibility: 'exposed' as const } : x), remainingTiles: [complete.sets.find(({ id }) => id === pairId)!.tile] });
    const find = (hand: MahjongHand, id: string) => detectSpecialFishing(hand, westernTmSpecialHandBindings).find((x) => x.id === id);
    expect(find({ ...cases[1]!.hand, isWinner: false, looseTiles: cases[1]!.hand.looseTiles!.slice(0,-1) }, cases[1]!.id)?.fishingValue).toBe(400);
    expect(find({ ...cases[6]!.hand, isWinner: false, looseTiles: cases[6]!.hand.looseTiles!.slice(0,-1) }, cases[6]!.id)?.fishingValue).toBe(400);
    expect(find(fish(cases[7]!.hand,'pair'), cases[7]!.id)?.fishingValue).toBe(200);
    const tailFish = fish(cases[0]!.hand,'dragon');
    expect(score(cases[0]!.hand).specialHands).toContainEqual(expect.objectContaining({ id: cases[0]!.id, value: 1000 }));
    expect(find(tailFish, cases[0]!.id)?.fishingValue).toBe(400);
    const exposedTail = { ...cases[0]!.hand, sets: cases[0]!.hand.sets.map((x) => x.id === 'wind' ? { ...x, visibility: 'exposed' as const } : x) };
    expect(score(exposedTail).specialHands).toContainEqual(expect.objectContaining({ id: cases[0]!.id, value: 500 }));
    expect(find(fish(exposedTail,'dragon',true), cases[0]!.id)?.fishingValue).toBe(200);
    const kongTail = { ...exposedTail, sets: exposedTail.sets.map((x) => x.id === 'wind' ? { ...x, kind: 'kong' as const } : x) };
    expect(score(kongTail).specialHands).toContainEqual(expect.objectContaining({ id: cases[0]!.id, value: 500 }));
    expect(find(fish(kongTail,'dragon',true), cases[0]!.id)?.fishingValue).toBe(200);
  });
  it('reconstructs Windy Dragons fishing through its four-pair and two-meld shape', () => {
    const hand: MahjongHand = { sets: [q('e',wind('east')),q('s',wind('south')),q('w',wind('west')),p('red',dragon('red')),p('white',dragon('white'))], remainingTiles: [wind('north')], bonusTiles: [], isWinner: false };
    expect(detectSpecialFishing(hand, westernTmSpecialHandBindings)).toContainEqual(expect.objectContaining({ id: cases[2]!.id, fishingValue: 400 }));
  });
});
