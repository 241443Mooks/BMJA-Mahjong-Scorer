import { describe, expect, it } from 'vitest';
import { progressBmjaGame } from '../game/progression';
import { settleBmjaRound } from '../game/settlement';
import type { GamePlayer, ProgressionResult, ProgressionState, SeatAssignments } from '../game/types';
import {
  CLASSICAL_EAST_CYCLE_GAME_END,
  CLASSICAL_EAST_CYCLE_PROGRESSION,
  CLASSICAL_PAIRWISE_SETTLEMENT,
  NO_HAND_MODE,
  classicalStrategyRegistry,
  determineClassicalEastCycleGameEnd,
  gameEndImplementation,
  handModeImplementation,
  progressClassicalEastCycle,
  progressionImplementation,
  selectNoHandMode,
  settleClassicalPairwise,
  settlementImplementation,
} from './classical-strategies';
import { executableIdentity } from './registry';

const players: GamePlayer[] = [
  { id: 'a', name: 'A' },
  { id: 'b', name: 'B' },
  { id: 'c', name: 'C' },
  { id: 'd', name: 'D' },
];
const seats: SeatAssignments = { a: 'east', b: 'south', c: 'west', d: 'north' };
const current: ProgressionState = {
  seats,
  prevailingWind: 'east',
  eastCycleStartPlayerId: 'a',
};

const effects = (transactions: readonly { from: string; to: string; amount: number }[]) =>
  Object.fromEntries(players.map(({ id }) => [id, transactions.reduce(
    (total, transaction) => total + (transaction.to === id ? transaction.amount : 0) - (transaction.from === id ? transaction.amount : 0),
    0,
  )]));

describe('current Classical strategy adapters', () => {
  it('preserves direct BMJA settlement balance effects and records British audit data neutrally', () => {
    const round = {
      outcome: { type: 'win' as const, winnerId: 'b' },
      scores: { a: 100, b: 200, c: 300, d: 400 },
    };
    const direct = settleBmjaRound(players, seats, round);
    const adapted = settleClassicalPairwise({ players, seats, round });

    expect(effects(adapted)).toEqual(direct.changes);
    expect(adapted).toEqual(expect.arrayContaining([
      expect.objectContaining({
        from: 'a', to: 'b', amount: 400,
        reasonId: 'settlement.classical-pairwise.winner-payment',
        metadata: { baseAmount: 200, eastMultiplier: 2, legacyReason: 'winner-payment' },
      }),
    ]));
  });

  it.each([
    [{ type: 'win' as const, winnerId: 'c' }, 'progression.classical-east-cycle.east-passed-after-non-east-win'],
    [{ type: 'win' as const, winnerId: 'a' }, 'progression.classical-east-cycle.east-retained-after-east-win'],
    [{ type: 'draw' as const }, 'progression.classical-east-cycle.east-retained-after-draw'],
  ])('matches direct progression for %o', (outcome, reasonId) => {
    const direct = progressBmjaGame(players, current, outcome);
    const adapted = progressClassicalEastCycle({ players, current, outcome });

    expect(adapted.nextState).toEqual({
      seats: direct.seats,
      prevailingWind: direct.prevailingWind,
      eastCycleStartPlayerId: direct.eastCycleStartPlayerId,
    });
    expect(adapted.reasonId).toBe(reasonId);
    expect(adapted.metadata).toMatchObject({
      seatsRotated: direct.seatsRotated,
      prevailingWindAdvanced: direct.prevailingWindAdvanced,
    });
  });

  it('matches direct prevailing-wind advancement and explains it', () => {
    let direct: ProgressionResult = { ...current, seatsRotated: false, prevailingWindAdvanced: false };
    let adapted = current;
    for (const winnerId of ['c', 'd', 'a', 'b']) {
      direct = progressBmjaGame(players, direct, { type: 'win', winnerId });
      const result = progressClassicalEastCycle({ players, current: adapted, outcome: { type: 'win', winnerId } });
      adapted = result.nextState;
      if (direct.prevailingWindAdvanced) {
        expect(result.reasonId).toBe('progression.classical-east-cycle.prevailing-wind-advanced');
      }
    }
    expect(adapted).toEqual({ seats: direct.seats, prevailingWind: direct.prevailingWind, eastCycleStartPlayerId: direct.eastCycleStartPlayerId });
  });

  it('reproduces the legacy one-round and full-game completion boundary', () => {
    expect(determineClassicalEastCycleGameEnd({
      gameLength: 'one-round', previousPrevailingWind: 'east', progression: { prevailingWindAdvanced: true },
    })).toEqual({ complete: true, reasonId: 'game-end.classical-east-cycle.one-round-complete' });
    expect(determineClassicalEastCycleGameEnd({
      gameLength: 'full-game', previousPrevailingWind: 'south', progression: { prevailingWindAdvanced: true },
    })).toEqual({ complete: false, reasonId: 'game-end.classical-east-cycle.continues' });
    expect(determineClassicalEastCycleGameEnd({
      gameLength: 'full-game', previousPrevailingWind: 'north', progression: { prevailingWindAdvanced: true },
    })).toEqual({ complete: true, reasonId: 'game-end.classical-east-cycle.full-game-complete' });
  });

  it('uses only exact executable identities and the normal hand mode', () => {
    expect(executableIdentity(classicalStrategyRegistry.requireExecutable('settlement', CLASSICAL_PAIRWISE_SETTLEMENT.id))).toEqual(CLASSICAL_PAIRWISE_SETTLEMENT);
    expect(executableIdentity(classicalStrategyRegistry.requireExecutable('progression', CLASSICAL_EAST_CYCLE_PROGRESSION.id))).toEqual(CLASSICAL_EAST_CYCLE_PROGRESSION);
    expect(executableIdentity(classicalStrategyRegistry.requireExecutable('game-end', CLASSICAL_EAST_CYCLE_GAME_END.id))).toEqual(CLASSICAL_EAST_CYCLE_GAME_END);
    expect(executableIdentity(classicalStrategyRegistry.requireExecutable('hand-mode', NO_HAND_MODE.id))).toEqual(NO_HAND_MODE);
    expect(settlementImplementation(CLASSICAL_PAIRWISE_SETTLEMENT)).toBe(settleClassicalPairwise);
    expect(progressionImplementation(CLASSICAL_EAST_CYCLE_PROGRESSION)).toBe(progressClassicalEastCycle);
    expect(gameEndImplementation(CLASSICAL_EAST_CYCLE_GAME_END)).toBe(determineClassicalEastCycleGameEnd);
    expect(handModeImplementation(NO_HAND_MODE)).toBe(selectNoHandMode);
    expect(selectNoHandMode({})).toBe('normal');
    expect(() => progressionImplementation({ id: 'progression.classical-east-cycle', semanticRevision: 2 })).toThrow('Unknown current strategy implementation');
  });
});
