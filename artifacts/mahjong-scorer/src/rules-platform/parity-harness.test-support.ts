import { resolveRulesProfile } from '../game/ruleset';
import type {
  GameRuleset,
  HandScoreInput,
  PlayerAmounts,
  RulesProfileRef,
} from '../game/types';
import type { ScoreBreakdown } from '../scoring';
import { compileRulesRuntime, type RulesRuntime } from './classical-runtime';
import { currentPlayableResolverEnvironment } from './current-profiles';
import { resolvePlayableProfile } from './resolver';

export type ParityHarness = Readonly<{
  legacy: GameRuleset;
  runtime: RulesRuntime;
}>;

/** Resolves the current legacy ruleset beside its sealed, compiled successor. */
export const createParityHarness = async (profile: RulesProfileRef): Promise<ParityHarness> => ({
  legacy: resolveRulesProfile(profile),
  runtime: compileRulesRuntime(await resolvePlayableProfile(profile, currentPlayableResolverEnvironment)),
});

/** Applies the runtime boundary's JSON omission semantics before equality checks. */
export const jsonNormalise = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const platformScoreInput = (legacy: GameRuleset, input: HandScoreInput) => ({
  evidence: input.hand,
  context: {
    playerWind: input.playerWind,
    prevailingWind: input.prevailingWind,
    limit: input.limit ?? legacy.defaultLimit,
    handMode: input.handMode ?? 'normal',
  },
});

export const runtimeBreakdown = (
  legacy: GameRuleset,
  runtime: RulesRuntime,
  input: HandScoreInput,
): ScoreBreakdown => (
  runtime.scoreHand(platformScoreInput(legacy, input)).result as unknown as { breakdown: ScoreBreakdown }
).breakdown;

type LegacySettlementTransaction = {
  fromPlayerId: string;
  toPlayerId: string;
  amount: number;
  baseAmount: number;
  eastMultiplier: 1 | 2;
  reason: string;
};

/** Projects the neutral transaction envelope back to the legacy settlement facts. */
export const projectSettlementTransactions = (transactions: readonly {
  from: string;
  to: string;
  amount: number;
  metadata?: Record<string, unknown>;
}[]): LegacySettlementTransaction[] => transactions.map((transaction) => ({
  fromPlayerId: transaction.from,
  toPlayerId: transaction.to,
  amount: transaction.amount,
  baseAmount: transaction.metadata?.baseAmount as number,
  eastMultiplier: transaction.metadata?.eastMultiplier as 1 | 2,
  reason: transaction.metadata?.legacyReason as string,
}));

export const aggregateTransactionEffects = (
  playerIds: readonly string[],
  transactions: readonly { from: string; to: string; amount: number }[],
): PlayerAmounts => {
  const changes = Object.fromEntries(playerIds.map((id) => [id, 0])) as PlayerAmounts;
  for (const transaction of transactions) {
    changes[transaction.from] -= transaction.amount;
    changes[transaction.to] += transaction.amount;
  }
  return changes;
};
