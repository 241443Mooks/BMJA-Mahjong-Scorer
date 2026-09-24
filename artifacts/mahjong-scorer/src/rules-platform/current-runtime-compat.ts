import type {
  ProgressionResult,
  ProgressionState,
  SettlementResult,
  SettlementTransaction as LegacySettlementTransaction,
} from '../game/types';
import type { ScoreBreakdown } from '../scoring';
import type {
  ExplainedProgressionResult,
  HandScoreResult,
  JsonObject,
  SettlementTransaction,
} from './types';

const compatibilityFailure = (code: string): never => {
  throw new Error(`CURRENT_RUNTIME_COMPAT_INVALID:${code}`);
};

const requiredMetadata = (metadata: JsonObject | undefined): JsonObject => {
  if (!metadata) return compatibilityFailure('METADATA_REQUIRED');
  return metadata;
};

const settlementTransaction = (transaction: SettlementTransaction): LegacySettlementTransaction => {
  const metadata = requiredMetadata(transaction.metadata);
  const { baseAmount, eastMultiplier, legacyReason } = metadata;
  if (typeof transaction.from !== 'string' || typeof transaction.to !== 'string' ||
    !Number.isFinite(transaction.amount) || typeof baseAmount !== 'number' ||
    !Number.isFinite(baseAmount) || (eastMultiplier !== 1 && eastMultiplier !== 2) ||
    typeof legacyReason !== 'string') {
    return compatibilityFailure('SETTLEMENT_METADATA');
  }
  return {
    fromPlayerId: transaction.from,
    toPlayerId: transaction.to,
    amount: transaction.amount,
    baseAmount,
    eastMultiplier,
    reason: legacyReason as LegacySettlementTransaction['reason'],
  };
};

/** Projects neutral ledger effects into the still-public legacy settlement shape. */
export const mapCurrentRuntimeSettlement = (
  playerIds: readonly string[],
  transactions: readonly SettlementTransaction[],
): SettlementResult => {
  const changes = Object.fromEntries(playerIds.map((id) => [id, 0]));
  if (new Set(playerIds).size !== playerIds.length) return compatibilityFailure('DUPLICATE_PLAYER');
  const projected = transactions.map((transaction) => {
    const legacy = settlementTransaction(transaction);
    if (!(legacy.fromPlayerId in changes) || !(legacy.toPlayerId in changes)) {
      return compatibilityFailure('SETTLEMENT_PLAYER');
    }
    changes[legacy.fromPlayerId]! -= legacy.amount;
    changes[legacy.toPlayerId]! += legacy.amount;
    return legacy;
  });
  const zeroSum = Object.values(changes).every(Number.isFinite) &&
    Object.values(changes).reduce((sum, change) => sum + change, 0) === 0;
  return { transactions: projected, changes, zeroSum };
};

/** Adds only the certified explanatory flags to an already-selected next state. */
export const mapCurrentRuntimeProgression = (
  progression: ExplainedProgressionResult<ProgressionState>,
): ProgressionResult => {
  const metadata = requiredMetadata(progression.metadata);
  if (typeof metadata.seatsRotated !== 'boolean' || typeof metadata.prevailingWindAdvanced !== 'boolean') {
    return compatibilityFailure('PROGRESSION_METADATA');
  }
  return {
    ...progression.nextState,
    seatsRotated: metadata.seatsRotated,
    prevailingWindAdvanced: metadata.prevailingWindAdvanced,
  };
};

/** Unwraps the current Classical JSON-safe result without making scoring decisions. */
export const mapCurrentClassicalScoreBreakdown = (result: HandScoreResult): ScoreBreakdown => {
  if (result.grammar !== 'classical-points-doubles' || !result.result ||
    typeof result.result !== 'object' || Array.isArray(result.result)) {
    return compatibilityFailure('CLASSICAL_BREAKDOWN');
  }
  const breakdown = (result.result as JsonObject).breakdown;
  if (!breakdown || typeof breakdown !== 'object' || Array.isArray(breakdown)) {
    return compatibilityFailure('CLASSICAL_BREAKDOWN');
  }
  return breakdown as unknown as ScoreBreakdown;
};
