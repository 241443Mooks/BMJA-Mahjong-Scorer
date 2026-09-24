import { RegistryBank, type RegistryEntry } from './registry';
import type {
  ExecutableRegistryIdentity,
  HandScoreResult,
  LedgerPartyId,
  RoundResolution,
  SettlementStrategy,
  SettlementTransaction,
} from './types';

const deterministic = { kind: 'deterministic', dependencies: [] } as const;

export const mcrStrategyRegistryEntries: readonly RegistryEntry[] = [
  { id: 'settlement.mcr-2006', category: 'settlement', status: 'executable', semanticRevision: 1, executableContract: deterministic },
];

export const mcrStrategyRegistry = new RegistryBank(mcrStrategyRegistryEntries);

export type McrRoundOutcome =
  | {
      kind: 'mcr-win';
      payload: {
        winnerId: string;
        winSource: 'discard' | 'self-draw';
        discarderId?: string;
      };
    }
  | { kind: 'mcr-draw'; payload: {} };

export type McrAcceptedScore = {
  playerId: string;
  score: Extract<HandScoreResult, { grammar: 'pattern-accumulator' }>;
};

export type McrRoundResolution = RoundResolution<McrRoundOutcome, McrAcceptedScore>;

export type McrSettlementInput = {
  participants: readonly LedgerPartyId[];
  round: McrRoundResolution;
};

export const MCR_2006_SETTLEMENT: ExecutableRegistryIdentity = {
  id: 'settlement.mcr-2006',
  semanticRevision: 1,
};

const failClosed = (): never => { throw new Error('Invalid MCR settlement input'); };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const validateParticipants = (participants: readonly LedgerPartyId[]) => {
  if (!Array.isArray(participants) || participants.length !== 4) failClosed();
  const seen = new Set<string>();
  for (const participant of participants) {
    if (typeof participant !== 'string' || participant.length === 0 || seen.has(participant)) failClosed();
    seen.add(participant);
  }
};

const validateAcceptedScore = (record: unknown, winnerId: string) => {
  if (!isRecord(record) || record.playerId !== winnerId) failClosed();
  const recordObject = record as Record<string, unknown>;
  const scoreValue: unknown = recordObject.score;
  if (!isRecord(scoreValue)) failClosed();
  const score = scoreValue as Record<string, unknown>;
  if (score.grammar !== 'pattern-accumulator' || !isRecord(score.result)) failClosed();
  const result = score.result as Record<string, unknown>;
  if (result.unit !== 'points' || typeof result.total !== 'number' || !Number.isFinite(result.total) || !Number.isInteger(result.total)) failClosed();
  return {
    score: score as unknown as Extract<HandScoreResult, { grammar: 'pattern-accumulator' }>,
    basicPoints: result.total,
    legal: score.legal,
    disposition: score.disposition,
  };
};

export const settleMcr2006: SettlementStrategy<McrSettlementInput> = (input) => {
  if (!isRecord(input) || !Array.isArray(input.participants) || !isRecord(input.round)) failClosed();
  const inputObject = input as unknown as Record<string, unknown>;
  const participants = inputObject.participants as readonly LedgerPartyId[];
  validateParticipants(participants);

  const round = inputObject.round as Record<string, unknown>;
  const outcomeValue: unknown = round.outcome;
  const acceptedScoresValue: unknown = round.acceptedScores;
  if (!isRecord(outcomeValue) || !isRecord(outcomeValue.payload) || !Array.isArray(acceptedScoresValue)) failClosed();
  const outcome = outcomeValue as Record<string, unknown>;
  const acceptedScores = acceptedScoresValue as unknown[];
  const payload = outcome.payload as Record<string, unknown>;

  if (outcome.kind === 'mcr-draw') {
    if (acceptedScores.length !== 0 || Object.keys(payload).length !== 0) failClosed();
    return [];
  }
  if (outcome.kind !== 'mcr-win') failClosed();

  const winnerIdValue = payload.winnerId;
  const winSourceValue = payload.winSource;
  if (typeof winnerIdValue !== 'string' || !participants.includes(winnerIdValue)) failClosed();
  if (winSourceValue !== 'discard' && winSourceValue !== 'self-draw') failClosed();
  const winnerId = winnerIdValue as string;
  const winSource = winSourceValue as 'discard' | 'self-draw';
  if (acceptedScores.length !== 1) failClosed();
  const accepted = validateAcceptedScore(acceptedScores[0], winnerId);

  let discarderId: string | undefined;
  if (winSource === 'discard') {
    const discarderValue = payload.discarderId;
    if (typeof discarderValue !== 'string' || !participants.includes(discarderValue) || discarderValue === winnerId) failClosed();
    discarderId = discarderValue as string;
  } else if (winSource === 'self-draw') {
    if (Object.prototype.hasOwnProperty.call(payload, 'discarderId')) failClosed();
  } else {
    failClosed();
  }

  if (accepted.legal !== true || !isRecord(accepted.disposition) || accepted.disposition.kind !== 'scored') return [];

  const basicPoints = accepted.basicPoints as number;
  const metadata = (payerRole: 'discarder' | 'other-player' | 'non-winner') => ({
    basicPoints,
    fixedComponent: 8,
    winSource,
    payerRole,
  });
  const pay = (from: string, amount: number, reasonId: string, payerRole: 'discarder' | 'other-player' | 'non-winner'): SettlementTransaction => ({
    from,
    to: winnerId,
    amount,
    reasonId,
    metadata: metadata(payerRole),
  });

  if (winSource === 'discard') {
    return participants
      .filter((participant) => participant !== winnerId)
      .map((participant) => participant === discarderId
        ? pay(participant, 8 + basicPoints, 'settlement.mcr-2006.discarder-payment', 'discarder')
        : pay(participant, 8, 'settlement.mcr-2006.other-player-base-payment', 'other-player'));
  }

  return participants
    .filter((participant) => participant !== winnerId)
    .map((participant) => pay(participant, 8 + basicPoints, 'settlement.mcr-2006.self-draw-payment', 'non-winner'));
};

const keyFor = ({ id, semanticRevision }: ExecutableRegistryIdentity) => `${id}@${semanticRevision}`;
const implementations = new Map<string, unknown>([[keyFor(MCR_2006_SETTLEMENT), settleMcr2006]]);

export const mcrSettlementImplementation = (identity: ExecutableRegistryIdentity) => {
  mcrStrategyRegistry.requireExecutable('settlement', identity.id);
  const implementation = implementations.get(keyFor(identity));
  if (!implementation) throw new Error(`Unknown MCR strategy implementation: ${keyFor(identity)}`);
  return implementation as SettlementStrategy<McrSettlementInput>;
};
