import { describe, expect, it } from 'vitest';
import { dragon, suited, wind } from '../scoring';
import type { MahjongHand, PlayingTile } from '../scoring';
import { canonicalSpecialHandPatterns } from '../scoring/special-hands';
import { BMJA_RULESET, WESTERN_TM_RULESET, westernTmSpecialHandBindings } from './ruleset';

const looseWinner = (looseTiles: PlayingTile[]): MahjongHand => ({
  sets: [], looseTiles, bonusTiles: [], isWinner: true,
});
const run = (suit: 'bamboo' | 'characters' | 'circles', first: number, last: number) =>
  Array.from({ length: last - first + 1 }, (_, index) => suited(suit, (first + index) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9));
const pairs = (suit: 'bamboo' | 'characters' | 'circles', ranks: number[]) =>
  ranks.flatMap((rank) => [suited(suit, rank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9), suited(suit, rank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)]);

const confusedGates = looseWinner([
  ...run('bamboo', 2, 8), suited('bamboo', 4),
  suited('characters', 1), suited('characters', 1), suited('characters', 1),
  suited('circles', 9), suited('circles', 9), suited('circles', 9),
]);
const confusedGatesReversedPungs = looseWinner([
  ...run('bamboo', 2, 8), suited('bamboo', 4),
  suited('characters', 9), suited('characters', 9), suited('characters', 9),
  suited('circles', 1), suited('circles', 1), suited('circles', 1),
]);
const fiveOddHonours = looseWinner([
  ...run('characters', 1, 9), wind('east'), wind('south'), wind('west'), dragon('red'), dragon('green'),
]);
const gretasGarden = looseWinner([
  ...run('circles', 1, 7), wind('east'), wind('south'), wind('west'), wind('north'), dragon('red'), dragon('green'), dragon('white'),
]);
const sparrowsSanctuary = looseWinner([
  suited('bamboo', 1), suited('bamboo', 1), suited('bamboo', 1), suited('bamboo', 1), ...pairs('bamboo', [2, 3, 4, 6, 8]),
]);
const heavenlyTwins = looseWinner(pairs('circles', [1, 2, 3, 4, 5, 6, 7]));
const allPair = looseWinner([
  ...pairs('characters', [1, 3, 5]), wind('east'), wind('east'), wind('south'), wind('south'), dragon('red'), dragon('red'), dragon('green'), dragon('green'),
]);
const dragonsBreath = looseWinner([
  dragon('green'), dragon('red'), dragon('red'), dragon('white'), ...pairs('bamboo', [1, 3, 5, 7, 9]),
]);

const fixtures = [
  { id: 'run-two-to-eight-with-one-and-nine-pungs', name: 'Confused Gates', value: 1000, fishingValue: 400, hand: confusedGates },
  { id: 'full-suit-run-with-five-distinct-honours', name: 'Five Odd Honours', value: 500, fishingValue: 200, hand: fiveOddHonours },
  { id: 'suit-run-one-to-seven-with-all-honours', name: "Greta's Garden", value: 1000, fishingValue: 400, hand: gretasGarden },
  { id: 'four-bamboo-one-and-five-green-bamboo-pairs', name: "Sparrow's Sanctuary", value: 1500, fishingValue: 600, hand: sparrowsSanctuary },
  { id: 'seven-pairs-one-suit', name: 'Heavenly Twins', value: 1000, fishingValue: 400, hand: heavenlyTwins },
  { id: 'seven-pairs-one-suit-with-honours', name: 'All Pair', value: 500, fishingValue: 200, hand: allPair },
  { id: 'dragon-pair-with-five-suited-pairs', name: "Dragon's Breath", value: 1000, fishingValue: 400, hand: dragonsBreath },
] as const;

const westernScore = (hand: MahjongHand) => WESTERN_TM_RULESET.scoreHand({ hand, playerWind: 'east', prevailingWind: 'east' });

describe('western-tm@0.1 Companion catalogue Pass 4A', () => {
  it('accepts both 1/9 Pung orientations outside the Confused Gates run suit', () => {
    const pattern = canonicalSpecialHandPatterns.find(
      ({ id }) => id === 'run-two-to-eight-with-one-and-nine-pungs',
    )!;
    expect(pattern.detect(confusedGates)).toBe(true);
    expect(pattern.detect(confusedGatesReversedPungs)).toBe(true);
  });

  it('binds the seven fixed hands only to Western, at their local values', () => {
    for (const fixture of fixtures) {
      const pattern = canonicalSpecialHandPatterns.find(({ id }) => id === fixture.id);
      expect(pattern?.detect(fixture.hand)).toBe(true);
      expect(westernTmSpecialHandBindings.filter(({ patternId }) => patternId === fixture.id)).toEqual([
        expect.objectContaining({ profile: { id: 'western-tm', version: '0.1' }, name: fixture.name, value: fixture.value, fishingValue: fixture.fishingValue }),
      ]);
      expect(westernScore(fixture.hand).specialHands).toContainEqual(expect.objectContaining({ id: fixture.id, name: fixture.name, value: fixture.value, matched: true }));
      expect(BMJA_RULESET.scoreHand({ hand: fixture.hand, playerWind: 'east', prevailingWind: 'east' }).specialHands.some(({ id }) => id === fixture.id)).toBe(false);
    }
  });

  it('finds each fixed hand while fishing through the profile-local bindings', () => {
    for (const fixture of fixtures) {
      const fishing: MahjongHand = { ...fixture.hand, looseTiles: fixture.hand.looseTiles!.slice(0, -1), isWinner: false };
      expect(westernScore(fishing).specialFishingMatches).toContainEqual(expect.objectContaining({ id: fixture.id, fishingValue: fixture.fishingValue }));
      expect(BMJA_RULESET.scoreHand({ hand: fishing, playerWind: 'east', prevailingWind: 'east' }).specialFishingMatches).not.toContainEqual(expect.objectContaining({ id: fixture.id }));
    }
  });

  it('enforces the distinguishing structures and physical tile limits', () => {
    const detector = (id: string) => canonicalSpecialHandPatterns.find((pattern) => pattern.id === id)!;
    expect(detector('run-two-to-eight-with-one-and-nine-pungs').detect(looseWinner([
      ...run('bamboo', 2, 8), suited('bamboo', 1),
      suited('bamboo', 1), suited('bamboo', 1), suited('circles', 9), suited('circles', 9), suited('circles', 9),
    ]))).toBe(false);
    expect(detector('run-two-to-eight-with-one-and-nine-pungs').detect(looseWinner([
      ...run('bamboo', 2, 8), suited('bamboo', 1),
      suited('characters', 1), suited('characters', 1), suited('characters', 1), suited('circles', 9), suited('circles', 9), suited('circles', 9),
    ]))).toBe(false);
    expect(detector('full-suit-run-with-five-distinct-honours').detect(looseWinner([
      ...run('characters', 1, 9), wind('east'), wind('east'), wind('west'), dragon('red'), dragon('green'),
    ]))).toBe(false);
    expect(detector('suit-run-one-to-seven-with-all-honours').detect(looseWinner([
      ...run('circles', 1, 7), wind('east'), wind('south'), wind('west'), wind('east'), dragon('red'), dragon('green'), dragon('white'),
    ]))).toBe(false);
    expect(detector('suit-run-one-to-seven-with-all-honours').detect(looseWinner([
      ...run('circles', 1, 7), wind('east'), wind('south'), wind('west'), wind('north'), dragon('red'), dragon('green'), dragon('green'),
    ]))).toBe(false);
    expect(detector('four-bamboo-one-and-five-green-bamboo-pairs').detect(looseWinner([
      suited('bamboo', 1), suited('bamboo', 1), suited('bamboo', 1), suited('bamboo', 1), suited('bamboo', 1), ...pairs('bamboo', [2, 3, 4, 6]), suited('bamboo', 8),
    ]))).toBe(false);
    expect(detector('seven-pairs-one-suit').detect(looseWinner([...pairs('circles', [1, 2, 3, 4, 5, 6]), wind('east'), wind('east')]))).toBe(false);
    expect(detector('seven-pairs-one-suit-with-honours').detect(looseWinner([...pairs('bamboo', [1, 3, 5]), ...pairs('circles', [2]), wind('east'), wind('east'), dragon('red'), dragon('red'), dragon('green'), dragon('green')]))).toBe(false);
    expect(detector('dragon-pair-with-five-suited-pairs').detect(looseWinner([
      dragon('green'), dragon('green'), dragon('red'), dragon('red'), ...pairs('bamboo', [1, 3, 5, 7, 9]),
    ]))).toBe(false);
    expect(detector('dragon-pair-with-five-suited-pairs').detect(looseWinner([
      dragon('green'), dragon('red'), dragon('red'), dragon('white'), ...pairs('bamboo', [1, 3, 5, 7]), ...pairs('circles', [9]),
    ]))).toBe(false);
  });
});
