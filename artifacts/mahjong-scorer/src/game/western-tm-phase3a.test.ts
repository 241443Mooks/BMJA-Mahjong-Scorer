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

const base = [
  ...Array.from({ length: 9 }, (_, index) =>
    suited('circles', (index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9),
  ),
  wind('east'),
  wind('south'),
  wind('west'),
  wind('north'),
];
const withPair = (tile: PlayingTile) => looseWinner([...base, tile]);
const scoreWestern = (hand: MahjongHand) =>
  WESTERN_TM_RULESET.scoreHand({
    hand,
    playerWind: 'east',
    prevailingWind: 'east',
  });

describe('western-tm@0.1 Companion catalogue Phase 3A: Wriggly Snake', () => {
  const tmPattern = canonicalSpecialHandPatterns.find(
    ({ id }) => id === 'wriggling-snake-any-pair',
  )!;
  const bmjaPattern = canonicalSpecialHandPatterns.find(
    ({ id }) => id === 'wriggling-snake',
  )!;

  it('keeps the existing BMJA Wriggling Snake predicate unchanged', () => {
    const bmjaHand = withPair(suited('circles', 1));
    expect(bmjaPattern.detect(bmjaHand)).toBe(true);
    expect(tmPattern.detect(bmjaHand)).toBe(true);
    expect(
      BMJA_RULESET.scoreHand({
        hand: bmjaHand,
        playerWind: 'east',
        prevailingWind: 'east',
      }).specialHands,
    ).toContainEqual(
      expect.objectContaining({ id: 'wriggling-snake', matched: true }),
    );
  });

  it('accepts every evidenced T&M pair location and rejects non-T&M structures', () => {
    for (const pair of [
      suited('circles', 1),
      suited('circles', 5),
      suited('circles', 9),
      wind('north'),
    ]) {
      expect(tmPattern.detect(withPair(pair))).toBe(true);
    }

    const missingRank = looseWinner([
      ...base.filter((tile) => !(tile.family === 'suit' && tile.rank === 5)),
      suited('circles', 4),
      suited('circles', 4),
    ]);
    const missingWind = looseWinner([
      ...base.filter((tile) => !(tile.family === 'wind' && tile.wind === 'north')),
      wind('west'),
      wind('west'),
    ]);
    const wrongSuit = looseWinner([
      ...base.map((tile) =>
        tile.family === 'suit' && tile.rank === 5 ? suited('bamboo', 5) : tile,
      ),
      wind('east'),
    ]);
    const extraDragon = looseWinner([...base, dragon('red')]);
    const impossible = looseWinner([
      ...base.filter(
        (tile) => tile.family !== 'suit' || ![2, 3, 4, 5, 6].includes(tile.rank),
      ),
      suited('circles', 1),
      suited('circles', 1),
      suited('circles', 1),
      suited('circles', 1),
      suited('circles', 1),
    ]);
    for (const hand of [missingRank, missingWind, wrongSuit, extraDragon, impossible]) {
      expect(tmPattern.detect(hand)).toBe(false);
    }
  });

  it('binds only the T&M structure and keeps a Wind-paired variant out of BMJA', () => {
    const tmOnly = withPair(wind('north'));
    expect(westernTmSpecialHandBindings).toHaveLength(25);
    expect(
      westernTmSpecialHandBindings.filter(
        ({ patternId }) => patternId === 'wriggling-snake-any-pair',
      ),
    ).toEqual([
      expect.objectContaining({
        profile: { id: 'western-tm', version: '0.1' },
        name: 'Wriggly Snake',
        value: 1000,
        fishingValue: 400,
      }),
    ]);
    expect(
      BMJA_RULESET.scoreHand({
        hand: tmOnly,
        playerWind: 'east',
        prevailingWind: 'east',
      }).specialHands.find(({ id }) => id === 'wriggling-snake'),
    ).toMatchObject({ matched: false });
    expect(scoreWestern(tmOnly).specialHands).toContainEqual(
      expect.objectContaining({
        id: 'wriggling-snake-any-pair',
        name: 'Wriggly Snake',
        value: 1000,
        matched: true,
      }),
    );
  });

  it('offers each base tile as a natural Western fishing completion', () => {
    const fishingHand: MahjongHand = {
      sets: [],
      looseTiles: base,
      bonusTiles: [],
      isWinner: false,
    };
    expect(scoreWestern(fishingHand).specialFishingMatches).toContainEqual(
      expect.objectContaining({
        id: 'wriggling-snake-any-pair',
        fishingValue: 400,
        completingTiles: expect.arrayContaining([
          suited('circles', 5),
          wind('north'),
        ]),
      }),
    );
  });
});
