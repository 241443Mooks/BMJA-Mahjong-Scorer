import { describe, expect, it } from 'vitest';
import { bonus, dragon, set, suited, wind, type MahjongHand } from '../scoring';
import { confirmHand, createBmjaGame } from '../game/game';
import { BMJA_PROFILE_REF } from '../game/ruleset';
import type { GamePlayer, ProgressionState, SeatAssignments } from '../game/types';
import {
  aggregateTransactionEffects,
  createParityHarness,
  jsonNormalise,
  platformScoreInput,
  projectSettlementTransactions,
  runtimeBreakdown,
} from './parity-harness.test-support';

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
