import {
  prepareOutsideTheBoxRound,
  settleOutsideTheBoxRound,
} from '../game/outside-the-box-incidents';
import type {
  GamePlayer,
  HandMode,
  HandOutcome,
  RoundInput,
  SeatAssignments,
} from '../game/types';
import { RegistryBank, type RegistryEntry } from './registry';
import type {
  HandModeStrategy,
  RoundPreparationStrategy,
  SettlementStrategy,
  SettlementTransaction,
} from './types';
import type { StrategyRegistryIdentity } from './classical-strategies';

const deterministic = { kind: 'deterministic', dependencies: [] } as const;

export const outsideTheBoxStrategyRegistryEntries: readonly RegistryEntry[] = [
  { id: 'settlement.outside-the-box-incidents', category: 'settlement', status: 'executable', semanticRevision: 1, parameterSchemaId: 'params.settlement.outside-the-box-incidents@1', executableContract: deterministic },
  { id: 'incident.outside-the-box-round-preparation', category: 'incident', status: 'executable', semanticRevision: 1, executableContract: deterministic },
  { id: 'hand-mode.outside-the-box-goulash', category: 'hand-mode', status: 'executable', semanticRevision: 1, executableContract: deterministic },
];

export const outsideTheBoxStrategyRegistry = new RegistryBank(outsideTheBoxStrategyRegistryEntries);

export const OUTSIDE_THE_BOX_SETTLEMENT: StrategyRegistryIdentity<'settlement'> = {
  id: 'settlement.outside-the-box-incidents', semanticRevision: 1,
};
export const OUTSIDE_THE_BOX_ROUND_PREPARATION: StrategyRegistryIdentity<'incident'> = {
  id: 'incident.outside-the-box-round-preparation', semanticRevision: 1,
};
export const OUTSIDE_THE_BOX_GOULASH_HAND_MODE: StrategyRegistryIdentity<'hand-mode'> = {
  id: 'hand-mode.outside-the-box-goulash', semanticRevision: 1,
};

export type OutsideTheBoxSettlementInput = {
  players: GamePlayer[];
  seats: SeatAssignments;
  round: RoundInput;
  limit: number;
};

export type OutsideTheBoxRoundPreparationInput = Pick<
  OutsideTheBoxSettlementInput,
  'players' | 'seats' | 'round'
>;

const incidentTypes = (round: RoundInput) =>
  (round.incidents ?? []).map((incident) => incident.type);

const reasonId = (reason: ReturnType<typeof settleOutsideTheBoxRound>['transactions'][number]['reason']) =>
  `settlement.outside-the-box-incidents.${reason}`;

/** Losslessly maps the direct OTB ledger, including its source-backed incident routing. */
export const settleOutsideTheBox: SettlementStrategy<OutsideTheBoxSettlementInput> = ({
  players,
  seats,
  round,
  limit,
}) => settleOutsideTheBoxRound(players, seats, round, limit).transactions.map((transaction) => ({
  from: transaction.fromPlayerId,
  to: transaction.toPlayerId,
  amount: transaction.amount,
  reasonId: reasonId(transaction.reason),
  metadata: {
    baseAmount: transaction.baseAmount,
    eastMultiplier: transaction.eastMultiplier,
    legacyReason: transaction.reason,
    incidentTypes: incidentTypes(round),
  },
}));

/** Preparation stays separate from settlement and scoring, just as in the legacy flow. */
export const prepareOutsideTheBox: RoundPreparationStrategy<
  OutsideTheBoxRoundPreparationInput,
  RoundInput
> = ({ players, seats, round }) => prepareOutsideTheBoxRound(players, seats, round);

export const selectOutsideTheBoxHandMode: HandModeStrategy<
  { current: HandMode; outcome: HandOutcome },
  HandMode
> = ({ outcome }) => outcome.type === 'draw' ? 'goulash' : 'normal';

const keyFor = (identity: StrategyRegistryIdentity<string>) =>
  `${identity.id}@${identity.semanticRevision}`;
const implementations = new Map<string, unknown>([
  [keyFor(OUTSIDE_THE_BOX_SETTLEMENT), settleOutsideTheBox],
  [keyFor(OUTSIDE_THE_BOX_ROUND_PREPARATION), prepareOutsideTheBox],
  [keyFor(OUTSIDE_THE_BOX_GOULASH_HAND_MODE), selectOutsideTheBoxHandMode],
]);

function implementation<C extends 'settlement' | 'incident' | 'hand-mode', T>(
  category: C,
  identity: StrategyRegistryIdentity<C>,
): T {
  outsideTheBoxStrategyRegistry.requireExecutable(category, identity.id);
  const value = implementations.get(keyFor(identity));
  if (!value) throw new Error(`Unknown Outside the Box strategy implementation: ${keyFor(identity)}`);
  return value as T;
}

export const outsideTheBoxSettlementImplementation = (
  identity: StrategyRegistryIdentity<'settlement'>,
) => implementation<'settlement', SettlementStrategy<OutsideTheBoxSettlementInput>>('settlement', identity);
export const outsideTheBoxRoundPreparationImplementation = (
  identity: StrategyRegistryIdentity<'incident'>,
) => implementation<'incident', RoundPreparationStrategy<OutsideTheBoxRoundPreparationInput, RoundInput>>('incident', identity);
export const outsideTheBoxHandModeImplementation = (
  identity: StrategyRegistryIdentity<'hand-mode'>,
) => implementation<'hand-mode', HandModeStrategy<{ current: HandMode; outcome: HandOutcome }, HandMode>>('hand-mode', identity);
