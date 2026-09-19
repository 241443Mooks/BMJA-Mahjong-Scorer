import { beforeAll, describe, expect, it } from 'vitest';
import { initialiseCurrentRulesRuntimes } from './current-runtime-registry';
import { bonus, dragon, set, suited, wind, type MahjongHand } from '../scoring';
import { confirmHand, createBmjaGame } from '../game/game';
import { BMJA_PROFILE_REF } from '../game/ruleset';
import type { GamePlayer, HandScoreInput, ProgressionState, SeatAssignments } from '../game/types';
import {
  aggregateTransactionEffects,
  createParityHarness,
  jsonNormalise,
  platformScoreInput,
  projectSettlementTransactions,
  runtimeBreakdown,
} from './parity-harness.test-support';

beforeAll(() => initialiseCurrentRulesRuntimes());

// Source fixture: scoring/golden-fixtures.test.ts — standard mixed-one-suit winner.
const ordinary: MahjongHand = {
  sets: [
    set('dragon', 'pung', dragon('red'), 'exposed'),
    set('chow-1', 'chow', suited('bamboo', 2), 'exposed'),
    set('minor', 'pung', suited('bamboo', 5)),
    set('terminal', 'pung', suited('bamboo', 9)),
    set('pair', 'pair', wind('south')),
  ],
  bonusTiles: [bonus('flower', 2)],
  isWinner: true,
  winningMethod: 'wall',
};
const ordinaryInput = { hand: ordinary, playerWind: 'south' as const, prevailingWind: 'east' as const };
const players: GamePlayer[] = [
  { id: 'bill', name: 'Bill' }, { id: 'rod', name: 'Rod' },
  { id: 'ben', name: 'Ben' }, { id: 'jack', name: 'Jack' },
];
const seats: SeatAssignments = { bill: 'south', rod: 'east', ben: 'west', jack: 'north' };
const initial: ProgressionState = { seats: { a: 'east', b: 'south', c: 'west', d: 'north' }, prevailingWind: 'east', eastCycleStartPlayerId: 'a' };
const progressionPlayers: GamePlayer[] = ['a', 'b', 'c', 'd'].map((id) => ({ id, name: id }));
const harness = createParityHarness(BMJA_PROFILE_REF);

describe('bmja@1.0 A0 parity smoke', () => {
  it('scoring/golden-fixtures.test.ts mixed-one-suit — ordinary full breakdown parity', async () => {
    const { legacy, runtime } = await harness;
    expect(jsonNormalise(runtimeBreakdown(legacy, runtime, ordinaryInput)))
      .toEqual(jsonNormalise(legacy.scoreHand(ordinaryInput)));
    const scored = runtime.scoreHand(platformScoreInput(legacy, ordinaryInput));
    expect(scored).toMatchObject({ profile: BMJA_PROFILE_REF, legal: true, disposition: { kind: 'scored' } });
    expect(scored.decisionTrace).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'classical-runtime.scoring', identities: expect.objectContaining({ bindingId: 'classical.bindings.bmja-current@2', policyId: 'classical.policy.bmja-current@1' }) }),
      expect.objectContaining({ id: 'classical-runtime.final', identities: expect.objectContaining({ reasonId: 'classical-runtime.scored' }) }),
    ]));
  });

  it('scoring/score.test.ts malformed set shape — invalid validation parity', async () => {
    const { legacy, runtime } = await harness;
    const invalid = { ...ordinaryInput, hand: { ...ordinary, sets: [set('pair', 'pair', wind('east'))] } };
    expect(runtime.validateHand(platformScoreInput(legacy, invalid)))
      .toEqual(legacy.scoreHand(invalid).validationErrors);
    expect(jsonNormalise(runtimeBreakdown(legacy, runtime, invalid)))
      .toEqual(jsonNormalise(legacy.scoreHand(invalid)));
  });

  it('game/settlement.test.ts East winner — settlement transaction and balance parity', async () => {
    const { legacy, runtime } = await harness;
    const round = { outcome: { type: 'win' as const, winnerId: 'rod' }, scores: { bill: 100, rod: 200, ben: 300, jack: 400 } };
    const legacySettlement = legacy.settleRound(players, seats, round);
    const platformSettlement = runtime.settleRound({ players, seats, round });
    expect(projectSettlementTransactions(platformSettlement)).toEqual(legacySettlement.transactions);
    expect(aggregateTransactionEffects(players.map(({ id }) => id), platformSettlement)).toEqual(legacySettlement.changes);
    expect(platformSettlement.map(({ reasonId }) => reasonId)).toEqual(
      legacySettlement.transactions.map(({ reason }) => `settlement.classical-pairwise.${reason}`),
    );
  });

  it('game/progression.test.ts non-East winner — progression state and reason parity', async () => {
    const { legacy, runtime } = await harness;
    const outcome = { type: 'win' as const, winnerId: 'c' };
    const direct = legacy.progressGame(progressionPlayers, initial, outcome);
    const platform = runtime.progressGame({ players: progressionPlayers, current: initial, outcome });
    expect(platform.nextState).toEqual({ seats: direct.seats, prevailingWind: direct.prevailingWind, eastCycleStartPlayerId: direct.eastCycleStartPlayerId });
    expect(platform.metadata).toMatchObject({ seatsRotated: direct.seatsRotated, prevailingWindAdvanced: direct.prevailingWindAdvanced });
    expect(platform.reasonId).toBe('progression.classical-east-cycle.east-passed-after-non-east-win');
  });

  it('game/rules-profile-parity.test.ts BMJA normal mode — hand-mode parity', async () => {
    const { legacy, runtime } = await harness;
    expect(runtime.nextHandMode({ current: 'normal', outcome: { type: 'draw' } }))
      .toBe(legacy.nextHandMode('normal', { type: 'draw' }));
  });

  it('game/game.test.ts one-round completion — observed game-end parity and reason', async () => {
    const { runtime } = await harness;
    let game = createBmjaGame(players, seats, undefined, 'one-round');
    const scores = { bill: 0, rod: 0, ben: 0, jack: 0 };
    for (let rotation = 0; rotation < 4; rotation += 1) {
      const winnerId = Object.entries(game.seats).find(([, seat]) => seat === 'south')?.[0];
      if (!winnerId) throw new Error('Expected a South player.');
      const previousPrevailingWind = game.prevailingWind;
      game = confirmHand(game, { outcome: { type: 'win', winnerId }, scores });
      if (rotation === 3) {
        expect(runtime.evaluateGameEnd({ gameLength: 'one-round', previousPrevailingWind, progression: { prevailingWindAdvanced: true } }))
          .toEqual({ complete: game.isComplete, reasonId: 'game-end.classical-east-cycle.one-round-complete' });
      }
    }
    expect(game.isComplete).toBe(true);
  });
});

describe('bmja@1.0 A1 curated migration matrix', () => {
  const scoreParity = async (input: HandScoreInput) => {
    const { legacy, runtime } = await harness;
    expect(jsonNormalise(runtimeBreakdown(legacy, runtime, input))).toEqual(jsonNormalise(legacy.scoreHand(input)));
  };

  it('scoring/golden-fixtures.test.ts Purity bonus components — full breakdown parity', async () => {
    await scoreParity({ hand: { sets: [set('p1', 'pung', suited('characters', 2), 'exposed'), set('p2', 'pung', suited('characters', 3)), set('p3', 'pung', suited('characters', 6)), set('k1', 'kong', suited('characters', 9)), set('pair', 'pair', suited('characters', 5))], bonusTiles: [bonus('flower', 1), bonus('season', 2)], isWinner: true, winningMethod: 'discard' }, playerWind: 'east', prevailingWind: 'east' });
  });

  it('scoring/score.test.ts standard cap and fixed-value special — full breakdown parity', async () => {
    await scoreParity({ hand: { sets: [set('1', 'kong', dragon('red')), set('2', 'kong', wind('east')), set('3', 'pung', suited('bamboo', 1)), set('4', 'pung', suited('bamboo', 9), 'exposed'), set('5', 'pair', suited('bamboo', 5))], bonusTiles: [bonus('flower', 1), bonus('flower', 2), bonus('flower', 3), bonus('flower', 4)], isWinner: true }, playerWind: 'east', prevailingWind: 'east' });
    await scoreParity({ hand: { sets: [set('1', 'pung', wind('east')), set('2', 'pung', wind('south')), set('3', 'pung', dragon('red')), set('4', 'pung', dragon('green')), set('5', 'pair', dragon('white'))], bonusTiles: [], isWinner: true }, playerWind: 'east', prevailingWind: 'east' });
  });

  it("scoring/score.test.ts Heaven's Blessing — context-sensitive special parity", async () => {
    await scoreParity({ hand: { sets: [set('1', 'pung', dragon('red')), set('2', 'pung', suited('bamboo', 2)), set('3', 'pung', suited('bamboo', 3)), set('4', 'pung', suited('bamboo', 4)), set('pair', 'pair', suited('bamboo', 5))], bonusTiles: [], isWinner: true, winningMethod: 'initial-deal' }, playerWind: 'east', prevailingWind: 'south' });
  });

  it('scoring/golden-fixtures.test.ts North Thirteen Unique Wonders fishing — full breakdown parity', async () => {
    await scoreParity({ hand: { sets: [], looseTiles: [suited('bamboo', 1), suited('bamboo', 9), suited('characters', 1), suited('characters', 9), suited('circles', 1), suited('circles', 9), wind('east'), wind('south'), wind('west'), wind('north'), dragon('red'), dragon('green'), dragon('white')], bonusTiles: [bonus('flower', 4), bonus('season', 2)], isWinner: false, originalCall: false }, playerWind: 'north', prevailingWind: 'east' });
  });

  it('scoring/unfinished-hands.test.ts one entered Pung — partial evidence remains scored', async () => {
    const input = { hand: { sets: [set('bamboo-pung', 'pung', suited('bamboo', 2))], bonusTiles: [], isWinner: false }, playerWind: 'east' as const, prevailingWind: 'east' as const };
    const { legacy, runtime } = await harness;
    await scoreParity(input);
    expect(runtime.scoreHand(platformScoreInput(legacy, input)).disposition).toEqual({ kind: 'scored' });
  });

  it('scoring/unfinished-hands.test.ts partial bamboo groups — does not infer Purity, special or fishing', async () => {
    await scoreParity({ hand: { sets: [set('two', 'pung', suited('bamboo', 2)), set('three', 'pung', suited('bamboo', 3)), set('four', 'pung', suited('bamboo', 4)), set('pair', 'pair', suited('bamboo', 8))], bonusTiles: [], isWinner: false }, playerWind: 'east', prevailingWind: 'east' });
  });

  it('scoring/golden-fixtures.test.ts impossible physical copies — validation parity', async () => {
    const input = { hand: { sets: [], looseTiles: [...Array.from({ length: 6 }, () => suited('characters', 1)), ...Array.from({ length: 4 }, () => suited('bamboo', 1)), ...Array.from({ length: 4 }, () => suited('circles', 1))], bonusTiles: [], isWinner: true }, playerWind: 'east' as const, prevailingWind: 'east' as const };
    const { legacy, runtime } = await harness;
    expect(runtime.validateHand(platformScoreInput(legacy, input))).toEqual(legacy.scoreHand(input).validationErrors);
    await scoreParity(input);
  });

  it('game/settlement.test.ts loser-to-loser score difference — settlement parity', async () => {
    const { legacy, runtime } = await harness;
    const round = { outcome: { type: 'win' as const, winnerId: 'jack' }, scores: { bill: 300, rod: 100, ben: 200, jack: 50 } };
    const direct = legacy.settleRound(players, seats, round); const platform = runtime.settleRound({ players, seats, round });
    expect(projectSettlementTransactions(platform)).toEqual(direct.transactions);
    expect(aggregateTransactionEffects(players.map(({ id }) => id), platform)).toEqual(direct.changes);
  });

  it('game/progression.test.ts East retention and prevailing-Wind advancement — progression parity', async () => {
    const { legacy, runtime } = await harness;
    for (const outcome of [{ type: 'win' as const, winnerId: 'a' }, { type: 'draw' as const }]) {
      const direct = legacy.progressGame(progressionPlayers, initial, outcome); const platform = runtime.progressGame({ players: progressionPlayers, current: initial, outcome });
      expect(platform.nextState).toEqual({ seats: direct.seats, prevailingWind: direct.prevailingWind, eastCycleStartPlayerId: direct.eastCycleStartPlayerId });
    }
    let current = initial;
    for (const winnerId of ['c', 'd', 'a', 'b']) {
      const outcome = { type: 'win' as const, winnerId };
      const direct = legacy.progressGame(progressionPlayers, current, outcome);
      const platform = runtime.progressGame({ players: progressionPlayers, current, outcome });
      expect(platform.nextState).toEqual({ seats: direct.seats, prevailingWind: direct.prevailingWind, eastCycleStartPlayerId: direct.eastCycleStartPlayerId });
      if (winnerId === 'b') expect(platform.reasonId).toBe('progression.classical-east-cycle.prevailing-wind-advanced');
      current = direct;
    }
    expect(current.prevailingWind).toBe('south');
  });

  it('game/game.test.ts full-game completion — observed game-end parity', async () => {
    const { runtime } = await harness; let game = createBmjaGame(players, seats, undefined, 'full-game'); const scores = { bill: 0, rod: 0, ben: 0, jack: 0 };
    for (let rotation = 0; rotation < 16; rotation += 1) { const winnerId = Object.entries(game.seats).find(([, seat]) => seat === 'south')?.[0]; if (!winnerId) throw new Error('Expected a South player.'); const previousPrevailingWind = game.prevailingWind; game = confirmHand(game, { outcome: { type: 'win', winnerId }, scores }); if (rotation === 15) expect(runtime.evaluateGameEnd({ gameLength: 'full-game', previousPrevailingWind, progression: { prevailingWindAdvanced: true } })).toEqual({ complete: game.isComplete, reasonId: 'game-end.classical-east-cycle.full-game-complete' }); }
    expect(game.isComplete).toBe(true);
  });
});
