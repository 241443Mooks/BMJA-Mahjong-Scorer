import { describe, expect, it } from 'vitest';
import { bonus, dragon, set, suited, wind } from '../scoring';
import { canonicalSpecialHandPatterns } from '../scoring/special-hands';
import type { MahjongHand } from '../scoring';
import { createBmjaGame } from './game';
import {
  BMJA_PROFILE_REF,
  BMJA_RULESET,
  resolveRulesProfile,
  WESTERN_TM_PROFILE_REF,
  WESTERN_TM_RULESET,
  westernTmSpecialHandBindings,
} from './ruleset';
import { loadGameRecovery, saveGameRecovery } from './persistence';
import type { GamePlayer, SeatAssignments } from './types';

const players: GamePlayer[] = [
  { id: 'east', name: 'East' },
  { id: 'south', name: 'South' },
  { id: 'west', name: 'West' },
  { id: 'north', name: 'North' },
];
const seats: SeatAssignments = {
  east: 'east',
  south: 'south',
  west: 'west',
  north: 'north',
};
const storage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
};

const scholars: MahjongHand = {
  sets: [
    set('red', 'pung', dragon('red')),
    set('green', 'pung', dragon('green')),
    set('white', 'pung', dragon('white')),
    set('other', 'pung', suited('circles', 4)),
    set('pair', 'pair', suited('bamboo', 2)),
  ],
  bonusTiles: [],
  isWinner: true,
};
const scholarsFishing: MahjongHand = {
  sets: [
    set('red', 'pung', dragon('red')),
    set('green', 'pung', dragon('green')),
    set('other', 'pung', suited('circles', 4)),
    set('pair', 'pair', suited('bamboo', 2)),
  ],
  remainingTiles: [dragon('white'), dragon('white')],
  bonusTiles: [],
  isWinner: false,
};
const purityFishing: MahjongHand = {
  sets: [
    set('1', 'pung', suited('bamboo', 2)),
    set('2', 'pung', suited('bamboo', 3)),
    set('3', 'kong', suited('bamboo', 6)),
    set('4', 'pair', suited('bamboo', 8)),
  ],
  remainingTiles: [suited('bamboo', 4), suited('bamboo', 4)],
  bonusTiles: [],
  isWinner: false,
};
const allPairHonours: MahjongHand = {
  sets: [
    set('1', 'pair', wind('east')),
    set('2', 'pair', wind('south')),
    set('3', 'pair', suited('bamboo', 1)),
    set('4', 'pair', suited('characters', 9)),
    set('5', 'pair', dragon('red')),
    set('6', 'pair', dragon('green')),
    set('7', 'pair', dragon('white')),
  ],
  bonusTiles: [],
  isWinner: true,
};
const uniqueWonder: MahjongHand = { sets: [], looseTiles: [suited('bamboo', 1), suited('bamboo', 9), suited('characters', 1), suited('characters', 9), suited('circles', 1), suited('circles', 9), wind('east'), wind('south'), wind('west'), wind('north'), dragon('red'), dragon('green'), dragon('white'), wind('east')], bonusTiles: [], isWinner: true };
const fourBlessings: MahjongHand = { sets: [set('east', 'pung', wind('east')), set('south', 'pung', wind('south')), set('west', 'pung', wind('west')), set('north', 'pung', wind('north')), set('pair', 'pair', dragon('red'))], bonusTiles: [], isWinner: true };
const allWindsAndDragons: MahjongHand = { sets: [set('east', 'pung', wind('east')), set('south', 'pung', wind('south')), set('red', 'pung', dragon('red')), set('green', 'pung', dragon('green')), set('pair', 'pair', dragon('white'))], bonusTiles: [], isWinner: true };
const headsAndTails: MahjongHand = { sets: [set('b1', 'pung', suited('bamboo', 1)), set('b9', 'pung', suited('bamboo', 9)), set('c1', 'pung', suited('characters', 1)), set('c9', 'pung', suited('characters', 9)), set('pair', 'pair', suited('circles', 1))], bonusTiles: [], isWinner: true };
const westernBatch: Array<{
  id: string;
  name: string;
  value: number;
  fishingValue: number;
  hand: MahjongHand;
  fishing?: MahjongHand;
}> = [
  { id: 'thirteen-unique-wonders', name: 'Unique Wonder', value: 2000, fishingValue: 800, hand: uniqueWonder, fishing: { sets: [], looseTiles: uniqueWonder.looseTiles!.slice(0, -1), bonusTiles: [], isWinner: false } },
  { id: 'all-pair-honours', name: 'All Pair Honours', value: 1000, fishingValue: 400, hand: allPairHonours },
  { id: 'four-blessings', name: 'Four Blessings', value: 1500, fishingValue: 600, hand: fourBlessings, fishing: { sets: [set('east', 'pung', wind('east')), set('south', 'pung', wind('south')), set('west', 'pung', wind('west')), set('pair', 'pair', dragon('red'))], remainingTiles: [wind('north'), wind('north')], bonusTiles: [], isWinner: false } },
  { id: 'all-winds-and-dragons', name: 'All Winds and Dragons', value: 1000, fishingValue: 400, hand: allWindsAndDragons, fishing: { sets: [set('east', 'pung', wind('east')), set('south', 'pung', wind('south')), set('red', 'pung', dragon('red')), set('pair', 'pair', dragon('green'))], remainingTiles: [wind('west'), wind('west')], bonusTiles: [], isWinner: false } },
  { id: 'heads-and-tails', name: 'Heads and Tails', value: 1000, fishingValue: 400, hand: headsAndTails, fishing: { sets: [set('b1', 'pung', suited('bamboo', 1)), set('b9', 'pung', suited('bamboo', 9)), set('c1', 'pung', suited('characters', 1)), set('pair', 'pair', suited('characters', 9))], remainingTiles: [suited('circles', 1), suited('circles', 1)], bonusTiles: [], isWinner: false } },
];

describe('western-tm@0.1 provisional profile', () => {
  it('resolves separately and persists/replays its exact version', () => {
    expect(resolveRulesProfile(BMJA_PROFILE_REF)).toBe(BMJA_RULESET);
    expect(resolveRulesProfile(WESTERN_TM_PROFILE_REF)).toBe(
      WESTERN_TM_RULESET,
    );
    const game = createBmjaGame(
      players,
      seats,
      undefined,
      'full-game',
      WESTERN_TM_PROFILE_REF,
    );
    const memory = storage();
    saveGameRecovery(memory, game, 'win', 'east', {
      scores: {},
      scoreRecords: {},
    });
    expect(loadGameRecovery(memory)?.game.setup.rulesProfile).toEqual(
      WESTERN_TM_PROFILE_REF,
    );
  });

  it('uses one canonical Three Great Scholars detector with isolated bindings', () => {
    const bmja = BMJA_RULESET.scoreHand({
      hand: scholars,
      playerWind: 'east',
      prevailingWind: 'east',
    });
    const western = WESTERN_TM_RULESET.scoreHand({
      hand: scholars,
      playerWind: 'east',
      prevailingWind: 'east',
    });
    expect(
      bmja.specialHands.find((hand) => hand.id === 'three-great-scholars'),
    ).toMatchObject({ value: 1000, matched: true });
    expect(
      western.specialHands.find((hand) => hand.id === 'three-great-scholars'),
    ).toMatchObject({
      name: 'Three Great Scholars',
      value: 1500,
      matched: true,
    });
    expect(bmja.finalScore).toBe(1000);
    expect(western.finalScore).toBe(1500);
  });

  it('keeps the evidenced fishing override profile-local', () => {
    const bmja = BMJA_RULESET.scoreHand({
      hand: scholarsFishing,
      playerWind: 'east',
      prevailingWind: 'east',
    });
    const western = WESTERN_TM_RULESET.scoreHand({
      hand: scholarsFishing,
      playerWind: 'east',
      prevailingWind: 'east',
    });
    expect(bmja.specialFishing).toMatchObject({
      id: 'three-great-scholars',
      fishingValue: 400,
    });
    expect(western.specialFishing).toMatchObject({
      id: 'three-great-scholars',
      fishingValue: 600,
    });
    expect(bmja.finalScore).toBe(400);
    expect(western.finalScore).toBe(600);
  });

  it('keeps fishing catalogue membership and values profile-local', () => {
    const bmjaPurity = BMJA_RULESET.scoreHand({
      hand: purityFishing,
      playerWind: 'east',
      prevailingWind: 'east',
    });
    const westernPurity = WESTERN_TM_RULESET.scoreHand({
      hand: purityFishing,
      playerWind: 'east',
      prevailingWind: 'east',
    });
    expect(bmjaPurity.specialFishingMatches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'purity',
          fishingValue: 'three-doubles',
        }),
      ]),
    );
    expect(westernPurity.specialFishing).toBeUndefined();
    expect(westernPurity.specialFishingMatches).toEqual([]);
  });

  it('binds the five evidenced Companion hands to existing canonical detectors', () => {
    expect(westernTmSpecialHandBindings).toHaveLength(10);
    for (const fixture of westernBatch) {
      expect(canonicalSpecialHandPatterns.filter(({ id }) => id === fixture.id)).toHaveLength(1);
      expect(WESTERN_TM_RULESET.scoreHand({ hand: fixture.hand, playerWind: 'east', prevailingWind: 'east' }).specialHands).toContainEqual(expect.objectContaining({ id: fixture.id, name: fixture.name, value: fixture.value, matched: true }));
      if (fixture.fishing) {
        expect(WESTERN_TM_RULESET.scoreHand({ hand: fixture.fishing, playerWind: 'east', prevailingWind: 'east' }).specialFishingMatches).toContainEqual(expect.objectContaining({ id: fixture.id, fishingValue: fixture.fishingValue }));
      }
    }
  });

  it('does not inherit an unbound BMJA special-hand membership', () => {
    expect(
      BMJA_RULESET.scoreHand({
        hand: allPairHonours,
        playerWind: 'east',
        prevailingWind: 'east',
      }).specialHands.find((hand) => hand.id === 'all-pair-honours'),
    ).toMatchObject({ matched: true, value: 500 });
    expect(
      WESTERN_TM_RULESET.scoreHand({
        hand: { sets: [set('one', 'pung', dragon('green')), set('two', 'pung', suited('bamboo', 2)), set('three', 'pung', suited('bamboo', 4)), set('four', 'pung', suited('bamboo', 8)), set('five', 'pair', suited('bamboo', 6))], bonusTiles: [], isWinner: true },
        playerWind: 'east',
        prevailingWind: 'east',
      }).specialHands.find((hand) => hand.id === 'imperial-jade'),
    ).toBeUndefined();
  });

  it('reuses ordinary scoring, settlement, and progression without a second engine', () => {
    const ordinary = {
      sets: [
        set('red', 'pung', dragon('red'), 'exposed'),
        set('chow', 'chow', suited('bamboo', 2), 'exposed'),
        set('minor', 'pung', suited('bamboo', 5)),
        set('terminal', 'pung', suited('bamboo', 9)),
        set('pair', 'pair', wind('south')),
      ],
      bonusTiles: [bonus('flower', 2)],
      isWinner: true,
      winningMethod: 'wall' as const,
    };
    const input = {
      hand: ordinary,
      playerWind: 'south' as const,
      prevailingWind: 'east' as const,
    };
    expect(WESTERN_TM_RULESET.scoreHand(input)).toMatchObject({
      finalScore: BMJA_RULESET.scoreHand(input).finalScore,
      basePoints: BMJA_RULESET.scoreHand(input).basePoints,
      doubles: BMJA_RULESET.scoreHand(input).doubles,
      calculationComponents:
        BMJA_RULESET.scoreHand(input).calculationComponents,
    });
    expect(WESTERN_TM_RULESET.settleRound).toBe(BMJA_RULESET.settleRound);
    expect(WESTERN_TM_RULESET.progressGame).toBe(BMJA_RULESET.progressGame);
  });

  it('keeps ordinary scores at the shared cap while allowing the fixed Western special value', () => {
    const cappedOrdinary: MahjongHand = {
      sets: [
        set('red', 'pung', dragon('red'), 'exposed'),
        set('green', 'pung', dragon('green')),
        set('east', 'pung', wind('east')),
        set('minor', 'pung', suited('bamboo', 5)),
        set('pair', 'pair', wind('south')),
      ],
      bonusTiles: [bonus('flower', 1)],
      isWinner: true,
      winningMethod: 'wall',
    };
    const input = {
      hand: cappedOrdinary,
      playerWind: 'east' as const,
      prevailingWind: 'east' as const,
    };
    const bmja = BMJA_RULESET.scoreHand(input);
    const western = WESTERN_TM_RULESET.scoreHand(input);
    expect(bmja.uncappedScore).toBeGreaterThan(1000);
    expect(bmja.finalScore).toBe(1000);
    expect(western.finalScore).toBe(1000);
    expect(
      WESTERN_TM_RULESET.scoreHand({
        hand: scholars,
        playerWind: 'east',
        prevailingWind: 'east',
      }).finalScore,
    ).toBe(1500);
    expect(WESTERN_TM_RULESET.scoreHand({ hand: uniqueWonder, playerWind: 'east', prevailingWind: 'east' }).finalScore).toBe(2000);
  });
});
