import { progressBmjaGame } from '../game/progression';
import { settleBmjaRound } from '../game/settlement';
import type {
  GameLength,
  GamePlayer,
  HandMode,
  HandOutcome,
  ProgressionResult,
  ProgressionState,
  RoundInput,
  SeatAssignments,
} from '../game/types';
import { RegistryBank, type RegistryEntry } from './registry';
import type {
  ExecutableRegistryIdentity,
  ExplainedProgressionResult,
  GameEndResult,
  GameEndStrategy,
  HandModeStrategy,
  JsonObject,
  ProgressionStrategy,
  SettlementStrategy,
  SettlementTransaction,
} from './types';

const deterministic = { kind: 'deterministic', dependencies: [] } as const;

/**
 * Current-runtime identities deliberately live beside, rather than replacing,
 * architecture-only seed entries. The bank only accepts this exact revision.
 */
export const classicalStrategyRegistryEntries: readonly RegistryEntry[] = [
  { id: 'settlement.classical-pairwise', category: 'settlement', status: 'executable', semanticRevision: 1, executableContract: deterministic },
  { id: 'progression.classical-east-cycle', category: 'progression', status: 'executable', semanticRevision: 1, executableContract: deterministic },
  { id: 'game-end.classical-east-cycle', category: 'game-end', status: 'executable', semanticRevision: 1, executableContract: deterministic },
  { id: 'hand-mode.none', category: 'hand-mode', status: 'executable', semanticRevision: 1, executableContract: deterministic },
];

export const classicalStrategyRegistry = new RegistryBank(classicalStrategyRegistryEntries);

type StrategyCategory = 'settlement' | 'progression' | 'game-end' | 'hand-mode';
export type StrategyRegistryIdentity<C extends StrategyCategory> =
  ExecutableRegistryIdentity & { id: `${C}.${string}` };

export const CLASSICAL_PAIRWISE_SETTLEMENT: StrategyRegistryIdentity<'settlement'> = {
  id: 'settlement.classical-pairwise', semanticRevision: 1,
};
export const CLASSICAL_EAST_CYCLE_PROGRESSION: StrategyRegistryIdentity<'progression'> = {
  id: 'progression.classical-east-cycle', semanticRevision: 1,
};
export const CLASSICAL_EAST_CYCLE_GAME_END: StrategyRegistryIdentity<'game-end'> = {
  id: 'game-end.classical-east-cycle', semanticRevision: 1,
};
export const NO_HAND_MODE: StrategyRegistryIdentity<'hand-mode'> = {
  id: 'hand-mode.none', semanticRevision: 1,
};

type ClassicalSettlementInput = {
  players: GamePlayer[];
  seats: SeatAssignments;
  round: RoundInput;
};

const legacyReasonId = (reason: ReturnType<typeof settleBmjaRound>['transactions'][number]['reason']) =>
  `settlement.classical-pairwise.${reason}`;

/** Maps the legacy British ledger verbatim into the neutral transaction envelope. */
export const settleClassicalPairwise: SettlementStrategy<ClassicalSettlementInput> = ({
  players,
  seats,
  round,
}) => settleBmjaRound(players, seats, round).transactions.map((transaction) => ({
  from: transaction.fromPlayerId,
  to: transaction.toPlayerId,
  amount: transaction.amount,
  reasonId: legacyReasonId(transaction.reason),
  metadata: {
    baseAmount: transaction.baseAmount,
    eastMultiplier: transaction.eastMultiplier,
    legacyReason: transaction.reason,
  },
}));

type ClassicalProgressionInput = {
  players: GamePlayer[];
  current: ProgressionState;
  outcome: HandOutcome;
};

const progressionReasonId = (
  outcome: HandOutcome,
  progression: ProgressionResult,
): string => {
  if (progression.prevailingWindAdvanced) {
    return 'progression.classical-east-cycle.prevailing-wind-advanced';
  }
  if (outcome.type === 'draw') return 'progression.classical-east-cycle.east-retained-after-draw';
  return progression.seatsRotated
    ? 'progression.classical-east-cycle.east-passed-after-non-east-win'
    : 'progression.classical-east-cycle.east-retained-after-east-win';
};

export const progressClassicalEastCycle: ProgressionStrategy<
  ClassicalProgressionInput,
  ProgressionState
> = ({ players, current, outcome }): ExplainedProgressionResult<ProgressionState> => {
  const next = progressBmjaGame(players, current, outcome);
  const metadata: JsonObject = {
    outcomeType: outcome.type,
    seatsRotated: next.seatsRotated,
    prevailingWindAdvanced: next.prevailingWindAdvanced,
    previousPrevailingWind: current.prevailingWind,
    nextPrevailingWind: next.prevailingWind,
  };
  if (outcome.type === 'win') metadata.winnerId = outcome.winnerId;
  return {
    nextState: {
      seats: next.seats,
      prevailingWind: next.prevailingWind,
      eastCycleStartPlayerId: next.eastCycleStartPlayerId,
    },
    reasonId: progressionReasonId(outcome, next),
    metadata,
  };
};

export type ClassicalGameEndInput = {
  gameLength: GameLength;
  previousPrevailingWind: ProgressionState['prevailingWind'];
  progression: Pick<ProgressionResult, 'prevailingWindAdvanced'>;
};

/** Mirrors the inline legacy completion predicate without changing its caller. */
export const determineClassicalEastCycleGameEnd: GameEndStrategy<ClassicalGameEndInput> = ({
  gameLength,
  previousPrevailingWind,
  progression,
}): GameEndResult => {
  const complete = progression.prevailingWindAdvanced && (
    gameLength === 'one-round' ||
    (gameLength === 'full-game' && previousPrevailingWind === 'north')
  );
  return {
    complete,
    reasonId: complete
      ? gameLength === 'one-round'
        ? 'game-end.classical-east-cycle.one-round-complete'
        : 'game-end.classical-east-cycle.full-game-complete'
      : 'game-end.classical-east-cycle.continues',
  };
};

export const selectNoHandMode: HandModeStrategy<Record<string, never>, HandMode> = () => 'normal';

const keyFor = ({ id, semanticRevision }: ExecutableRegistryIdentity) => `${id}@${semanticRevision}`;
const implementations = new Map<string, unknown>([
  [keyFor(CLASSICAL_PAIRWISE_SETTLEMENT), settleClassicalPairwise],
  [keyFor(CLASSICAL_EAST_CYCLE_PROGRESSION), progressClassicalEastCycle],
  [keyFor(CLASSICAL_EAST_CYCLE_GAME_END), determineClassicalEastCycleGameEnd],
  [keyFor(NO_HAND_MODE), selectNoHandMode],
]);

function implementation<C extends StrategyCategory, T>(
  category: C,
  identity: StrategyRegistryIdentity<C>,
): T {
  classicalStrategyRegistry.requireExecutable(category, identity.id);
  const value = implementations.get(keyFor(identity));
  if (!value) throw new Error(`Unknown current strategy implementation: ${keyFor(identity)}`);
  return value as T;
}

export const settlementImplementation = (identity: StrategyRegistryIdentity<'settlement'>) =>
  implementation<'settlement', SettlementStrategy<ClassicalSettlementInput>>('settlement', identity);
export const progressionImplementation = (identity: StrategyRegistryIdentity<'progression'>) =>
  implementation<'progression', ProgressionStrategy<ClassicalProgressionInput, ProgressionState>>('progression', identity);
export const gameEndImplementation = (identity: StrategyRegistryIdentity<'game-end'>) =>
  implementation<'game-end', GameEndStrategy<ClassicalGameEndInput>>('game-end', identity);
export const handModeImplementation = (identity: StrategyRegistryIdentity<'hand-mode'>) =>
  implementation<'hand-mode', HandModeStrategy<Record<string, never>, HandMode>>('hand-mode', identity);
