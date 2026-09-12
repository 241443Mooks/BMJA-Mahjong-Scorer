import { describe, expect, it } from 'vitest';
import { dragon, set, suited, wind } from '../scoring';
import type { MahjongHand, PlayingTile, SuitTile } from '../scoring';
import { detectSpecialFishing } from '../scoring/fishing';
import { BMJA_RULESET, WESTERN_TM_RULESET } from './ruleset';
import { canonicalSpecialHandPatterns } from '../scoring/special-hands';
import { westernTmSpecialHandBindings } from './western-tm-catalogue';

const p = (id: string, tile: PlayingTile) => set(id, 'pung', tile);
const k = (id: string, tile: PlayingTile) => set(id, 'kong', tile);
const q = (id: string, tile: PlayingTile) => set(id, 'pair', tile);
const c = (id: string, rank: 1 | 2 | 3 | 4 | 5 | 6 | 7) => set(id, 'chow', suited('bamboo', rank));
const loose = (looseTiles: PlayingTile[], isWinner = true): MahjongHand => ({ sets: [], looseTiles, bonusTiles: [], isWinner });
const score = (hand: MahjongHand) => WESTERN_TM_RULESET.scoreHand({ hand, playerWind: 'east', prevailingWind: 'east' });
const detect = (id: string, hand: MahjongHand) => canonicalSpecialHandPatterns.find((pattern) => pattern.id === id)!.detect(hand);
const fishing = (hand: MahjongHand, id: string) => detectSpecialFishing(hand, westernTmSpecialHandBindings).find((match) => match.id === id);

const knittingTiles = [1, 2, 3, 4, 5, 6, 7].flatMap((rank) => [suited('bamboo', rank as SuitTile['rank']), suited('characters', rank as SuitTile['rank'])]);
const tripleKnittingTiles = [1, 3, 5, 7].flatMap((rank) => [suited('bamboo', rank as SuitTile['rank']), suited('characters', rank as SuitTile['rank']), suited('circles', rank as SuitTile['rank'])]).concat([suited('bamboo', 9), suited('circles', 9)]);
const imperialJade: MahjongHand = { sets: [p('dragon', dragon('green')), p('two', suited('bamboo', 2)), p('six', suited('bamboo', 6)), p('eight', suited('bamboo', 8)), q('pair', suited('bamboo', 4))], bonusTiles: [], isWinner: true };

describe('western-tm@0.1 Pass 4H Knitting audits and Imperial Jade', () => {
  it('uses a strict two-suit knitting pattern without changing the broader BMJA detector', () => {
    const hand = loose(knittingTiles);
    expect(detect('two-suit-knitting', hand)).toBe(true);
    expect(score(hand).specialHands).toContainEqual(expect.objectContaining({ id: 'two-suit-knitting', name: 'Knitting', value: 500 }));
    expect(detect('two-suit-knitting', loose([...knittingTiles.slice(0, 12), suited('circles', 7), suited('circles', 7)]))).toBe(false);
    expect(detect('two-suit-knitting', loose([...knittingTiles.slice(0, 12), suited('bamboo', 7), suited('bamboo', 7)]))).toBe(false);
    expect(detect('two-suit-knitting', loose([...knittingTiles.slice(0, 12), suited('bamboo', 7), suited('characters', 8)]))).toBe(false);
    expect(detect('two-suit-knitting', loose([...knittingTiles.slice(0, 13), wind('east')]))).toBe(false);
    expect(detect('two-suit-knitting', loose([...Array.from({ length: 5 }, () => suited('bamboo', 1)), ...knittingTiles.slice(5, 14)]))).toBe(false);
    expect(BMJA_RULESET.scoreHand({ hand, playerWind: 'east', prevailingWind: 'east' }).specialHands).not.toContainEqual(expect.objectContaining({ id: 'two-suit-knitting' }));
  });

  it('uses a strict loose-layout Triple Knitting pattern, including a pair rank that overlaps a triplet rank', () => {
    const overlap = loose([1, 3, 5, 7].flatMap((rank) => [suited('bamboo', rank as SuitTile['rank']), suited('characters', rank as SuitTile['rank']), suited('circles', rank as SuitTile['rank'])]).concat([suited('bamboo', 1), suited('characters', 1)]));
    expect(detect('three-suit-knitting-with-pair', loose(tripleKnittingTiles))).toBe(true);
    expect(detect('three-suit-knitting-with-pair', overlap)).toBe(true);
    expect(score(loose(tripleKnittingTiles)).specialHands).toContainEqual(expect.objectContaining({ id: 'three-suit-knitting-with-pair', name: 'Triple Knitting', value: 500 }));
    expect(detect('three-suit-knitting-with-pair', loose([...tripleKnittingTiles.slice(0, 2), suited('bamboo', 1), ...tripleKnittingTiles.slice(3)]))).toBe(false);
    expect(detect('three-suit-knitting-with-pair', loose([...tripleKnittingTiles.slice(0, 2), suited('circles', 2), ...tripleKnittingTiles.slice(3)]))).toBe(false);
    expect(detect('three-suit-knitting-with-pair', loose([...tripleKnittingTiles.slice(0, 12), suited('bamboo', 9), suited('bamboo', 9)]))).toBe(false);
    expect(detect('three-suit-knitting-with-pair', loose([...tripleKnittingTiles.slice(0, 13), wind('east')]))).toBe(false);
    expect(detect('three-suit-knitting-with-pair', loose(tripleKnittingTiles.slice(0, 13)))).toBe(false);
  });

  it('recognises the T&M Imperial Jade form with at most one green Bamboo 234 Chow', () => {
    const oneChow: MahjongHand = { ...imperialJade, sets: [p('dragon', dragon('green')), c('chow', 2), p('six', suited('bamboo', 6)), p('eight', suited('bamboo', 8)), q('pair', suited('bamboo', 4))] };
    expect(detect('green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow', imperialJade)).toBe(true);
    expect(detect('green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow', oneChow)).toBe(true);
    expect(score(imperialJade).specialHands).toContainEqual(expect.objectContaining({ id: 'green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow', name: 'Imperial Jade', value: 2000 }));
    expect(detect('green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow', { ...oneChow, sets: [p('dragon', dragon('green')), c('first', 2), c('second', 2), p('eight', suited('bamboo', 8)), q('pair', suited('bamboo', 6))] })).toBe(false);
    expect(detect('green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow', { ...oneChow, sets: [p('dragon', dragon('green')), c('bad', 3), p('six', suited('bamboo', 6)), p('eight', suited('bamboo', 8)), q('pair', suited('bamboo', 4))] })).toBe(false);
    expect(detect('green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow', { ...imperialJade, sets: [p('dragon', dragon('green')), p('five', suited('bamboo', 5)), p('six', suited('bamboo', 6)), p('eight', suited('bamboo', 8)), q('pair', suited('bamboo', 4))] })).toBe(false);
    expect(detect('green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow', { ...imperialJade, sets: [p('dragon', dragon('red')), ...imperialJade.sets.slice(1)] })).toBe(false);
  });

  it('keeps Imperial Jade exposed Pungs/Kongs at full value and uses the established fishing paths', () => {
    const exposed = { ...imperialJade, sets: imperialJade.sets.map((group) => group.kind === 'pair' ? group : { ...group, visibility: 'exposed' as const }) };
    expect(score(exposed).specialHands).toContainEqual(expect.objectContaining({ id: 'green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow', value: 2000 }));
    expect(score({ ...imperialJade, sets: imperialJade.sets.map((group) => group.kind === 'pair' ? group : group.id === 'two' ? { ...group, visibility: 'exposed' as const } : group) }).specialHands).toContainEqual(expect.objectContaining({ id: 'green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow', value: 2000 }));
    expect(fishing(loose(knittingTiles.slice(0, 13), false), 'two-suit-knitting')?.fishingValue).toBe(200);
    expect(fishing(loose(tripleKnittingTiles.slice(0, 13), false), 'three-suit-knitting-with-pair')?.fishingValue).toBe(200);
    expect(fishing({ ...imperialJade, isWinner: false, sets: imperialJade.sets.slice(0, -1), remainingTiles: [suited('bamboo', 4)] }, 'green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow')?.fishingValue).toBe(800);
  });
});
