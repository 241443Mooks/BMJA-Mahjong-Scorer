import { describe, expect, it } from 'vitest';
import { dragon, suited, wind } from '../scoring';
import type { MahjongHand, PlayingTile } from '../scoring';
import { canonicalSpecialHandPatterns } from '../scoring/special-hands';
import {
  BMJA_RULESET,
  WESTERN_TM_RULESET,
  westernTmSpecialHandBindings,
} from './ruleset';

const looseWinner = (looseTiles: PlayingTile[]): MahjongHand => ({
  sets: [],
  looseTiles,
  bonusTiles: [],
  isWinner: true,
});

const wrigglyDragon = looseWinner([
  dragon('green'),
  dragon('green'),
  dragon('green'),
  dragon('red'),
  dragon('white'),
  ...Array.from({ length: 9 }, (_, index) =>
    suited('circles', (index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9),
  ),
]);
const dragonette = looseWinner([
  wind('east'),
  wind('south'),
  wind('west'),
  wind('north'),
  dragon('green'),
  dragon('red'),
  dragon('red'),
  dragon('white'),
  suited('bamboo', 2),
  suited('bamboo', 2),
  suited('bamboo', 4),
  suited('bamboo', 4),
  suited('bamboo', 6),
  suited('bamboo', 6),
]);
const windfall = looseWinner([
  wind('east'),
  wind('south'),
  wind('west'),
  wind('north'),
  suited('characters', 1),
  suited('characters', 1),
  suited('characters', 3),
  suited('characters', 3),
  suited('characters', 5),
  suited('characters', 5),
  suited('characters', 7),
  suited('characters', 7),
  suited('characters', 9),
  suited('characters', 9),
]);
const allPairRubyJade = looseWinner([
  dragon('green'),
  dragon('green'),
  dragon('red'),
  dragon('red'),
  suited('bamboo', 1),
  suited('bamboo', 1),
  suited('bamboo', 2),
  suited('bamboo', 2),
  suited('bamboo', 5),
  suited('bamboo', 5),
  suited('bamboo', 6),
  suited('bamboo', 6),
  suited('bamboo', 9),
  suited('bamboo', 9),
]);

const phaseTwo = [
  {
    id: 'wriggly-dragon',
    name: 'Wriggly Dragon',
    hand: wrigglyDragon,
    nearMiss: looseWinner([
      ...wrigglyDragon.looseTiles!.slice(0, -1),
      wind('east'),
    ]),
  },
  {
    id: 'dragonette',
    name: 'Dragonette',
    hand: dragonette,
    nearMiss: looseWinner([
      ...dragonette.looseTiles!.slice(0, -1),
      suited('bamboo', 1),
    ]),
  },
  {
    id: 'windfall',
    name: 'Windfall',
    hand: windfall,
    nearMiss: looseWinner([
      ...windfall.looseTiles!.slice(0, -1),
      dragon('white'),
    ]),
  },
  {
    id: 'all-pair-ruby-jade',
    name: 'All Pair Ruby Jade',
    hand: allPairRubyJade,
    nearMiss: looseWinner([
      ...allPairRubyJade.looseTiles!.slice(0, -1),
      dragon('white'),
    ]),
  },
] as const;

const scoreWestern = (hand: MahjongHand) =>
  WESTERN_TM_RULESET.scoreHand({
    hand,
    playerWind: 'east',
    prevailingWind: 'east',
  });

describe('western-tm@0.1 Companion catalogue Phase 2', () => {
  it('adds exactly one neutral canonical detector for each new structure', () => {
    for (const { id, hand, nearMiss } of phaseTwo) {
      const pattern = canonicalSpecialHandPatterns.filter(
        (candidate) => candidate.id === id,
      );
      expect(pattern).toHaveLength(1);
      expect(pattern[0].detect(hand)).toBe(true);
      expect(pattern[0].detect(nearMiss)).toBe(false);
    }
  });

  it('binds each new detector only to the Western catalogue at 1000/400', () => {
    expect(phaseTwo).toHaveLength(4);
    expect(westernTmSpecialHandBindings).toHaveLength(10);
    for (const { id, name, hand } of phaseTwo) {
      expect(
        westernTmSpecialHandBindings.filter(
          (binding) => binding.patternId === id,
        ),
      ).toEqual([
        expect.objectContaining({
          profile: { id: 'western-tm', version: '0.1' },
          name,
          value: 1000,
          fishingValue: 400,
        }),
      ]);
      expect(scoreWestern(hand).specialHands).toContainEqual(
        expect.objectContaining({ id, name, value: 1000, matched: true }),
      );
      expect(
        BMJA_RULESET.scoreHand({
          hand,
          playerWind: 'east',
          prevailingWind: 'east',
        }).specialHands.some((special) => special.id === id),
      ).toBe(false);
    }
  });

  it('finds each new Western hand while fishing for its final ungrouped tile', () => {
    for (const { id, hand } of phaseTwo) {
      const fishingHand: MahjongHand = {
        ...hand,
        looseTiles: hand.looseTiles!.slice(0, -1),
        isWinner: false,
      };
      expect(scoreWestern(fishingHand).specialFishingMatches).toContainEqual(
        expect.objectContaining({ id, fishingValue: 400 }),
      );
    }
  });

  it('keeps the Phase 1 six bindings unchanged and leaves unrelated BMJA specials unbound', () => {
    expect(
      westernTmSpecialHandBindings
        .slice(0, 6)
        .map((binding) => binding.patternId),
    ).toEqual([
      'three-great-scholars',
      'thirteen-unique-wonders',
      'all-pair-honours',
      'four-blessings',
      'all-winds-and-dragons',
      'heads-and-tails',
    ]);
    expect(
      westernTmSpecialHandBindings.map((binding) => binding.patternId),
    ).not.toEqual(
      expect.arrayContaining([
        'imperial-jade',
        'wriggling-snake',
        'gates-of-heaven',
      ]),
    );
  });
});
