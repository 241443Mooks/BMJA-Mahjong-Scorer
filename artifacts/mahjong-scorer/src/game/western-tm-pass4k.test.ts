import { describe, expect, it } from 'vitest';
import { dragon, set, suited, wind } from '../scoring';
import type { MahjongHand, PlayingTile, SuitTile, Wind } from '../scoring';
import { detectSpecialFishing } from '../scoring/fishing';
import { bmjaSpecialHandBindings, canonicalSpecialHandPatterns } from '../scoring/special-hands';
import { BMJA_RULESET, WESTERN_TM_RULESET } from './ruleset';
import { westernTmSpecialHandBindings } from './western-tm-catalogue';

const c = (id: string, suit: SuitTile['suit'], rank: 1 | 2 | 3 | 4 | 5 | 6 | 7) => set(id, 'chow', suited(suit, rank));
const p = (id: string, tile: PlayingTile) => set(id, 'pung', tile);
const k = (id: string, tile: PlayingTile) => set(id, 'kong', tile);
const q = (id: string, tile: PlayingTile) => set(id, 'pair', tile);
const mixed = (start: number) => [suited('bamboo', start as SuitTile['rank']), suited('characters', (start + 1) as SuitTile['rank']), suited('circles', (start + 2) as SuitTile['rank'])];
const loose = (looseTiles: PlayingTile[], isWinner = true): MahjongHand => ({ sets: [], looseTiles, bonusTiles: [], isWinner });
const detector = (id: string) => canonicalSpecialHandPatterns.find((pattern) => pattern.id === id)!;
const score = (hand: MahjongHand, playerWind: Wind = 'east', prevailingWind: Wind = 'south') => WESTERN_TM_RULESET.scoreHand({ hand, playerWind, prevailingWind });
const fishing = (hand: MahjongHand, id: string, playerWind: Wind = 'east') => detectSpecialFishing(hand, westernTmSpecialHandBindings, { playerWind, prevailingWind: playerWind === 'east' ? 'south' : 'east', limit: 1000 }).find((match) => match.id === id);

const philosophers: MahjongHand = { sets: [c('b', 'bamboo', 1), c('c', 'characters', 3), c('o', 'circles', 5), q('pair', suited('bamboo', 9))], looseTiles: mixed(2), bonusTiles: [], isWinner: true };
const crazyTiles = [...mixed(1), ...mixed(2), ...mixed(3), ...mixed(4), suited('bamboo', 7), suited('characters', 7)];
const apple = (kind: 'pung' | 'kong' = 'pung'): MahjongHand => ({ sets: [kind === 'pung' ? p('white', dragon('white')) : k('white', dragon('white')), q('green', dragon('green'))], looseTiles: [...mixed(1), ...mixed(3), ...mixed(5)], bonusTiles: [], isWinner: true });
const professors = (own: Wind): MahjongHand => loose([...mixed(1), ...mixed(3), ...mixed(5), dragon('green'), dragon('red'), dragon('white'), wind(own), wind(own)]);

describe('western-tm@0.1 Pass 4K mixed Chow family', () => {
  it('recognises Three Philosophers as three ordinary suit Chows, a suited pair, and a Mixed Chow', () => {
    const id = 'three-suit-chows-with-mixed-chow-and-suited-pair';
    expect(detector(id).detect(philosophers)).toBe(true);
    expect(score(philosophers).specialHands).toContainEqual(expect.objectContaining({ id, value: 1000, matched: true }));
    expect(detector(id).detect({ ...philosophers, sets: [c('b1', 'bamboo', 1), c('b2', 'bamboo', 3), c('o', 'circles', 5), q('pair', suited('bamboo', 9))] })).toBe(false);
    expect(detector(id).detect({ ...philosophers, looseTiles: [suited('bamboo', 2), suited('characters', 4), suited('circles', 5)] })).toBe(false);
    expect(detector(id).detect({ ...philosophers, looseTiles: [suited('bamboo', 2), suited('bamboo', 3), suited('circles', 4)] })).toBe(false);
    expect(detector(id).detect({ ...philosophers, sets: [...philosophers.sets.slice(0, 3), q('pair', dragon('green'))] })).toBe(false);
    expect(detector(id).detect({ ...philosophers, sets: [set('bad', 'chow', suited('bamboo', 8)), c('c', 'characters', 3), c('o', 'circles', 5), q('pair', suited('bamboo', 9))] })).toBe(false);
    expect(fishing({ ...philosophers, isWinner: false, looseTiles: philosophers.looseTiles!.slice(0, -1) }, id)?.fishingValue).toBe(400);
  });

  it('partitions Crazy Chows structurally, independent of tile ordering', () => {
    const id = 'four-mixed-chows-with-mixed-pair';
    const hand = loose(crazyTiles);
    expect(detector(id).detect(hand)).toBe(true);
    expect(detector(id).detect(loose([...crazyTiles].reverse()))).toBe(true);
    expect(score(hand).specialHands).toContainEqual(expect.objectContaining({ id, value: 1000, matched: true }));
    expect(detector(id).detect(loose([...crazyTiles.slice(0, 12), suited('bamboo', 7), suited('bamboo', 7)]))).toBe(false);
    expect(detector(id).detect(loose([...crazyTiles.slice(0, 12), suited('bamboo', 7), suited('characters', 8)]))).toBe(false);
    expect(detector(id).detect(loose([...crazyTiles.slice(0, 11), suited('bamboo', 9), ...crazyTiles.slice(12)]))).toBe(false);
    expect(detector(id).detect(loose([...crazyTiles.slice(0, 13), dragon('red')]))).toBe(false);
    expect(fishing(loose(crazyTiles.slice(0, -1), false), id)?.fishingValue).toBe(400);
  });

  it('recognises concealed Apple Blossom and rejects exposed White Dragon Pungs/Kongs', () => {
    const id = 'white-dragon-meld-green-dragon-pair-with-three-mixed-chows';
    expect(detector(id).detect(apple())).toBe(true);
    expect(detector(id).detect(apple('kong'))).toBe(true);
    expect(score(apple()).specialHands).toContainEqual(expect.objectContaining({ id, value: 1000, matched: true }));
    expect(detector(id).detect({ ...apple(), sets: [p('white', dragon('white')), q('red', dragon('red'))] })).toBe(false);
    expect(detector(id).detect({ ...apple(), looseTiles: [...mixed(1), ...mixed(3), suited('bamboo', 5), suited('characters', 7), suited('circles', 8)] })).toBe(false);
    const exposed = { ...apple(), sets: apple().sets.map((group) => group.id === 'white' ? { ...group, visibility: 'exposed' as const } : group) };
    expect(score(exposed).specialHands.find((special) => special.id === id)?.matched).toBe(false);
    const near = { ...apple(), isWinner: false, looseTiles: apple().looseTiles!.slice(0, -1) };
    expect(fishing(near, id)?.fishingValue).toBe(400);
    expect(fishing({ ...near, sets: exposed.sets }, id)).toBeUndefined();
  });

  it('uses playerWind, never prevailingWind, for The Professors', () => {
    const id = 'three-mixed-chows-three-dragon-singles-own-wind-pair';
    expect(detector(id).detect(professors('east'), { playerWind: 'east', prevailingWind: 'south', limit: 1000 })).toBe(true);
    expect(detector(id).detect(professors('south'), { playerWind: 'south', prevailingWind: 'east', limit: 1000 })).toBe(true);
    expect(detector(id).detect(professors('south'), { playerWind: 'east', prevailingWind: 'south', limit: 1000 })).toBe(false);
    expect(score(professors('east')).specialHands).toContainEqual(expect.objectContaining({ id, value: 500, matched: true }));
    expect(detector(id).detect(loose([...mixed(1), ...mixed(3), ...mixed(5), dragon('green'), dragon('green'), dragon('white'), wind('east'), wind('east')]), { playerWind: 'east', prevailingWind: 'south', limit: 1000 })).toBe(false);
    const near = { ...professors('north'), isWinner: false, looseTiles: professors('north').looseTiles!.slice(0, -1) };
    expect(fishing(near, id, 'north')?.fishingValue).toBe(200);
    expect(fishing(near, id, 'east')).toBeUndefined();
  });

  it('keeps all Pass 4K patterns out of BMJA bindings and scoring', () => {
    const ids = ['three-suit-chows-with-mixed-chow-and-suited-pair', 'four-mixed-chows-with-mixed-pair', 'white-dragon-meld-green-dragon-pair-with-three-mixed-chows', 'three-mixed-chows-three-dragon-singles-own-wind-pair'];
    for (const [id, hand] of [[ids[0]!, philosophers], [ids[1]!, loose(crazyTiles)], [ids[2]!, apple()], [ids[3]!, professors('east')]] as const) {
      expect(bmjaSpecialHandBindings.some((binding) => binding.patternId === id)).toBe(false);
      expect(BMJA_RULESET.scoreHand({ hand, playerWind: 'east', prevailingWind: 'south' }).specialHands).not.toContainEqual(expect.objectContaining({ id }));
    }
  });
});
