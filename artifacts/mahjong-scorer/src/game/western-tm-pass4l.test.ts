import { describe, expect, it } from 'vitest';
import { dragon, set, suited, wind } from '../scoring';
import type { MahjongHand, PlayingTile, SuitTile } from '../scoring';
import { detectSpecialFishing } from '../scoring/fishing';
import { bmjaSpecialHandBindings, canonicalSpecialHandPatterns } from '../scoring/special-hands';
import { BMJA_RULESET, WESTERN_TM_RULESET } from './ruleset';
import { westernTmSpecialHandBindings } from './western-tm-catalogue';

const run = (suit: SuitTile['suit'], ranks: number[]) => ranks.map((rank) => suited(suit, rank as SuitTile['rank']));
const loose = (looseTiles: PlayingTile[], isWinner = true): MahjongHand => ({ sets: [], looseTiles, bonusTiles: [], isWinner });
const chow = (id: string, suit: SuitTile['suit'], rank: 1 | 2 | 3 | 4 | 5 | 6 | 7) => set(id, 'chow', suited(suit, rank));
const pair = (id: string, tile: PlayingTile) => set(id, 'pair', tile);
const detector = (id: string) => canonicalSpecialHandPatterns.find((pattern) => pattern.id === id)!;
const score = (hand: MahjongHand) => WESTERN_TM_RULESET.scoreHand({ hand, playerWind: 'east', prevailingWind: 'south' });
const fishing = (hand: MahjongHand, id: string) => detectSpecialFishing(hand, westernTmSpecialHandBindings, { playerWind: 'east', prevailingWind: 'south', limit: 1000 }).find((match) => match.id === id);

const bigRobert = (starts: [number, number, number], honour: PlayingTile = wind('east')) =>
  loose([...run('bamboo', [starts[0], starts[0] + 1, starts[0] + 2, starts[0] + 3]), ...run('characters', [starts[1], starts[1] + 1, starts[1] + 2, starts[1] + 3]), ...run('circles', [starts[2], starts[2] + 1, starts[2] + 2, starts[2] + 3]), honour, honour]);
const twins = (method?: MahjongHand['winningMethod']) => ({ ...loose([suited('bamboo', 1), suited('bamboo', 1), suited('characters', 2), suited('characters', 2), suited('circles', 3), suited('circles', 3), wind('east'), wind('east'), wind('south'), wind('south'), dragon('red'), dragon('red'), dragon('green'), dragon('green')]), winningMethod: method });
const chowChow = (method?: MahjongHand['winningMethod']): MahjongHand => ({ sets: [chow('one', 'bamboo', 1), chow('two', 'bamboo', 2), chow('four', 'bamboo', 4), chow('seven', 'bamboo', 7), pair('pair', suited('bamboo', 5))], bonusTiles: [], isWinner: true, winningMethod: method });
const staircase = (up: boolean, suit: SuitTile['suit'] = 'bamboo') => loose([...['east', 'south', 'west', 'north'].map((value) => wind(value as 'east' | 'south' | 'west' | 'north')), ...run(suit, up ? [2,4,4,6,6,6,8,8,8,8] : [2,2,2,2,4,4,4,6,6,8])]);

describe('western-tm@0.1 Pass 4L final Companion catalogue wave', () => {
  it('keeps Big Robert variants mutually exclusive and preserves their distinct fishing values', () => {
    const normal = 'three-four-tile-suit-runs-with-honour-pair'; const matching = 'three-matching-four-tile-suit-runs-with-honour-pair';
    expect(detector(normal).detect(bigRobert([1, 4, 6]))).toBe(true); expect(detector(matching).detect(bigRobert([1, 4, 6]))).toBe(false);
    expect(detector(normal).detect(bigRobert([4, 4, 4], dragon('white')))).toBe(false); expect(detector(matching).detect(bigRobert([4, 4, 4], dragon('white')))).toBe(true);
    expect(score(bigRobert([1, 4, 6])).specialHands).toContainEqual(expect.objectContaining({ id: normal, value: 500, matched: true }));
    expect(score(bigRobert([4, 4, 4])).specialHands).toContainEqual(expect.objectContaining({ id: matching, value: 1000, matched: true }));
    expect(detector(normal).detect(bigRobert([1, 4, 6], suited('bamboo', 9)))).toBe(false);
    expect(detector(normal).detect(loose([...run('bamboo',[1,2,3,4]), ...run('characters',[4,5,6,7]), ...run('characters',[6,7,8,9]), wind('east'), wind('east')]))).toBe(false);
    expect(detector(normal).detect(loose([...run('bamboo',[1,2,3,5]), ...run('characters',[4,5,6,7]), ...run('circles',[6,7,8,9]), wind('east'), wind('east')]))).toBe(false);
    expect(detector(matching).detect(loose([...bigRobert([4,4,4]).looseTiles!].reverse()))).toBe(true);
    const wait = loose([...run('bamboo',[4,5,6,7]), ...run('characters',[4,5,6,7]), ...run('circles',[4,5,6]), wind('east'), wind('east')], false);
    expect(fishing(wait, normal)).toMatchObject({ fishingValue: 200, completingTiles: expect.arrayContaining([suited('circles', 3)]) });
    expect(fishing(wait, matching)).toMatchObject({ fishingValue: 400, completingTiles: expect.arrayContaining([suited('circles', 7)]) });
  });

  it('applies Seven Twins wall-only eligibility while retaining wall-hypothesis fishing', () => {
    const id = 'seven-pairs-all-from-wall';
    expect(score(twins('wall')).specialHands).toContainEqual(expect.objectContaining({ id, value: 500, matched: true }));
    expect(score(twins('last-wall-tile')).specialHands).toContainEqual(expect.objectContaining({ id, matched: true }));
    expect(score(twins('discard')).specialHands.find((special) => special.id === id)?.matched).toBe(false);
    expect(score(twins()).specialHands.find((special) => special.id === id)?.matched).toBe(false);
    expect(fishing(loose(twins('wall').looseTiles!.slice(0, -1), false), id)?.fishingValue).toBe(200);
  });

  it('requires concealed one-suit Chow Chow to win from the wall, including fishing completion', () => {
    const id = 'four-concealed-chows-one-suit-from-wall';
    expect(score(chowChow('wall')).specialHands).toContainEqual(expect.objectContaining({ id, value: 500, matched: true }));
    expect(score(chowChow('last-wall-tile')).specialHands.find((special) => special.id === id)?.matched).toBe(true);
    expect(score(chowChow('discard')).specialHands.find((special) => special.id === id)?.matched).toBe(false);
    expect(score({ ...chowChow('wall'), sets: chowChow('wall').sets.map((group) => group.id === 'one' ? { ...group, visibility: 'exposed' as const } : group) }).specialHands.find((special) => special.id === id)?.matched).toBe(false);
    const hand = chowChow();
    expect(fishing({ ...hand, isWinner: false, sets: hand.sets.filter((group) => group.kind !== 'pair'), remainingTiles: [suited('bamboo', 5)] }, id)?.fishingValue).toBe(200);
  });

  it('recognises Up You Go and Down You Go as pure concealed loose layouts above the ordinary cap', () => {
    const up = 'four-winds-with-one-two-two-fours-three-sixes-four-eights'; const down = 'four-winds-with-four-twos-three-fours-two-sixes-one-eight';
    expect(detector(up).detect(staircase(true))).toBe(true); expect(detector(up).detect(staircase(true, 'circles'))).toBe(true); expect(detector(down).detect(staircase(false))).toBe(true);
    expect(score(staircase(true)).specialHands).toContainEqual(expect.objectContaining({ id: up, value: 2000, matched: true })); expect(score(staircase(false)).finalScore).toBe(2000);
    expect(detector(up).detect(loose([...staircase(true).looseTiles!.slice(0, 3), wind('east'), ...staircase(true).looseTiles!.slice(4)]))).toBe(false);
    expect(detector(up).detect(loose([...staircase(true).looseTiles!.slice(0, 4), ...run('characters',[2]), ...staircase(true).looseTiles!.slice(5)]))).toBe(false);
    expect(detector(down).detect(loose([...staircase(false).looseTiles!.slice(0, -1), dragon('red')]))).toBe(false);
    expect(fishing(loose(staircase(true).looseTiles!.slice(0, -1), false), up)?.fishingValue).toBe(800); expect(fishing(loose(staircase(false).looseTiles!.slice(0, -1), false), down)?.fishingValue).toBe(800);
  });

  it('keeps all final-wave structural patterns Western-only', () => {
    const ids = ['three-four-tile-suit-runs-with-honour-pair', 'three-matching-four-tile-suit-runs-with-honour-pair', 'seven-pairs-all-from-wall', 'four-concealed-chows-one-suit-from-wall', 'four-winds-with-one-two-two-fours-three-sixes-four-eights', 'four-winds-with-four-twos-three-fours-two-sixes-one-eight'];
    for (const id of ids) expect(bmjaSpecialHandBindings.some((binding) => binding.patternId === id)).toBe(false);
    expect(BMJA_RULESET.scoreHand({ hand: staircase(true), playerWind: 'east', prevailingWind: 'south' }).specialHands.some((special) => ids.includes(special.id))).toBe(false);
  });
});
