import { describe, expect, it } from 'vitest';
import { dragon, set, suited } from '../scoring';
import type { MahjongHand } from '../scoring';
import { bmjaSpecialHandBindings, canonicalSpecialHandPatterns, isFixedSpecialHandBinding } from '../scoring/special-hands';
import { detectSpecialFishing } from '../scoring/fishing';
import { WESTERN_TM_RULESET } from './ruleset';
import { westernTmSpecialHandBindings } from './western-tm-catalogue';

const fixed = [
  ['full-suit-run-with-honour-pung-and-opposite-honour-pair', "Dragon's Tail", 1000, 400, 'half'],
  ['all-pair-green-dragon-and-bamboo', 'All Pair Jade', 1000, 400],
  ['four-wind-pairs-with-two-dragon-melds', 'Windy Dragons', 1000, 400, 'full'],
  ['red-dragon-pung-with-character-melds', 'Red Coral', 1000, 400, 'full'],
  ['white-dragon-pung-with-circle-melds', 'White Opal', 1000, 400, 'full'],
  ['one-suit-odd-melds', 'Chinese Odds', 500, 200, 'full'],
  ['two-odd-suits-and-one-even-suit', 'Odds & Evens', 1000, 400],
  ['four-chows-three-suits-one-two-one', 'Robin', 500, 200],
  ['parallel-suit-rank-melds-with-honours', 'Numbers in Parallel', 1500, 600, 'full'],
  ['green-dragon-pung-with-blue-circle-melds', 'Blue Mountains', 1000, 400, 'full'],
  ['white-dragon-meld-with-even-circle-melds', 'White Elephant', 1000, 400, 'full'],
  ['white-dragon-pung-with-odd-character-melds', 'Driven Snow', 1000, 400, 'full'],
  ['red-dragon-pung-with-even-character-melds', "Dragon's Scales", 1000, 400, 'full'],
  ['green-dragon-pung-with-bamboo-melds', 'Green Jade', 1000, 400, 'full'],
  ['green-and-white-dragon-melds-with-green-bamboo', 'Lily of the Valley', 2000, 800, 'full'],
  ['red-and-green-dragon-pungs-with-three-suits', 'Red Waratah', 1000, 400, 'full'],
  ['red-dragon-meld-with-red-bamboo-melds', 'Royal Ruby', 2000, 800, 'full'],
  ['red-and-white-dragon-melds-with-red-bamboo', 'Red Lily', 2000, 800, 'full'],
  ['red-and-green-dragon-melds-with-bamboo', 'Ruby Jade', 1000, 400, 'full'],
] as const;

describe('western-tm@0.1 Companion Pass 4D bindings', () => {
  it('has nineteen neutral canonical patterns, local names and published values', () => {
    for (const [patternId, name, value, fishingValue, exposure] of fixed) {
      expect(canonicalSpecialHandPatterns.some((pattern) => pattern.id === patternId)).toBe(true);
      expect(westernTmSpecialHandBindings).toContainEqual(expect.objectContaining({ patternId, name, value, fishingValue }));
      expect(bmjaSpecialHandBindings.some((binding) => binding.patternId === patternId)).toBe(false);
      const binding = westernTmSpecialHandBindings.find((entry) => entry.patternId === patternId)!;
      if (exposure === 'full') expect(binding).toMatchObject({ exposure: { allowed: true } });
      if (exposure === 'half') expect(binding).toMatchObject({ exposure: { allowed: true, exposedValue: 500, exposedFishingValue: 200 } });
      if (!exposure) expect(isFixedSpecialHandBinding(binding) && binding.exposure).toBeUndefined();
    }
  });

  it('keeps the batch membership exclusive to the Western profile', () => {
    const western = new Set(westernTmSpecialHandBindings.map((binding) => binding.patternId));
    expect(fixed.every(([patternId]) => western.has(patternId))).toBe(true);
  });


  it('recognises White Elephant only with even Circle groups, including Circle 6', () => {
    const detector = canonicalSpecialHandPatterns.find(
      (pattern) => pattern.id === 'white-dragon-meld-with-even-circle-melds',
    )!;
    const hand = (rank: 2 | 3 | 4 | 5 | 6 | 8 | 9): MahjongHand => ({
      sets: [
        set('white', 'kong', dragon('white')),
        set('circle-2', 'pung', suited('circles', 2)),
        set('circle-6', 'pung', suited('circles', 6)),
        set('circle-rank', 'pung', suited('circles', rank)),
        set('pair', 'pair', suited('circles', 4)),
      ],
      bonusTiles: [],
      isWinner: true,
    });
    expect(detector.detect(hand(8))).toBe(true);
    expect(detector.detect(hand(3))).toBe(false);
    expect(detector.detect(hand(5))).toBe(false);
    expect(detector.detect(hand(9))).toBe(false);
  });

  it('finds All Pair Jade fishing from its pure loose 13-tile layout', () => {
    const complete: MahjongHand = {
      sets: [], bonusTiles: [], isWinner: true,
      looseTiles: [dragon('green'), dragon('green'), ...[2, 2, 2, 2, 3, 3, 4, 4, 6, 6, 8, 8].map((rank) => suited('bamboo', rank as 2 | 3 | 4 | 6 | 8))],
    };
    const pattern = canonicalSpecialHandPatterns.find((entry) => entry.id === 'all-pair-green-dragon-and-bamboo')!;
    expect(pattern.detect(complete)).toBe(true);
    const fishing = { ...complete, isWinner: false, looseTiles: complete.looseTiles!.slice(0, -1) };
    const direct = detectSpecialFishing(fishing, westernTmSpecialHandBindings).find((entry) => entry.id === 'all-pair-green-dragon-and-bamboo');
    expect(direct?.fishingValue).toBe(400);
    expect(direct?.completingTiles).toContainEqual(suited('bamboo', 8));
    expect(WESTERN_TM_RULESET.scoreHand({ hand: fishing, playerWind: 'east', prevailingWind: 'east' }).specialFishingMatches).toContainEqual(expect.objectContaining({ id: 'all-pair-green-dragon-and-bamboo', fishingValue: 400 }));
  });
});
