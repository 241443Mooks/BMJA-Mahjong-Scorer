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

export const CLASSICAL_PAIRWISE_SETTLEMENT: ExecutableRegistryIdentity = {
  id: 'settlement.classical-pairwise', semanticRevision: 1,
};
export const CLASSICAL_EAST_CYCLE_PROGRESSION: ExecutableRegistryIdentity = {
  id: 'progression.classical-east-cycle', semanticRevision: 1,
};
export const CLASSICAL_EAST_CYCLE_GAME_END: ExecutableRegistryIdentity = {
  id: 'game-end.classical-east-cycle', semanticRevision: 1,
};
export const NO_HAND_MODE: ExecutableRegistryIdentity = {
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

function implementation<T>(identity: ExecutableRegistryIdentity): T {
  classicalStrategyRegistry.requireExecutable(
    identity.id.split('.')[0] as 'settlement' | 'progression' | 'game-end' | 'hand-mode',
    identity.id,
  );
  const value = implementations.get(keyFor(identity));
  if (!value) throw new Error(`Unknown current strategy implementation: ${keyFor(identity)}`);
  return value as T;
}

export const settlementImplementation = (identity: ExecutableRegistryIdentity) =>
  implementation<SettlementStrategy<ClassicalSettlementInput>>(identity);
export const progressionImplementation = (identity: ExecutableRegistryIdentity) =>
  implementation<ProgressionStrategy<ClassicalProgressionInput, ProgressionState>>(identity);
export const gameEndImplementation = (identity: ExecutableRegistryIdentity) =>
  implementation<GameEndStrategy<ClassicalGameEndInput>>(identity);
export const handModeImplementation = (identity: ExecutableRegistryIdentity) =>
  implementation<HandModeStrategy<Record<string, never>, HandMode>>(identity);
