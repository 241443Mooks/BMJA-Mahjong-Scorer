import { describe, expect, it } from 'vitest';
import { bonus, dragon, set, suited, wind, type MahjongHand, type PlayingTile } from '../scoring';
import { WESTERN_TM_PROFILE_REF } from '../game/ruleset';
import type { GamePlayer, HandScoreInput, ProgressionState, SeatAssignments } from '../game/types';
import {
  aggregateTransactionEffects,
  createParityHarness,
  jsonNormalise,
  platformScoreInput,
  projectSettlementTransactions,
  runtimeBreakdown,
} from './parity-harness.test-support';

// Source fixtures: game/western-tm-profile.test.ts and game/western-tm-pass4a.test.ts.
const players: GamePlayer[] = ['east', 'south', 'west', 'north'].map((id) => ({ id, name: id }));
const seats: SeatAssignments = { east: 'east', south: 'south', west: 'west', north: 'north' };
const progression: ProgressionState = {
  seats: { east: 'east', south: 'south', west: 'west', north: 'north' },
  prevailingWind: 'east', eastCycleStartPlayerId: 'east',
};
const scholars: MahjongHand = {
  sets: [
    set('red', 'pung', dragon('red')), set('green', 'pung', dragon('green')),
    set('white', 'pung', dragon('white')), set('other', 'pung', suited('circles', 4)),
    set('pair', 'pair', suited('bamboo', 2)),
  ], bonusTiles: [], isWinner: true,
};
const scholarsFishing: MahjongHand = {
  sets: [
    set('red', 'pung', dragon('red')), set('green', 'pung', dragon('green')),
    set('other', 'pung', suited('circles', 4)), set('pair', 'pair', suited('bamboo', 2)),
  ], remainingTiles: [dragon('white'), dragon('white')], bonusTiles: [], isWinner: false,
};
const purityFishing: MahjongHand = {
  sets: [
    set('1', 'pung', suited('bamboo', 2)), set('2', 'pung', suited('bamboo', 3)),
    set('3', 'kong', suited('bamboo', 6)), set('4', 'pair', suited('bamboo', 8)),
  ], remainingTiles: [suited('bamboo', 4), suited('bamboo', 4)], bonusTiles: [], isWinner: false,
};
const looseWinner = (looseTiles: PlayingTile[]): MahjongHand => ({ sets: [], looseTiles, bonusTiles: [], isWinner: true });
const pairs = (suit: 'bamboo' | 'characters' | 'circles', ranks: number[]) => ranks.flatMap((rank) => [suited(suit, rank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9), suited(suit, rank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)]);
const companionCases = [
  { id: 'seven-pairs-one-suit', value: 1000, fishingValue: 400, hand: looseWinner(pairs('circles', [1, 2, 3, 4, 5, 6, 7])) },
  { id: 'four-bamboo-one-and-five-green-bamboo-pairs', value: 1500, fishingValue: 600, hand: looseWinner([suited('bamboo', 1), suited('bamboo', 1), suited('bamboo', 1), suited('bamboo', 1), ...pairs('bamboo', [2, 3, 4, 6, 8])]) },
] as const;
const ordinary: HandScoreInput = {
  hand: { sets: [set('red', 'pung', dragon('red'), 'exposed'), set('chow', 'chow', suited('bamboo', 2), 'exposed'), set('minor', 'pung', suited('bamboo', 5)), set('terminal', 'pung', suited('bamboo', 9)), set('pair', 'pair', wind('south'))], bonusTiles: [bonus('flower', 2)], isWinner: true, winningMethod: 'wall' },
  playerWind: 'south', prevailingWind: 'east',
};
const cappedOrdinary: HandScoreInput = {
  hand: { sets: [set('red', 'pung', dragon('red'), 'exposed'), set('green', 'pung', dragon('green')), set('east', 'pung', wind('east')), set('minor', 'pung', suited('bamboo', 5)), set('pair', 'pair', wind('south'))], bonusTiles: [bonus('flower', 1)], isWinner: true, winningMethod: 'wall' },
  playerWind: 'east', prevailingWind: 'east',
};
const harness = createParityHarness(WESTERN_TM_PROFILE_REF);

describe('western-tm@0.1 B0 curated migration matrix', () => {
  const scoreParity = async (input: HandScoreInput) => {
    const { legacy, runtime } = await harness;
    expect(jsonNormalise(runtimeBreakdown(legacy, runtime, input))).toEqual(jsonNormalise(legacy.scoreHand(input)));
  };

  it('game/western-tm-profile.test.ts Three Great Scholars complete — full breakdown parity', async () => {
    const input = { hand: scholars, playerWind: 'east' as const, prevailingWind: 'east' as const };
    await scoreParity(input);
    const { legacy } = await harness;
    expect(legacy.scoreHand(input).finalScore).toBe(1500);
  });

  it('game/western-tm-profile.test.ts Three Great Scholars fishing override — full breakdown parity', async () => {
    const input = { hand: scholarsFishing, playerWind: 'east' as const, prevailingWind: 'east' as const };
    await scoreParity(input);
    const { legacy } = await harness;
    expect(legacy.scoreHand(input).specialFishing).toMatchObject({ id: 'three-great-scholars', fishingValue: 600 });
  });

  it('game/western-tm-profile.test.ts Purity fishing exclusion — full breakdown parity', async () => {
    const input = { hand: purityFishing, playerWind: 'east' as const, prevailingWind: 'east' as const };
    await scoreParity(input);
    const { legacy } = await harness;
    expect(legacy.scoreHand(input).specialFishingMatches).toEqual([]);
  });

  it('game/western-tm-pass4a.test.ts representative Companion fixed hands and fishing — full breakdown parity', async () => {
    const { legacy } = await harness;
    for (const fixture of companionCases) {
      const complete = { hand: fixture.hand, playerWind: 'east' as const, prevailingWind: 'east' as const };
      const fishing = { hand: { ...fixture.hand, looseTiles: fixture.hand.looseTiles!.slice(0, -1), isWinner: false }, playerWind: 'east' as const, prevailingWind: 'east' as const };
      await scoreParity(complete); await scoreParity(fishing);
      expect(legacy.scoreHand(complete).specialHands).toContainEqual(expect.objectContaining({ id: fixture.id, value: fixture.value, matched: true }));
      expect(legacy.scoreHand(fishing).specialFishingMatches).toContainEqual(expect.objectContaining({ id: fixture.id, fishingValue: fixture.fishingValue }));
    }
  });

  it('game/western-tm-profile.test.ts BMJA Imperial Jade remains unbound — full breakdown parity', async () => {
    const input = { hand: { sets: [set('one', 'pung', dragon('green')), set('two', 'pung', suited('bamboo', 2)), set('three', 'pung', suited('bamboo', 4)), set('four', 'pung', suited('bamboo', 8)), set('five', 'pair', suited('bamboo', 6))], bonusTiles: [], isWinner: true }, playerWind: 'east' as const, prevailingWind: 'east' as const };
    await scoreParity(input);
    const { legacy } = await harness;
    expect(legacy.scoreHand(input).specialHands.find(({ id }) => id === 'imperial-jade')).toBeUndefined();
  });

  it('game/western-tm-profile.test.ts ordinary shared scoring and cap — full breakdown parity', async () => {
    await scoreParity(ordinary); await scoreParity(cappedOrdinary);
    const { legacy } = await harness;
    expect(legacy.scoreHand(cappedOrdinary)).toMatchObject({ finalScore: 1000, limitApplied: true });
  });

  it('game/western-tm-profile.test.ts shared settlement, progression, and normal mode — parity', async () => {
    const { legacy, runtime } = await harness;
    const round = { outcome: { type: 'win' as const, winnerId: 'south' }, scores: { east: 100, south: 200, west: 300, north: 400 } };
    const directSettlement = legacy.settleRound(players, seats, round); const platformSettlement = runtime.settleRound({ players, seats, round });
    expect(projectSettlementTransactions(platformSettlement)).toEqual(directSettlement.transactions);
    expect(aggregateTransactionEffects(players.map(({ id }) => id), platformSettlement)).toEqual(directSettlement.changes);
    const directProgression = legacy.progressGame(players, progression, round.outcome); const platformProgression = runtime.progressGame({ players, current: progression, outcome: round.outcome });
    expect(platformProgression.nextState).toEqual({ seats: directProgression.seats, prevailingWind: directProgression.prevailingWind, eastCycleStartPlayerId: directProgression.eastCycleStartPlayerId });
    expect(runtime.nextHandMode({ current: 'normal', outcome: { type: 'draw' } })).toBe(legacy.nextHandMode('normal', { type: 'draw' }));
  });

  it('game/western-tm-profile.test.ts audit selects exact T&M identities only', async () => {
    const { legacy, runtime } = await harness;
    const scored = runtime.scoreHand(platformScoreInput(legacy, ordinary));
    expect(scored).toMatchObject({ profile: WESTERN_TM_PROFILE_REF, legal: true, disposition: { kind: 'scored' } });
    const identities = scored.decisionTrace.flatMap(({ identities }) => Object.values(identities));
    expect(identities).toContain('classical.bindings.western-tm-current@1');
    expect(identities).toContain('classical.policy.western-tm-current@1');
    expect(identities).not.toContain('classical.bindings.bmja-current@2');
    expect(identities).not.toContain('classical.policy.bmja-current@1');
    expect(identities).not.toContain('classical.bindings.outside-the-box-current@1');
    expect(identities).not.toContain('classical.policy.outside-the-box-current@1');
  });
});
