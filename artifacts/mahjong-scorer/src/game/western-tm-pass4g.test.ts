import { describe, expect, it } from 'vitest';
import { dragon, set, suited, wind } from '../scoring';
import type { HandSet, MahjongHand, PlayingTile, SuitTile, Wind } from '../scoring';
import { bmjaSpecialHandBindings, canonicalSpecialHandPatterns } from '../scoring/special-hands';
import { detectSpecialFishing } from '../scoring/fishing';
import { BMJA_RULESET, WESTERN_TM_RULESET } from './ruleset';
import { westernTmSpecialHandBindings } from './western-tm-catalogue';

const p = (id: string, tile: PlayingTile) => set(id, 'pung', tile);
const k = (id: string, tile: PlayingTile) => set(id, 'kong', tile);
const q = (id: string, tile: PlayingTile) => set(id, 'pair', tile);
const c = (id: string, suit: SuitTile['suit'], rank: 1 | 2 | 3 | 4 | 5 | 6 | 7) => set(id, 'chow', suited(suit, rank));
const run = (suit: SuitTile['suit'], ranks: number[]) => ranks.map((rank) => suited(suit, rank as SuitTile['rank']));
const score = (hand: MahjongHand, playerWind: Wind = 'east', prevailingWind: Wind = 'east') => WESTERN_TM_RULESET.scoreHand({ hand, playerWind, prevailingWind });
const findFishing = (hand: MahjongHand, id: string, playerWind?: Wind) => detectSpecialFishing(hand, westernTmSpecialHandBindings, playerWind ? { playerWind, prevailingWind: 'east', limit: 1000 } : undefined).find((match) => match.id === id);
const detector = (id: string) => canonicalSpecialHandPatterns.find((pattern) => pattern.id === id)!;

const dragonfly: MahjongHand = { sets: [p('b', suited('bamboo', 2)), k('c', suited('characters', 5)), p('o', suited('circles', 8)), q('pair', suited('bamboo', 7))], looseTiles: [dragon('green'), dragon('red'), dragon('white')], bonusTiles: [], isWinner: true };
const teeth: MahjongHand = { sets: [p('red', dragon('red')), p('white', dragon('white'))], looseTiles: run('characters', [1, 2, 3, 4, 5, 6, 7, 4]), bonusTiles: [], isWinner: true };
const gates: MahjongHand = { sets: [p('terminal', suited('circles', 9)), k('dragon', dragon('white'))], looseTiles: run('circles', [2, 3, 4, 5, 6, 7, 8, 5]), bonusTiles: [], isWinner: true };
const littleBrother = (playerWind: Wind): MahjongHand => ({ sets: [c('b', 'bamboo', 1), c('c', 'characters', 3), c('o', 'circles', 5), c('b2', 'bamboo', 7), q('pair', wind(playerWind))], bonusTiles: [], isWinner: true });
const angel = (playerWind: Wind): MahjongHand => ({ sets: [c('b', 'bamboo', 1), c('c', 'characters', 3), c('o', 'circles', 5), k('own', wind(playerWind)), q('pair', dragon('green'))], bonusTiles: [], isWinner: true });

describe('western-tm@0.1 Pass 4G dragon hybrids and own-wind catalogue wave', () => {
  it.each([
    ['three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair', 'Dragonfly', 1000, dragonfly, { ...dragonfly, looseTiles: [dragon('green'), dragon('red'), dragon('red')] }],
    ['red-white-dragon-pungs-with-seven-tile-character-or-circle-run-pair', "Dragon's Teeth", 1000, teeth, { ...teeth, sets: [k('red', dragon('red')), p('white', dragon('white'))] }],
    ['two-to-eight-run-pair-with-terminal-pung-and-corresponding-dragon-meld', "Dragon's Gates", 1500, gates, { ...gates, sets: [k('terminal', suited('circles', 9)), k('dragon', dragon('white'))] }],
  ])('%s has canonical, binding and BMJA-isolation evidence', (id, name, value, hand, miss) => {
    expect(detector(id).detect(hand)).toBe(true);
    expect(detector(id).detect(miss)).toBe(false);
    expect(score(hand).specialHands).toContainEqual(expect.objectContaining({ id, name, value, matched: true }));
    expect(BMJA_RULESET.scoreHand({ hand, playerWind: 'east', prevailingWind: 'east' }).specialHands).not.toContainEqual(expect.objectContaining({ id }));
    expect(bmjaSpecialHandBindings.some((binding) => binding.patternId === id)).toBe(false);
  });

  it('enforces Dragonfly’s identities, suits, pair and one-dot exposure', () => {
    expect(detector('three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair').detect({ ...dragonfly, sets: [p('b', suited('bamboo', 2)), p('b2', suited('bamboo', 5)), p('o', suited('circles', 8)), q('pair', suited('bamboo', 7))] })).toBe(false);
    expect(score({ ...dragonfly, sets: dragonfly.sets.map((group) => group.id === 'b' ? { ...group, visibility: 'exposed' as const } : group) }).specialHands).toContainEqual(expect.objectContaining({ id: 'three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair', value: 500, matched: true }));
  });

  it("keeps Dragon's Teeth Dragon groups Pung-only and two-dot full value", () => {
    const exposed = { ...teeth, sets: teeth.sets.map((group) => ({ ...group, visibility: 'exposed' as const })) };
    expect(score(exposed).specialHands).toContainEqual(expect.objectContaining({ id: 'red-white-dragon-pungs-with-seven-tile-character-or-circle-run-pair', value: 1000, matched: true }));
    expect(detector('red-white-dragon-pungs-with-seven-tile-character-or-circle-run-pair').detect({ ...teeth, looseTiles: run('bamboo', [1, 2, 3, 4, 5, 6, 7, 4]) })).toBe(false);
  });

  it("enforces Dragon's Gates mapping and one-dot exposure", () => {
    expect(detector('two-to-eight-run-pair-with-terminal-pung-and-corresponding-dragon-meld').detect({ ...gates, sets: [p('terminal', suited('circles', 9)), p('dragon', dragon('red'))] })).toBe(false);
    expect(score({ ...gates, sets: gates.sets.map((group) => group.id === 'dragon' ? { ...group, visibility: 'exposed' as const } : group) }).specialHands).toContainEqual(expect.objectContaining({ id: 'two-to-eight-run-pair-with-terminal-pung-and-corresponding-dragon-meld', value: 750, matched: true }));
  });

  it('uses playerWind, not prevailingWind, for Little Brother and Hovering Angel', () => {
    expect(detector('four-chows-three-suits-with-own-wind-pair').detect(littleBrother('south'))).toBe(false);
    expect(detector('four-chows-three-suits-with-own-wind-pair').detect(littleBrother('south'), { playerWind: 'south', prevailingWind: 'east', limit: 1000 })).toBe(true);
    expect(detector('own-wind-meld-with-dragon-pair-and-three-suit-chows').detect(angel('north'))).toBe(false);
    expect(detector('own-wind-meld-with-dragon-pair-and-three-suit-chows').detect(angel('north'), { playerWind: 'north', prevailingWind: 'east', limit: 1000 })).toBe(true);
    expect(score(littleBrother('south'), 'south', 'east').specialHands).toContainEqual(expect.objectContaining({ id: 'four-chows-three-suits-with-own-wind-pair', value: 1000, matched: true }));
    expect(score(littleBrother('south'), 'east', 'south').specialHands.find(({ id }) => id === 'four-chows-three-suits-with-own-wind-pair')?.matched).toBe(false);
    expect(detector('four-chows-three-suits-with-own-wind-pair').detect({ ...littleBrother('south'), sets: [...littleBrother('south').sets.slice(0, -1), q('pair', wind('east'))] }, { playerWind: 'south', prevailingWind: 'east', limit: 1000 })).toBe(false);
    expect(score(angel('north'), 'north', 'east').specialHands).toContainEqual(expect.objectContaining({ id: 'own-wind-meld-with-dragon-pair-and-three-suit-chows', value: 1000, matched: true }));
    expect(score({ ...angel('north'), sets: angel('north').sets.map((group) => group.id === 'own' ? { ...group, visibility: 'exposed' as const } : group) }, 'north').specialHands).toContainEqual(expect.objectContaining({ id: 'own-wind-meld-with-dragon-pair-and-three-suit-chows', value: 500, matched: true }));
    expect(detector('own-wind-meld-with-dragon-pair-and-three-suit-chows').detect({ ...angel('north'), sets: [...angel('north').sets.slice(0, -1), q('pair', wind('north'))] }, { playerWind: 'north', prevailingWind: 'east', limit: 1000 })).toBe(false);
    for (const [id, hand, playerWind] of [
      ['four-chows-three-suits-with-own-wind-pair', littleBrother('south'), 'south'],
      ['own-wind-meld-with-dragon-pair-and-three-suit-chows', angel('north'), 'north'],
    ] as const) {
      expect(BMJA_RULESET.scoreHand({ hand, playerWind, prevailingWind: 'east' }).specialHands).not.toContainEqual(expect.objectContaining({ id }));
      expect(bmjaSpecialHandBindings.some((binding) => binding.patternId === id)).toBe(false);
    }
  });

  it('finds hybrid and grouped own-wind fishing with their profile exposure values', () => {
    const dragonflyFishing = { ...dragonfly, isWinner: false, looseTiles: [dragon('green'), dragon('red')] };
    expect(findFishing(dragonflyFishing, 'three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair')?.fishingValue).toBe(400);
    expect(findFishing({ ...dragonflyFishing, sets: dragonflyFishing.sets.map((group) => group.id === 'b' ? { ...group, visibility: 'exposed' as const } : group) }, 'three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair')?.fishingValue).toBe(200);
    expect(findFishing({ ...teeth, isWinner: false, looseTiles: teeth.looseTiles!.slice(0, -1) }, 'red-white-dragon-pungs-with-seven-tile-character-or-circle-run-pair')?.fishingValue).toBe(400);
    expect(findFishing({ ...gates, isWinner: false, looseTiles: gates.looseTiles!.slice(0, -1) }, 'two-to-eight-run-pair-with-terminal-pung-and-corresponding-dragon-meld')?.fishingValue).toBe(600);
    expect(findFishing({ ...gates, isWinner: false, looseTiles: gates.looseTiles!.slice(0, -1), sets: gates.sets.map((group) => group.id === 'terminal' ? { ...group, visibility: 'exposed' as const } : group) }, 'two-to-eight-run-pair-with-terminal-pung-and-corresponding-dragon-meld')?.fishingValue).toBe(300);
    const groupedFishing: MahjongHand = { ...littleBrother('south'), isWinner: false, sets: littleBrother('south').sets.slice(0, -1), remainingTiles: [wind('south')] };
    expect(findFishing(groupedFishing, 'four-chows-three-suits-with-own-wind-pair', 'south')?.fishingValue).toBe(400);
  });
});
